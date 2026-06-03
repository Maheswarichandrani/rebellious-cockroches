'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { SignInButton } from '@clerk/nextjs'
import { AlertCircle, CheckCircle2, ChevronRight, MapPin, Plus, Shield } from 'lucide-react'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input }     from '@/components/ui/input'
import { Button }    from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatPrice } from '@/lib/formatters'
import { useCartStore, selectCartTotal } from '@/hooks/use-cart'
import { checkoutSchema, type CheckoutFormData } from '@/lib/checkout-schema'
import { INDIAN_STATES } from '@/lib/indian-states'
import {
  createCheckoutOrder,
  verifyCheckoutPayment,
  cancelCheckoutOrder,
} from '@/app/(storefront)/actions/checkout'
import { type SavedAddress, saveNewAddress } from '@/app/(storefront)/actions/address'
import {
  getShippingMethodsForPincode,
  type ShippingMethod,
} from '@/app/(storefront)/actions/shipping'
import { AddressSearchField } from './address-search-field'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CheckoutClientProps {
  prefill?: { firstName?: string; lastName?: string; email?: string }
  savedAddresses: SavedAddress[]
  isLoggedIn:     boolean
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open: () => void }
  }
}

// ── Saved address summary (read-only card) ────────────────────────────────────

function AddressSummary({ address }: { address: SavedAddress }) {
  return (
    <div className="text-sm space-y-0.5">
      <p className="font-medium text-foreground">{address.firstName} {address.lastName}</p>
      {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
      <p className="text-muted-foreground">{address.addressLine1}</p>
      {address.addressLine2 && <p className="text-muted-foreground">{address.addressLine2}</p>}
      <p className="text-muted-foreground">
        {address.city}, {address.state} {address.pincode}
      </p>
      <p className="text-muted-foreground">{address.country}</p>
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function CheckoutSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-6 first:pt-0">
      <h2 className="text-base font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CheckoutClient({
  prefill,
  savedAddresses,
  isLoggedIn,
}: CheckoutClientProps) {
  const router    = useRouter()
  const items     = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const cartTotal = useCartStore(selectCartTotal)

  const defaultAddress    = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]
  const hasSavedAddresses = savedAddresses.length > 0

  // ── State ──────────────────────────────────────────────────────────────────
  const paidRef = useRef(false)

  const [mounted,            setMounted]           = useState(false)
  const [rzpReady,           setRzpReady]          = useState(false)
  const [payStatus,          setPayStatus]         = useState<'idle' | 'processing' | 'verifying'>('idle')
  const [payError,           setPayError]          = useState<string | null>(null)
  const [addressMode,        setAddressMode]       = useState<'saved' | 'new'>(
    hasSavedAddresses ? 'saved' : 'new'
  )
  const [selectedAddressId,  setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  )
  const [wantToSave,         setWantToSave]        = useState(false)
  // null = pincode not entered yet; [] = entered but no methods; ShippingMethod[] = available
  const [availableMethods,   setAvailableMethods]  = useState<ShippingMethod[] | null>(null)
  const [isLoadingMethods,   setIsLoadingMethods]  = useState(false)

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) ?? null

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName:                   defaultAddress?.firstName ?? prefill?.firstName ?? '',
      lastName:                    defaultAddress?.lastName  ?? prefill?.lastName  ?? '',
      email:                       prefill?.email            ?? '',
      phone:                       defaultAddress?.phone     ?? '',
      addressLine1:                defaultAddress?.addressLine1 ?? '',
      addressLine2:                defaultAddress?.addressLine2 ?? '',
      city:                        defaultAddress?.city     ?? '',
      state:                       defaultAddress?.state    ?? '',
      pincode:                     defaultAddress?.pincode  ?? '',
      country:                     defaultAddress?.country  ?? 'India',
      shippingMethodId:            '',
      newsletterOptIn:             false,
      billingAddressSameAsShipping: true,
    },
  })

  const billingAddressSameAsShipping = form.watch('billingAddressSameAsShipping')
  const watchedPincode               = form.watch('pincode')

  // ── Mount: load guest localStorage, redirect if empty cart ────────────────
  useEffect(() => {
    if (!isLoggedIn && !hasSavedAddresses) {
      try {
        const saved = localStorage.getItem('cjp-shipping-info')
        if (saved) {
          const parsed = JSON.parse(saved)
          form.reset({ ...form.getValues(), ...parsed })
        }
      } catch { /* ignore */ }
    }
    setMounted(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (mounted && items.length === 0 && !paidRef.current) router.replace('/shop')
  }, [mounted, items.length, router])

  // ── Pincode watcher → fetch shipping methods ───────────────────────────────
  useEffect(() => {
    if (!/^\d{6}$/.test(watchedPincode)) {
      setAvailableMethods(null)
      form.setValue('shippingMethodId', '')
      return
    }
    let cancelled = false
    setIsLoadingMethods(true)
    getShippingMethodsForPincode(watchedPincode).then((methods) => {
      if (cancelled) return
      setAvailableMethods(methods)
      if (methods.length > 0) form.setValue('shippingMethodId', methods[0]._id)
      else form.setValue('shippingMethodId', '')
    }).finally(() => {
      if (!cancelled) setIsLoadingMethods(false)
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPincode])

  // ── Shipping cost for selected method ─────────────────────────────────────
  const selectedMethodId = form.watch('shippingMethodId')
  const selectedMethod   = availableMethods?.find((m) => m._id === selectedMethodId)
  const shippingCost     = selectedMethod
    ? (selectedMethod.freeAboveOrderTotal && cartTotal >= selectedMethod.freeAboveOrderTotal
        ? 0
        : selectedMethod.price)
    : 0
  const grandTotal = cartTotal + shippingCost
  const taxAmount  = Math.round((cartTotal * 18 / 118) * 100) / 100

  // ── Address picker helpers ─────────────────────────────────────────────────
  function handleSelectAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id)
    setAddressMode('saved')
    form.setValue('firstName',    addr.firstName,          { shouldValidate: true })
    form.setValue('lastName',     addr.lastName,           { shouldValidate: true })
    form.setValue('phone',        addr.phone,              { shouldValidate: true })
    form.setValue('addressLine1', addr.addressLine1,       { shouldValidate: true })
    form.setValue('addressLine2', addr.addressLine2 ?? '',  { shouldValidate: true })
    form.setValue('city',         addr.city,               { shouldValidate: true })
    form.setValue('state',        addr.state,              { shouldValidate: true })
    form.setValue('pincode',      addr.pincode,            { shouldValidate: true })
    form.setValue('country',      addr.country,            { shouldValidate: true })
  }

  function handleAddNew() {
    setAddressMode('new')
    setSelectedAddressId(null)
    form.setValue('phone',        '')
    form.setValue('addressLine1', '')
    form.setValue('addressLine2', '')
    form.setValue('city',         '')
    form.setValue('state',        '')
    form.setValue('pincode',      '')
    form.setValue('country',      'India')
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function onSubmit(data: CheckoutFormData) {
    setPayError(null)
    setPayStatus('processing')

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
      setPayError(result.error)
      setPayStatus('idle')
      return
    }

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
          setPayStatus('idle')
          setPayError('Payment was cancelled. You can try again.')
        },
      },
      handler: async (response: {
        razorpay_order_id:   string
        razorpay_payment_id: string
        razorpay_signature:  string
      }) => {
        setPayStatus('verifying')
        try {
          const verification = await verifyCheckoutPayment({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })

          if (verification.success) {
            // Save address: guest → localStorage, logged-in → Clerk
            if (wantToSave) {
              if (!isLoggedIn) {
                try {
                  localStorage.setItem('cjp-shipping-info', JSON.stringify({
                    firstName: data.firstName, lastName: data.lastName,
                    phone: data.phone, addressLine1: data.addressLine1,
                    addressLine2: data.addressLine2, city: data.city,
                    state: data.state, pincode: data.pincode, country: data.country,
                  }))
                } catch { /* ignore */ }
              } else if (addressMode === 'new') {
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
            }

            paidRef.current = true
            clearCart()
            const encoded = Buffer.from(data.email).toString('base64url')
            router.push(`/order/success/${verification.orderNumber}?email=${encoded}`)
          } else {
            setPayError(`Payment verification failed: ${verification.error}`)
            setPayStatus('idle')
          }
        } catch {
          setPayError('Payment verification error. Contact support with your payment ID.')
          setPayStatus('idle')
        }
      },
    })

    rzp.open()
  }

  // ── Guards ─────────────────────────────────────────────────────────────────

  const isProcessing = payStatus === 'processing'
  const canSubmit    = rzpReady && !isProcessing

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Script renders on first paint so Razorpay CDN loads before mounted guard */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setRzpReady(true)}
      />

      {payStatus === 'verifying' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <p className="text-sm font-medium">Verifying payment…</p>
          <p className="text-xs text-muted-foreground">Do not close this tab.</p>
        </div>
      )}

      {payStatus !== 'verifying' && (!mounted || items.length === 0) && (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Redirecting…</p>
        </div>
      )}

      {payStatus !== 'verifying' && mounted && items.length > 0 && (
      <main className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Brand / back link */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
              Rebellious Cockroach
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to shop <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">

            {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="divide-y divide-border">

                {/* Error banner */}
                {payError && (
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={15} />
                    <p className="text-sm text-destructive">{payError}</p>
                  </div>
                )}

                {/* ── Contact ─────────────────────────────────────────────────── */}
                <CheckoutSection title="Contact">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">
                      {isLoggedIn ? 'Signed in as' : 'Already have an account?'}
                    </p>
                    {!isLoggedIn && (
                      <SignInButton mode="modal" forceRedirectUrl="/checkout">
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                          Sign in
                        </button>
                      </SignInButton>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            readOnly={isLoggedIn}
                            className={cn(isLoggedIn && 'bg-muted/40 cursor-default')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <label className="flex cursor-pointer items-center gap-3 select-none group">
                      <FormField control={form.control} name="newsletterOptIn" render={({ field }) => (
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )} />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Email me with news and offers
                      </span>
                    </label>
                  </div>
                </CheckoutSection>

                {/* ── Delivery ────────────────────────────────────────────────── */}
                <CheckoutSection title="Delivery">

                  {/* Saved address picker */}
                  {hasSavedAddresses && (
                    <div className="mb-5">
                      <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                        {savedAddresses.map((addr) => {
                          const isSelected = addressMode === 'saved' && selectedAddressId === addr.id
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleSelectAddress(addr)}
                              className={cn(
                                'snap-start flex-shrink-0 w-48 text-left rounded-lg border-2 p-3 transition-all duration-150 text-xs',
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/40 bg-background'
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                  {addr.isDefault ? 'Default' : 'Saved'}
                                </span>
                                {isSelected && <CheckCircle2 size={12} className="text-primary" />}
                              </div>
                              <p className="font-medium text-foreground truncate">{addr.firstName} {addr.lastName}</p>
                              <p className="text-muted-foreground truncate">{addr.addressLine1}</p>
                              <p className="text-muted-foreground">{addr.city}, {addr.state}</p>
                            </button>
                          )
                        })}

                        <button
                          type="button"
                          onClick={handleAddNew}
                          className={cn(
                            'snap-start flex-shrink-0 w-36 rounded-lg border-2 flex flex-col items-center justify-center gap-1.5 p-3 transition-all duration-150',
                            addressMode === 'new'
                              ? 'border-primary bg-primary/5'
                              : 'border-dashed border-border hover:border-primary/40'
                          )}
                        >
                          <div className={cn(
                            'h-8 w-8 rounded-full flex items-center justify-center',
                            addressMode === 'new' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            <Plus size={14} />
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground text-center">
                            New address
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Saved address summary (not editing) */}
                  {addressMode === 'saved' && selectedAddress ? (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 flex gap-3">
                      <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <AddressSummary address={selectedAddress} />
                        <button
                          type="button"
                          onClick={handleAddNew}
                          className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          Use a different address
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* New address form */
                    <div className="flex flex-col gap-4">
                      {/* Country */}
                      <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country/Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="India">India</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl><Input placeholder="First name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Address search */}
                      <AddressSearchField form={form} />

                      {/* Apt / suite */}
                      <FormField control={form.control} name="addressLine2" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apartment, suite, etc. <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <FormControl><Input placeholder="Apartment, suite, etc." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* City / State / PIN */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input placeholder="City" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {INDIAN_STATES.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="pincode" render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="000000"
                                maxLength={6}
                                inputMode="numeric"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Phone */}
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="10-digit mobile number"
                              maxLength={10}
                              inputMode="numeric"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}

                  {/* Save info checkbox */}
                  {(addressMode === 'new') && (
                    <label className="mt-4 flex cursor-pointer items-center gap-3 select-none group">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                        checked={wantToSave}
                        onChange={(e) => setWantToSave(e.target.checked)}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Save this information for next time
                      </span>
                    </label>
                  )}
                </CheckoutSection>

                {/* ── Shipping method ──────────────────────────────────────────── */}
                <CheckoutSection title="Shipping method">
                  {availableMethods === null ? (
                    // Pincode not entered yet
                    <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                      Enter your PIN code above to see available shipping options.
                    </p>
                  ) : isLoadingMethods ? (
                    // Fetching methods for this pincode
                    <div className="space-y-2">
                      <Skeleton className="h-14 w-full rounded-lg" />
                    </div>
                  ) : availableMethods.length === 0 ? (
                    // No methods serve this pincode
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                      Delivery is not available to this pincode. Please contact us.
                    </p>
                  ) : (
                    <FormField control={form.control} name="shippingMethodId" render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-2">
                          {availableMethods.map((method) => {
                            const effectivePrice =
                              method.freeAboveOrderTotal && cartTotal >= method.freeAboveOrderTotal
                                ? 0
                                : method.price
                            const isSelected = field.value === method._id
                            return (
                              <button
                                key={method._id}
                                type="button"
                                onClick={() => field.onChange(method._id)}
                                className={cn(
                                  'flex items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-all duration-150',
                                  isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/40'
                                )}
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">{method.name}</p>
                                  <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                                <span className={cn(
                                  'text-sm font-semibold tabular-nums',
                                  effectivePrice === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                                )}>
                                  {effectivePrice === 0 ? 'Free' : formatPrice(effectivePrice)}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </CheckoutSection>

                {/* ── Payment ──────────────────────────────────────────────────── */}
                <CheckoutSection title="Payment">
                  <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
                    All transactions are secure and encrypted.
                  </p>
                  <div className="rounded-lg border-2 border-primary bg-primary/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        Razorpay Secure (UPI, Cards, Int&apos;l Cards, Wallets)
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold">UPI</span>
                        <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold">VISA</span>
                        <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-red-600">MC</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      You&apos;ll be redirected to Razorpay Secure to complete your purchase.
                    </p>
                  </div>
                </CheckoutSection>

                {/* ── Billing address ──────────────────────────────────────────── */}
                <CheckoutSection title="Billing address">
                  <div className="flex flex-col gap-2">
                    {/* Same as shipping */}
                    <button
                      type="button"
                      onClick={() => form.setValue('billingAddressSameAsShipping', true)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all duration-150',
                        billingAddressSameAsShipping
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <div className={cn(
                        'h-4 w-4 rounded-full border-2 flex-shrink-0',
                        billingAddressSameAsShipping
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      )} />
                      <span className="text-sm font-medium">Same as shipping address</span>
                    </button>

                    {/* Different billing */}
                    <button
                      type="button"
                      onClick={() => form.setValue('billingAddressSameAsShipping', false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all duration-150',
                        !billingAddressSameAsShipping
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <div className={cn(
                        'h-4 w-4 rounded-full border-2 flex-shrink-0',
                        !billingAddressSameAsShipping
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      )} />
                      <span className="text-sm font-medium">Use a different billing address</span>
                    </button>

                    {/* Billing form (expanded) */}
                    {!billingAddressSameAsShipping && (
                      <div className="mt-3 flex flex-col gap-4 rounded-lg border border-border p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="billingFirstName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl><Input placeholder="First name" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="billingLastName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last name</FormLabel>
                              <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="billingAddressLine1" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl><Input placeholder="Street address" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="billingAddressLine2" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apartment, suite, etc. <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                            <FormControl><Input placeholder="Apartment, suite, etc." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField control={form.control} name="billingCity" render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl><Input placeholder="City" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="billingState" render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="State" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INDIAN_STATES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="billingPincode" render={({ field }) => (
                            <FormItem>
                              <FormLabel>PIN code</FormLabel>
                              <FormControl>
                                <Input placeholder="000000" maxLength={6} inputMode="numeric" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="billingCountry" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value ?? 'India'}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="India">India</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    )}
                  </div>
                </CheckoutSection>

                {/* ── Pay button ───────────────────────────────────────────────── */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!canSubmit}
                    className="w-full text-sm font-semibold"
                  >
                    {isProcessing
                      ? 'Preparing payment…'
                      : `Pay now`}
                  </Button>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <Shield size={11} />
                    <span>
                      Secured by Razorpay
                      {process.env.NODE_ENV !== 'production' && ' · Test Mode'}
                    </span>
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                      Privacy policy
                    </Link>
                  </p>
                </div>

              </form>
            </Form>

            {/* ── RIGHT: Order summary ────────────────────────────────────────── */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="rounded-xl border border-border bg-card overflow-hidden">

                {/* Items */}
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
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background leading-none">
                          {item.qty}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground leading-snug">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.colorVariantName} / {item.size}
                        </p>
                        <p className="mt-auto text-sm font-semibold text-foreground tabular-nums">
                          {formatPrice(item.priceSnapshot * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="px-5 py-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={cn(
                      'font-medium tabular-nums',
                      shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                    )}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {selectedMethod?.freeAboveOrderTotal && shippingCost > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Add {formatPrice(selectedMethod.freeAboveOrderTotal - cartTotal)} more for free shipping
                    </p>
                  )}
                </div>

                <Separator />

                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground mr-1">INR</span>
                      <span className="text-xl font-extrabold tracking-tight text-foreground tabular-nums">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground text-right">
                    Including {formatPrice(taxAmount)} in taxes
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      )}
    </>
  )
}
