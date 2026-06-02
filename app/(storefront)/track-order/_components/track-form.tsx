'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FiSearch, FiAlertCircle, FiPackage, FiMapPin, FiCreditCard,
  FiCheckCircle, FiCircle, FiClock, FiTruck, FiXCircle, FiRefreshCw,
  FiArrowRight,
} from 'react-icons/fi'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input }     from '@/components/ui/input'
import { Button }    from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge }     from '@/components/ui/badge'
import { formatPrice } from '@/lib/formatters'
import { lookupOrder } from '@/app/(storefront)/actions/checkout'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  orderNumber: z
    .string()
    .min(1, 'Order number is required')
    .trim()
    .transform((v) => v.toUpperCase())
    .refine(
      (v) => /^CJP-\d{8}-[A-Z0-9]{4}$/.test(v),
      'Invalid format — expected CJP-YYYYMMDD-XXXX'
    ),
  email: z.string().email('Enter a valid email address').trim(),
})
type FormData = z.infer<typeof schema>

// ── Timeline config ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { status: 'pending',    label: 'Order Placed',       description: 'Your order has been received',     Icon: FiClock        },
  { status: 'paid',       label: 'Payment Confirmed',  description: 'Payment successfully processed',   Icon: FiCreditCard   },
  { status: 'processing', label: 'Being Prepared',     description: 'Your items are being packed',      Icon: FiPackage      },
  { status: 'shipped',    label: 'Shipped',            description: 'Your order is on its way',         Icon: FiTruck        },
  { status: 'delivered',  label: 'Delivered',          description: 'Order delivered successfully',     Icon: FiCheckCircle  },
]

const STATUS_ORDER = ['pending', 'paid', 'processing', 'shipped', 'delivered']

const STATUS_BADGE: Record<string, string> = {
  pending:    'bg-muted text-muted-foreground',
  paid:       'bg-primary/10 text-primary',
  processing: 'bg-primary/10 text-primary',
  shipped:    'bg-accent text-accent-foreground',
  delivered:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled:  'bg-destructive/10 text-destructive',
  refunded:   'bg-destructive/10 text-destructive',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TrackFormProps {
  prefillEmail?: string
  isLoggedIn?:   boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TrackOrderForm({ prefillEmail, isLoggedIn }: TrackFormProps) {
  const [order,     setOrder]     = useState<any | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderNumber: '',
      email:       prefillEmail ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    setOrder(null)
    setIsLoading(true)
    const result = await lookupOrder(data.orderNumber, data.email)
    if (result.success) {
      setOrder(result.order)
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  function handleReset() {
    setOrder(null)
    setError(null)
    form.setValue('orderNumber', '')
    if (!prefillEmail) form.setValue('email', '')
  }

  const status      = order?.status ?? 'pending'
  const isCancelled = status === 'cancelled'
  const isRefunded  = status === 'refunded'
  const isTerminal  = isCancelled || isRefunded
  const currentStep = STATUS_ORDER.indexOf(status)

  return (
    <div className="space-y-6">

      {/* ── Search form ── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

            <FormField control={form.control} name="orderNumber" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Order Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="CJP-20240101-XXXX"
                    className="font-mono uppercase tracking-wide"
                    autoComplete="off"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <p className="text-[11px] text-muted-foreground/70">
                  Found in your order confirmation email
                </p>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email Address
                  </FormLabel>
                  {isLoggedIn && prefillEmail && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Auto-filled
                    </span>
                  )}
                </div>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email used at checkout"
                    readOnly={isLoggedIn && !!prefillEmail}
                    className={isLoggedIn && prefillEmail ? 'bg-muted/50 text-muted-foreground cursor-default' : ''}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 text-xs font-bold uppercase tracking-[0.12em] gap-2"
              >
                <FiSearch size={13} />
                {isLoading ? 'Searching…' : 'Track Order'}
              </Button>
              {order && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="text-xs font-semibold uppercase tracking-wide"
                >
                  Clear
                </Button>
              )}
            </div>

          </form>
        </Form>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5">
          <FiAlertCircle className="mt-0.5 shrink-0 text-destructive" size={16} />
          <div>
            <p className="text-sm font-semibold text-destructive">Order not found</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* ── Order result ── */}
      {order && (
        <div className="space-y-4">

          {/* Header card */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-5 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1">
                  Order
                </p>
                <p className="font-mono text-lg font-bold text-foreground">
                  {order.orderNumber}
                </p>
                {order.createdAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <Badge
                className={`flex-shrink-0 mt-1 text-[11px] font-bold uppercase tracking-wider border-0 px-3 py-1 ${
                  STATUS_BADGE[status] ?? STATUS_BADGE.pending
                }`}
              >
                {status}
              </Badge>
            </div>

            {/* ── Timeline ── */}
            {!isTerminal ? (
              <div className="border-t border-border px-5 py-5">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Shipment Progress
                </p>
                <ol className="relative space-y-0">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isDone    = currentStep >= idx
                    const isCurrent = currentStep === idx
                    const isLast    = idx === TIMELINE_STEPS.length - 1

                    return (
                      <li key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              isDone
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground'
                            }`}
                          >
                            {isDone
                              ? isCurrent
                                ? <step.Icon size={14} />
                                : <FiCheckCircle size={14} />
                              : <FiCircle size={12} />
                            }
                          </div>
                          {!isLast && (
                            <div className={`mt-1 w-0.5 flex-1 min-h-[2.5rem] ${currentStep > idx ? 'bg-primary' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className={`pb-7 pt-1 ${isLast ? 'pb-0' : ''}`}>
                          <p className={`text-sm font-semibold ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ) : (
              <div className="border-t border-border px-5 py-4 flex items-start gap-3">
                {isRefunded
                  ? <FiRefreshCw size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                  : <FiXCircle   size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                }
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Order {isCancelled ? 'Cancelled' : 'Refunded'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {isCancelled
                      ? 'This order was cancelled. If you were charged, a refund will be processed within 5–7 business days.'
                      : 'Refund initiated. It may take 5–7 business days to reflect in your account.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Items + totals */}
          {order.lineItems?.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <FiPackage size={13} className="text-muted-foreground" />
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Items Ordered
                </p>
              </div>
              <div className="divide-y divide-border/60">
                {order.lineItems.map((item: any) => (
                  <div key={item._key} className="flex items-center justify-between px-5 py-3.5 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.colorVariant} · Size {item.size} · Qty {item.qty}
                      </p>
                    </div>
                    <p className="flex-shrink-0 text-sm font-semibold text-foreground tabular-nums">
                      {formatPrice(item.priceSnapshot * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-5 py-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">{formatPrice(order.subtotal ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium tabular-nums">
                    {(order.shippingCost ?? 0) === 0
                      ? <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                      : formatPrice(order.shippingCost ?? 0)
                    }
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-foreground tabular-nums">{formatPrice(order.total ?? 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Shipping address */}
          {order.customerInfo?.address && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin size={13} className="text-muted-foreground" />
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Shipping To
                </p>
              </div>
              <div className="text-sm space-y-0.5">
                <p className="font-semibold text-foreground">{order.customerInfo.name}</p>
                {order.customerInfo.phone && (
                  <p className="text-muted-foreground">{order.customerInfo.phone}</p>
                )}
                <div className="pt-1 space-y-0.5">
                  <p className="text-muted-foreground">{order.customerInfo.address.line1}</p>
                  {order.customerInfo.address.line2 && (
                    <p className="text-muted-foreground">{order.customerInfo.address.line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order.customerInfo.address.city}, {order.customerInfo.address.state}{' '}
                    {order.customerInfo.address.pincode}
                  </p>
                  <p className="text-muted-foreground">{order.customerInfo.address.country}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logged-in: link to full order detail */}
          {isLoggedIn && order.orderNumber && (
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-primary hover:bg-primary/10 transition-colors"
            >
              View full order details
              <FiArrowRight size={13} />
            </Link>
          )}

        </div>
      )}

    </div>
  )
}
