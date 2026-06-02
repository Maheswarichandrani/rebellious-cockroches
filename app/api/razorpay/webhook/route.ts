import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/components'
import { verifyWebhookSignature } from '@/lib/razorpay/verify'
import { writeClient } from '@/sanity/lib/write'
import { client } from '@/sanity/lib/client'
import { ORDER_BY_RAZORPAY_ORDER_ID_QUERY, ORDER_BY_PAYMENT_ID_QUERY } from '@/sanity/lib/queries'
import { resend } from '@/lib/email/resend'
import { PaymentFailed } from '@/lib/email/templates/payment-failed'
import { RefundNotification } from '@/lib/email/templates/refund-notification'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event?.event as string

  try {
    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      if (!payment?.order_id) return NextResponse.json({ ok: true })

      const order = await client.fetch(
        ORDER_BY_RAZORPAY_ORDER_ID_QUERY,
        { razorpayOrderId: payment.order_id },
        { cache: 'no-store' }
      )

      if (!order || order.paymentStatus === 'paid') {
        return NextResponse.json({ ok: true })
      }

      // Stock reduction for webhook fallback
      const productIds = [...new Set((order.lineItems ?? []).map((i: any) => i.productId))] as string[]
      const products: any[] = await client.fetch(
        `*[_type == "product" && _id in $ids]{
          _id,
          "colorVariants": colorVariants[]{ "slug": slug.current, sizes[]{ size, stock } }
        }`,
        { ids: productIds },
        { cache: 'no-store' }
      )

      const patches: Promise<any>[] = []

      for (const lineItem of order.lineItems ?? []) {
        const product    = products.find((p) => p._id === lineItem.productId)
        if (!product || !lineItem.productId) continue
        const variantIdx = product.colorVariants?.findIndex((v: any) => v.slug === lineItem.colorVariantSlug)
        if (variantIdx === undefined || variantIdx === -1) continue
        const sizeIdx    = product.colorVariants[variantIdx].sizes?.findIndex((s: any) => s.size === lineItem.size)
        if (sizeIdx === undefined || sizeIdx === -1) continue
        const current    = product.colorVariants[variantIdx].sizes[sizeIdx].stock ?? 0
        patches.push(
          writeClient
            .patch(lineItem.productId!)
            .set({ [`colorVariants[${variantIdx}].sizes[${sizeIdx}].stock`]: Math.max(0, current - (lineItem.qty ?? 0)) })
            .commit()
        )
      }

      patches.push(
        writeClient
          .patch(order._id!)
          .set({
            paymentStatus: 'paid',
            status:        'paid',
            paymentId:     payment.id,
            updatedAt:     new Date().toISOString(),
          })
          .commit()
      )

      await Promise.all(patches)
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity
      if (!payment?.order_id) return NextResponse.json({ ok: true })

      const order = await client.fetch(
        ORDER_BY_RAZORPAY_ORDER_ID_QUERY,
        { razorpayOrderId: payment.order_id },
        { cache: 'no-store' }
      )

      if (order && order.paymentStatus !== 'paid') {
        await writeClient
          .patch(order._id)
          .set({ paymentStatus: 'failed', status: 'cancelled', updatedAt: new Date().toISOString() })
          .commit()

        // Notify customer (non-blocking)
        if (order.customerInfo?.email && order.orderNumber) {
          const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@cjpbrand.in'
          const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? ''
          resend.emails.send({
            from:    `CJP Brand Store <${fromEmail}>`,
            to:      order.customerInfo.email,
            subject: `Payment failed for order ${order.orderNumber}`,
            html:    await render(PaymentFailed({
              customerName: order.customerInfo.name ?? 'Customer',
              orderNumber:  order.orderNumber,
              baseUrl,
            })),
          }).catch((err) => console.error('[webhook] PaymentFailed email failed:', err))
        }
      }
    }

    if (eventType === 'refund.processed') {
      const refund    = event.payload?.refund?.entity
      const paymentId = refund?.payment_id
      if (!paymentId) return NextResponse.json({ ok: true })

      const order = await client.fetch(
        ORDER_BY_PAYMENT_ID_QUERY,
        { paymentId },
        { cache: 'no-store' }
      )

      if (order?._id) {
        await writeClient
          .patch(order._id)
          .set({ paymentStatus: 'refunded', status: 'refunded', updatedAt: new Date().toISOString() })
          .commit()

        // Notify customer (non-blocking)
        if (order.customerInfo?.email && order.orderNumber) {
          const fromEmail    = process.env.RESEND_FROM_EMAIL ?? 'noreply@cjpbrand.in'
          const baseUrl      = process.env.NEXT_PUBLIC_BASE_URL ?? ''
          const refundAmount = typeof refund?.amount === 'number' ? refund.amount / 100 : (order.total ?? 0)
          resend.emails.send({
            from:    `CJP Brand Store <${fromEmail}>`,
            to:      order.customerInfo.email,
            subject: `Refund initiated for order ${order.orderNumber}`,
            html:    await render(RefundNotification({
              customerName: order.customerInfo.name ?? 'Customer',
              orderNumber:  order.orderNumber,
              refundAmount,
              baseUrl,
            })),
          }).catch((err) => console.error('[webhook] RefundNotification email failed:', err))
        }
      }
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
