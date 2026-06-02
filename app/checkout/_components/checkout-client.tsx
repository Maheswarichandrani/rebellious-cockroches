'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import Link from 'next/link'
import {
  FiArrowLeft, FiAlertCircle, FiShield, FiLoader,
  FiCheckCircle, FiPlus, FiMapPin,
} from 'react-icons/fi'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input }     from '@/components/ui/input'
import { Button }    from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/formatters'
import { useCartStore, selectCartTotal } from '@/hooks/use-cart'
import { checkoutSchema, type CheckoutFormData } from '@/lib/checkout-schema'
import {
  createCheckoutOrder,
  verifyCheckoutPayment,
  cancelCheckoutOrder,
} from '@/app/actions/checkout'
import { type SavedAddress, saveNewAddress } from '@/app/actions/address'
import { cn } from '@/lib/utils'

const SHIPPING_THRESHOLD = 999
const SHIPPING_COST      = 99

interface CheckoutClientProps {
  prefill?: {
    firstName?: string
    lastName?:  string
    email?:     string
  }
  savedAddresses: SavedAddress[]
  isLoggedIn:     boolean
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open: () => void }
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) { resolve(true); return }
    const s   = document.createElement('script')
    s.src     = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

// ── Address summary (read-only) ────────────────────────────────────────────────

function AddressSummary({ address }: { address: SavedAddress }) {
  return (
    <div className="rounded-lg bg-muted/40 p-4 text-sm space-y-0.5">
      <p className="font-semibold text-foreground">
        {address.firstName} {address.lastName}
      </p>
      {address.phone && (
        <p className="text-muted-foreground">{address.phone}</p>
      )}
      <div className="pt-1 space-y-0.5">
        <p className="text-muted-foreground">{address.addressLine1}</p>
        {address.addressLine2 && (
          <p className="text-muted-foreground">{address.addressLine2}</p>
        )}
        <p className="text-muted-foreground">
          {address.city}, {address.state} {address.pincode}
        </p>
        <p className="text-muted-foreground">{address.country}</p>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CheckoutClient({ prefill, savedAddresses, isLoggedIn }: CheckoutClientProps) {
  const router    = useRouter()
  const items     = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const cartTotal = useCartStore(selectCartTotal)

  const [mounted,      setMounted]      = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerifying,  setIsVerifying]  = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const currentRzpOrderId               = useRef<string | null>(null)

  // Address state
  const defaultAddress    = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]
  const hasSavedAddresses = savedAddresses.length > 0

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  )
  const [isAddingNew, setIsAddingNew] = useState(!hasSavedAddresses)
  const [wantToSave,  setWantToSave]  = useState(false)

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) ?? null

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/shop')
    }
  }, [mounted, items.length, router])

  const shippingCost = cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const grandTotal   = cartTotal + shippingCost

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName:    defaultAddress?.firstName ?? prefill?.firstName ?? '',
      lastName:     defaultAddress?.lastName  ?? prefill?.lastName  ?? '',
      email:        prefill?.email            ?? '',
      phone:        defaultAddress?.phone     ?? '',
      addressLine1: defaultAddress?.addressLine1 ?? '',
      addressLine2: defaultAddress?.addressLine2 ?? '',
      city:         defaultAddress?.city     ?? '',
      state:        defaultAddress?.state    ?? '',
      pincode:      defaultAddress?.pincode  ?? '',
      country:      defaultAddress?.country  ?? 'India',
    },
  })

  function handleSelectAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id)
    setIsAddingNew(false)
    form.setValue('firstName',    addr.firstName,         { shouldValidate: true })
    form.setValue('lastName',     addr.lastName,          { shouldValidate: true })
    form.setValue('phone',        addr.phone,             { shouldValidate: true })
    form.setValue('addressLine1', addr.addressLine1,      { shouldValidate: true })
    form.setValue('addressLine2', addr.addressLine2 ?? '', { shouldValidate: true })
    form.setValue('city',         addr.city,              { shouldValidate: true })
    form.setValue('state',        addr.state,             { shouldValidate: true })
    form.setValue('pincode',      addr.pincode,           { shouldValidate: true })
    form.setValue('country',      addr.country,           { shouldValidate: true })
  }

  function handleAddNew() {
    setSelectedAddressId(null)
    setIsAddingNew(true)
    form.setValue('phone',        '')
    form.setValue('addressLine1', '')
    form.setValue('addressLine2', '')
    form.setValue('city',         '')
    form.setValue('state',        '')
    form.setValue('pincode',      '')
    form.setValue('country',      'India')
  }

  async function onSubmit(data: CheckoutFormData) {
    setError(null)
    setIsProcessing(true)

    const scriptLoaded = await loadRazorpay()
    if (!scriptLoaded) {
      setError('Payment gateway failed to load. Please check your connection and try again.')
      setIsProcessing(false)
      return
    }

    const result = await createCheckoutOrder({
      shippingInfo: data,
      items: items.map((i) => ({
        productId:        i.productId,
        colorVariantSlug: i.colorVariantSlug,
        size:             i.size,
        qty:              i.qty,
      })),
    })

    if (!result.success) {
      setError(result.error)
      setIsProcessing(false)
      return
    }

    currentRzpOrderId.current = result.razorpayOrderId

    const rzp = new window.Razorpay({
      key:         result.keyId,
      amount:      Math.round(result.amount * 100),
      currency:    result.currency,
      name:        'CJP Brand Store',
      description: `Order ${result.orderNumber}`,
      order_id:    result.razorpayOrderId,
      prefill: {
        name:    `${data.firstName} ${data.lastName}`.trim(),
        email:   data.email,
        contact: data.phone,
      },
      notes: { order_number: result.orderNumber },
      theme: { color: '#1c1c1c' },
      modal: {
        ondismiss: () => {
          cancelCheckoutOrder(result.razorpayOrderId)
          setIsProcessing(false)
          setError('Payment was cancelled. You can try again.')
        },
      },
      handler: async (response: {
        razorpay_order_id:   string
        razorpay_payment_id: string
        razorpay_signature:  string
      }) => {
        setIsVerifying(true)
        try {
          const verification = await verifyCheckoutPayment({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          if (verification.success) {
            // Save address if requested (fire-and-forget, non-blocking)
            if (wantToSave && isAddingNew && isLoggedIn) {
              saveNewAddress({
                firstName:    data.firstName,
                lastName:     data.lastName,
                phone:        data.phone,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 ?? undefined,
                city:         data.city,
                state:        data.state,
                pincode:      data.pincode,
                country:      data.country,
              }).catch(console.error)
            }
            clearCart()
            router.push(`/order/success/${verification.orderNumber}`)
          } else {
            setError(`Payment verification failed: ${verification.error}`)
            setIsProcessing(false)
            setIsVerifying(false)
          }
        } catch {
          setError('Payment verification error. Contact support with your payment ID.')
          setIsProcessing(false)
          setIsVerifying(false)
        }
      },
    })

    rzp.open()
  }

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (isVerifying) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
        <FiLoader size={28} className="animate-spin text-foreground" />
        <p className="text-sm font-medium text-foreground">Verifying payment…</p>
        <p className="text-xs text-muted-foreground">Do not close this tab.</p>
      </div>
    )
  }

  if (!mounted || items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen pt-[80px] pb-24">
      <div className="page-container">

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <FiArrowLeft size={10} />
          Back to Shop
        </Link>

        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Secure Checkout
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            Checkout
          </h1>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <FiAlertCircle className="mt-0.5 shrink-0 text-destructive" size={16} />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">

          {/* ── LEFT: Form ── */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

              {/* ── Saved address picker (logged-in users with saved addresses) ── */}
              {hasSavedAddresses && (
                <section className="rounded-lg border border-border bg-card p-6 shadow-card">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Saved Addresses
                  </h2>

                  <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id && !isAddingNew
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className={cn(
                            'snap-start flex-shrink-0 w-52 text-left rounded-lg border-2 p-4 transition-all duration-150',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40 bg-background'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {addr.isDefault ? 'Default' : 'Saved'}
                            </span>
                            {isSelected && (
                              <FiCheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground leading-snug truncate">
                            {addr.firstName} {addr.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {addr.city}, {addr.state} {addr.pincode}
                          </p>
                        </button>
                      )
                    })}

                    {/* Add new card */}
                    <button
                      type="button"
                      onClick={handleAddNew}
                      className={cn(
                        'snap-start flex-shrink-0 w-44 rounded-lg border-2 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-150',
                        isAddingNew
                          ? 'border-primary bg-primary/5'
                          : 'border-dashed border-border hover:border-primary/40 bg-background'
                      )}
                    >
                      <div className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center',
                        isAddingNew ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        <FiPlus size={16} />
                      </div>
                      <span className="text-xs font-semibold text-center text-muted-foreground leading-snug">
                        Use a different address
                      </span>
                    </button>
                  </div>
                </section>
              )}

              {/* ── Contact information ── */}
              <section className="rounded-lg border border-border bg-card p-6 shadow-card">
                <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Contact Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        First Name
                      </FormLabel>
                      <FormControl><Input placeholder="First name" {...field} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Last Name
                      </FormLabel>
                      <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="10-digit mobile number" maxLength={10} {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>
              </section>

              {/* ── Shipping address ── */}
              <section className="rounded-lg border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Shipping Address
                  </h2>
                  {!isAddingNew && selectedAddress && hasSavedAddresses && (
                    <button
                      type="button"
                      onClick={handleAddNew}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>

                {/* Saved address summary (not editing) */}
                {!isAddingNew && selectedAddress ? (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <FiMapPin size={13} className="text-primary" />
                    </div>
                    <AddressSummary address={selectedAddress} />
                  </div>
                ) : (
                  /* New address form */
                  <div className="flex flex-col gap-4">
                    <FormField control={form.control} name="addressLine1" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Address Line 1
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="House / Flat / Building no." {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="addressLine2" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Address Line 2{' '}
                          <span className="normal-case font-normal text-muted-foreground/60">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Street / Area / Landmark" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">City</FormLabel>
                          <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">State</FormLabel>
                          <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="pincode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pincode</FormLabel>
                          <FormControl><Input placeholder="400001" maxLength={6} {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Country</FormLabel>
                          <FormControl><Input placeholder="India" {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}
              </section>

              {/* ── Save address checkbox (logged-in, adding new) ── */}
              {isLoggedIn && isAddingNew && (
                <label className="flex cursor-pointer items-center gap-3 group select-none">
                  <div
                    className={cn(
                      'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-2 transition-colors',
                      wantToSave
                        ? 'border-primary bg-primary'
                        : 'border-border group-hover:border-primary/60'
                    )}
                  >
                    {wantToSave && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={wantToSave}
                    onChange={(e) => setWantToSave(e.target.checked)}
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Save this address for future orders
                  </span>
                </label>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isProcessing}
                className="w-full text-xs font-bold uppercase tracking-[0.12em]"
              >
                {isProcessing
                  ? 'Preparing payment…'
                  : `Proceed to Payment — ${formatPrice(grandTotal)}`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <FiShield size={11} />
                <span>Secured by Razorpay · Test Mode</span>
              </div>
            </form>
          </Form>

          {/* ── RIGHT: Order summary ── */}
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Order Summary
                </h2>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.colorVariantSlug}-${item.size}`}
                    className="flex gap-3 px-5 py-4"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.imageSnapshot}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="48px"
                      />
                      <span className={cn(
                        'absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center',
                        'rounded-full bg-foreground text-[9px] font-bold text-background leading-none'
                      )}>
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground leading-snug">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.colorVariantName} · {item.size}
                      </p>
                      <p className="mt-auto text-sm font-semibold text-foreground tabular-nums">
                        {formatPrice(item.priceSnapshot * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-5 py-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={cn('font-medium tabular-nums', shippingCost === 0 && 'text-emerald-600 dark:text-emerald-400 font-semibold')}>
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Add {formatPrice(SHIPPING_THRESHOLD - cartTotal)} more for free shipping
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                  Total
                </span>
                <span className="text-lg font-extrabold tracking-tight text-foreground tabular-nums">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
