'use server'

import { z } from 'zod'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { render } from '@react-email/components'
import { writeClient } from '@/sanity/lib/write'
import { client } from '@/sanity/lib/client'
import { razorpay } from '@/lib/razorpay/client'
import { verifyPaymentSignature } from '@/lib/razorpay/verify'
import { checkoutSchema, cartItemInputSchema } from '@/lib/checkout-schema'
import {
  PRODUCTS_BY_IDS_QUERY,
  ORDER_BY_NUMBER_QUERY,
  ORDER_BY_RAZORPAY_ORDER_ID_QUERY,
} from '@/sanity/lib/queries'
import { generateOrderNumber } from '@/lib/formatters'
import { resend } from '@/lib/email/resend'
import { OrderConfirmation } from '@/lib/email/templates/order-confirmation'
import { OrderAdmin } from '@/lib/email/templates/order-admin'
import { NewsletterWelcome } from '@/lib/email/templates/newsletter-welcome'

// ── createCheckoutOrder ───────────────────────────────────────────────────────

const createOrderInput = z.object({
  shippingInfo: checkoutSchema,
  items: z.array(cartItemInputSchema).min(1, 'Cart is empty'),
})

export type CreateOrderInput = z.infer<typeof createOrderInput>

export type CreateOrderResult =
  | {
    success: true
    razorpayOrderId: string
    amount: number
    currency: string
    orderNumber: string
    keyId: string
  }
  | { success: false; error: string }

export async function createCheckoutOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderInput.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { shippingInfo, items } = parsed.data

  // ── Validate shipping method from Sanity (never trust client price) ─────────
  const shippingMethod = await client.fetch<{
    _id: string; name: string; price: number; freeAboveOrderTotal?: number
  } | null>(
    `*[_type == "shippingMethod" && _id == $id && isEnabled == true][0]{
      _id, name, price, freeAboveOrderTotal
    }`,
    { id: shippingInfo.shippingMethodId },
    { cache: 'no-store' }
  )

  if (!shippingMethod) {
    return { success: false, error: 'Invalid shipping method. Please refresh and try again.' }
  }

  // ── Fetch fresh product data — never trust client prices ───────────────────
  const productIds = [...new Set(items.map((i) => i.productId))]
  const products: any[] = await client.fetch(PRODUCTS_BY_IDS_QUERY, { ids: productIds }, { cache: 'no-store' })

  if (!products?.length) {
    return { success: false, error: 'Products not found. Please refresh and try again.' }
  }

  // ── Validate each cart item against live Sanity data ───────────────────────
  type ValidatedItem = {
    productId: string
    productName: string
    colorVariant: string
    colorVariantSlug: string
    size: string
    qty: number
    priceSnapshot: number
    sku: string | null
  }

  const validatedItems: ValidatedItem[] = []

  for (const item of items) {
    const product = products.find((p) => p._id === item.productId)
    if (!product) {
      return { success: false, error: `Product no longer exists. Please refresh your cart.` }
    }

    const variant = product.colorVariants?.find((v: any) => v.slug === item.colorVariantSlug)
    if (!variant) {
      return { success: false, error: `Colour variant not found for "${product.name}".` }
    }

    const sizeEntry = variant.sizes?.find((s: any) => s.size === item.size)
    if (!sizeEntry) {
      return { success: false, error: `Size ${item.size} not found for "${product.name}".` }
    }

    if ((sizeEntry.stock ?? 0) < item.qty) {
      const available = sizeEntry.stock ?? 0
      return {
        success: false,
        error: `Only ${available} unit${available === 1 ? '' : 's'} of "${product.name}" (${variant.name} / ${item.size}) available.`,
      }
    }

    validatedItems.push({
      productId: product._id,
      productName: product.name,
      colorVariant: variant.name,
      colorVariantSlug: variant.slug,
      size: item.size,
      qty: item.qty,
      priceSnapshot: product.price,
      sku: sizeEntry.sku ?? null,
    })
  }

  // ── Server-calculated totals ───────────────────────────────────────────────
  const subtotal = validatedItems.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0)

  const shippingCost =
    shippingMethod.freeAboveOrderTotal && subtotal >= shippingMethod.freeAboveOrderTotal
      ? 0
      : shippingMethod.price

  // GST-inclusive: tax is already baked into prices (18% of subtotal)
  const taxAmount = Math.round((subtotal * 18 / 118) * 100) / 100

  const total = subtotal + shippingCost

  // ── Create Razorpay order (amount in paise) ────────────────────────────────
  let rzpOrder: any
  try {
    rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })
  } catch (err) {
    console.error('[checkout] Razorpay order creation failed:', err)
    return { success: false, error: 'Payment gateway error. Please try again.' }
  }

  const { userId } = await auth()
  const orderNumber = generateOrderNumber()

  // ── Build billing address if different from shipping ───────────────────────
  const billingAddress = shippingInfo.billingAddressSameAsShipping
    ? undefined
    : {
      name: `${shippingInfo.billingFirstName ?? ''} ${shippingInfo.billingLastName ?? ''}`.trim(),
      line1: shippingInfo.billingAddressLine1 ?? '',
      line2: shippingInfo.billingAddressLine2 ?? '',
      city: shippingInfo.billingCity ?? '',
      state: shippingInfo.billingState ?? '',
      pincode: shippingInfo.billingPincode ?? '',
      country: shippingInfo.billingCountry ?? '',
    }

  // ── Write order to Sanity ──────────────────────────────────────────────────
  try {
    await writeClient.create({
      _type: 'order',
      orderNumber,
      clerkUserId: userId ?? null,
      customerInfo: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: {
          line1: shippingInfo.addressLine1,
          line2: shippingInfo.addressLine2 ?? '',
          city: shippingInfo.city,
          state: shippingInfo.state,
          pincode: shippingInfo.pincode,
          country: shippingInfo.country,
        },
      },
      lineItems: validatedItems.map((i) => ({
        _key: Math.random().toString(36).slice(2, 10),
        productId: i.productId,
        productName: i.productName,
        colorVariant: i.colorVariant,
        colorVariantSlug: i.colorVariantSlug,
        size: i.size,
        qty: i.qty,
        priceSnapshot: i.priceSnapshot,
        sku: i.sku,
      })),
      subtotal,
      shippingCost,
      taxAmount,
      total,
      currency: 'INR',
      shippingMethodId: shippingMethod._id,
      shippingMethodName: shippingMethod.name,
      newsletterOptIn: shippingInfo.newsletterOptIn ?? false,
      billingAddress: billingAddress ?? null,
      paymentStatus: 'pending',
      status: 'pending',
      razorpayOrderId: rzpOrder.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[checkout] Sanity order creation failed:', err)
    return { success: false, error: 'Failed to create order. Please try again.' }
  }

  return {
    success: true,
    razorpayOrderId: rzpOrder.id,
    amount: total,
    currency: 'INR',
    orderNumber,
    keyId: process.env.RAZORPAY_KEY_ID!,
  }
}

// ── verifyCheckoutPayment ─────────────────────────────────────────────────────

const verifyInput = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
})

export type VerifyPaymentResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string }

export async function verifyCheckoutPayment(input: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): Promise<VerifyPaymentResult> {
  const parsed = verifyInput.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid payment data.' }
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data

  // ── HMAC signature verification ────────────────────────────────────────────
  if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return { success: false, error: 'Payment signature verification failed.' }
  }

  // ── Find order ─────────────────────────────────────────────────────────────
  const order = await client.fetch(
    ORDER_BY_RAZORPAY_ORDER_ID_QUERY,
    { razorpayOrderId },
    { cache: 'no-store' }
  )

  if (!order) {
    return { success: false, error: 'Order not found.' }
  }

  // ── Idempotency guard ──────────────────────────────────────────────────────
  if (order.paymentStatus === 'paid') {
    return { success: true, orderNumber: order.orderNumber ?? '' }
  }

  // ── Reduce stock ──────────────────────────────────────────────────────────
  const productIds = [...new Set((order.lineItems ?? []).map((i: any) => i.productId))] as string[]
  const products: any[] = await client.fetch(
    `*[_type == "product" && _id in $ids]{
      _id,
      "colorVariants": colorVariants[]{ "slug": slug.current, sizes[]{ size, stock } }
    }`,
    { ids: productIds },
    { cache: 'no-store' }
  )

  try {
    const patches: Promise<any>[] = []

    for (const lineItem of order.lineItems ?? []) {
      const product = products.find((p) => p._id === lineItem.productId)
      if (!product || !lineItem.productId) continue

      const variantIdx = product.colorVariants?.findIndex(
        (v: any) => v.slug === lineItem.colorVariantSlug
      )
      if (variantIdx === undefined || variantIdx === -1) continue

      const sizeIdx = product.colorVariants[variantIdx].sizes?.findIndex(
        (s: any) => s.size === lineItem.size
      )
      if (sizeIdx === undefined || sizeIdx === -1) continue

      const currentStock = product.colorVariants[variantIdx].sizes[sizeIdx].stock ?? 0
      const newStock = Math.max(0, currentStock - (lineItem.qty ?? 0))

      patches.push(
        writeClient
          .patch(lineItem.productId)
          .set({ [`colorVariants[${variantIdx}].sizes[${sizeIdx}].stock`]: newStock })
          .commit()
      )
    }

    // ── Security fix: only link guest order to account if emails match ────────
    const { userId: currentUserId } = await auth()
    let shouldLink = false

    if (currentUserId && !order.clerkUserId) {
      try {
        const clerk = await clerkClient()
        const clerkUser = await clerk.users.getUser(currentUserId)
        const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase()
        const orderEmail = order.customerInfo?.email?.toLowerCase()
        shouldLink = Boolean(clerkEmail && orderEmail && clerkEmail === orderEmail)
      } catch {
        // Non-fatal — just don't link
      }
    }

    patches.push(
      writeClient
        .patch(order._id!)
        .set({
          paymentStatus: 'paid',
          status: 'paid',
          paymentId: razorpayPaymentId,
          razorpaySignature,
          updatedAt: new Date().toISOString(),
          ...(shouldLink ? { clerkUserId: currentUserId } : {}),
        })
        .commit()
    )

    await Promise.all(patches)
  } catch (err) {
    console.error('[checkout] Order/stock update failed:', err)
    return {
      success: false,
      error: 'Order update failed. Please contact support with your payment ID.',
    }
  }

  // ── Newsletter opt-in (non-blocking) ──────────────────────────────────────
  if (order.newsletterOptIn && order.customerInfo?.email && process.env.RESEND_AUDIENCE_ID) {
    const nameParts = (order.customerInfo.name ?? '').split(' ')
    resend.contacts.create({
      email: order.customerInfo.email,
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' ') || undefined,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    }).catch((err) => console.error('[newsletter] Resend contact create failed:', err))

    // For logged-in users, also persist to Clerk publicMetadata
    const { userId: currentUserId } = await auth()
    if (currentUserId) {
      clerkClient().then((clerk) =>
        clerk.users.updateUserMetadata(currentUserId, {
          publicMetadata: { newsletterOptIn: true },
        })
      ).catch((err) => console.error('[newsletter] Clerk metadata update failed:', err))
    }
  }

  // ── Send emails (all non-blocking) ────────────────────────────────────────
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'info@rebelliouscockroach.in'
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@cjpbrand.in'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const customerEmail = order.customerInfo?.email

  // 1. Order confirmation → customer
  if (customerEmail) {
    resend.emails.send({
      from: `CJP Brand Store <${fromEmail}>`,
      to: customerEmail,
      subject: `Order Confirmed — ${order.orderNumber ?? ''}`,
      html: await render(OrderConfirmation({ order: { ...order, paymentId: razorpayPaymentId } as any, baseUrl })),
    }).catch((err) => console.error('[checkout] Order confirmation email failed:', err))
  }

  // 2. New order notification → admin
  resend.emails.send({
    from: `CJP Brand Store <${fromEmail}>`,
    to: adminEmail,
    subject: `New Order — ${order.orderNumber ?? ''} (${order.total ? `₹${order.total.toLocaleString('en-IN')}` : ''})`,
    html: await render(OrderAdmin({ order: order as any, paymentId: razorpayPaymentId, baseUrl })),
  }).catch((err) => console.error('[checkout] Admin order email failed:', err))

  // 3. Newsletter welcome → customer (if opted in)
  if (order.newsletterOptIn && customerEmail && order.customerInfo?.name) {
    resend.emails.send({
      from: `CJP Brand Store <${fromEmail}>`,
      to: customerEmail,
      subject: 'Welcome to the CJP newsletter!',
      html: await render(NewsletterWelcome({ name: order.customerInfo.name, baseUrl })),
    }).catch((err) => console.error('[checkout] Newsletter welcome email failed:', err))
  }

  return { success: true, orderNumber: order.orderNumber ?? '' }
}

// ── cancelCheckoutOrder ───────────────────────────────────────────────────────

export async function cancelCheckoutOrder(razorpayOrderId: string): Promise<void> {
  try {
    const order = await client.fetch(
      ORDER_BY_RAZORPAY_ORDER_ID_QUERY,
      { razorpayOrderId },
      { cache: 'no-store' }
    )
    if (!order || order.paymentStatus === 'paid') return

    await writeClient
      .patch(order._id)
      .set({ status: 'cancelled', paymentStatus: 'failed', updatedAt: new Date().toISOString() })
      .commit()
  } catch (err) {
    console.error('[checkout] Cancel order failed:', err)
  }
}

// ── lookupOrder (for track order page) ───────────────────────────────────────

export type LookupOrderResult =
  | { success: true; order: any }
  | { success: false; error: string }

export async function lookupOrder(
  orderNumber: string,
  email: string
): Promise<LookupOrderResult> {
  if (!orderNumber.trim() || !email.trim()) {
    return { success: false, error: 'Order number and email are required.' }
  }

  const order = await client.fetch(
    ORDER_BY_NUMBER_QUERY,
    { orderNumber: orderNumber.trim().toUpperCase() },
    { cache: 'no-store' }
  )

  if (!order) {
    return { success: false, error: 'Order not found. Check the order number and try again.' }
  }

  if (order.customerInfo?.email?.toLowerCase() !== email.trim().toLowerCase()) {
    return { success: false, error: 'Email does not match this order.' }
  }

  return { success: true, order }
}
