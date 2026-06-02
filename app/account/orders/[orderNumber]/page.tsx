import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { client } from '@/sanity/lib/client'
import { ORDER_BY_NUMBER_QUERY } from '@/sanity/lib/queries'
import { formatPrice } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiXCircle,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi'

// ── Types ─────────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ orderNumber: string }> }

// ── Timeline config ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  {
    status:      'pending',
    label:       'Order Placed',
    description: 'Your order has been received',
    Icon:        FiClock,
  },
  {
    status:      'paid',
    label:       'Payment Confirmed',
    description: 'Payment successfully processed',
    Icon:        FiCreditCard,
  },
  {
    status:      'processing',
    label:       'Being Prepared',
    description: 'Your items are being packed',
    Icon:        FiPackage,
  },
  {
    status:      'shipped',
    label:       'Shipped',
    description: 'Your order is on its way',
    Icon:        FiTruck,
  },
  {
    status:      'delivered',
    label:       'Delivered',
    description: 'Order delivered successfully',
    Icon:        FiCheckCircle,
  },
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

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps) {
  const { orderNumber } = await params
  return { title: `Order ${orderNumber} | CJP Brand Store` }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params

  const { userId } = await auth()
  if (!userId) redirect('/')

  const user  = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  const order = await client.fetch(
    ORDER_BY_NUMBER_QUERY,
    { orderNumber },
    { cache: 'no-store' }
  )

  if (!order) notFound()

  // Security: ensure this order belongs to the authenticated user
  const ownsOrder =
    order.clerkUserId === userId ||
    order.customerInfo?.email?.toLowerCase() === email.toLowerCase()

  if (!ownsOrder) notFound()

  const status      = order.status ?? 'pending'
  const isCancelled = status === 'cancelled'
  const isRefunded  = status === 'refunded'
  const isTerminal  = isCancelled || isRefunded
  const currentStep = STATUS_ORDER.indexOf(status)

  return (
    <main className="min-h-screen pt-[100px] pb-24">
      <div className="page-container-narrow">

        {/* Back */}
        <Link
          href="/account"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <FiArrowLeft size={13} />
          Order History
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
              Order Details
            </p>
            <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-foreground font-mono">
              {order.orderNumber}
            </h1>
            {order.createdAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </div>
          <Badge
            className={`self-start mt-1 text-[11px] font-bold uppercase tracking-wider border-0 px-3 py-1 ${
              STATUS_BADGE[status] ?? STATUS_BADGE.pending
            }`}
          >
            {status}
          </Badge>
        </div>

        {/* ── Timeline ── */}
        {!isTerminal ? (
          <section className="mb-8 rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Order Status
              </h2>
            </div>
            <div className="px-5 py-6">
              <ol className="relative space-y-0">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone    = currentStep >= idx
                  const isCurrent = currentStep === idx
                  const isLast    = idx === TIMELINE_STEPS.length - 1

                  return (
                    <li key={step.status} className="flex gap-4">
                      {/* Connector column */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isDone
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground'
                          }`}
                        >
                          {isDone ? (
                            isCurrent ? (
                              <step.Icon size={14} />
                            ) : (
                              <FiCheckCircle size={14} />
                            )
                          ) : (
                            <FiCircle size={12} />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`mt-1 w-0.5 flex-1 min-h-[2.5rem] ${
                              currentStep > idx ? 'bg-primary' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-8 pt-1 ${isLast ? 'pb-0' : ''}`}>
                        <p
                          className={`text-sm font-semibold ${
                            isDone ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>
        ) : (
          /* Cancelled / Refunded banner */
          <section className="mb-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-3">
            {isRefunded ? (
              <FiRefreshCw size={18} className="text-destructive mt-0.5 flex-shrink-0" />
            ) : (
              <FiXCircle size={18} className="text-destructive mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-destructive">
                Order {isCancelled ? 'Cancelled' : 'Refunded'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isCancelled
                  ? 'This order was cancelled. If you were charged, a refund will be processed within 5–7 business days.'
                  : 'A refund has been initiated. It may take 5–7 business days to reflect in your account.'}
              </p>
            </div>
          </section>
        )}

        {/* ── Items ── */}
        <section className="mb-5 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <FiPackage size={14} className="text-muted-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Items Ordered
            </h2>
          </div>

          <div className="divide-y divide-border/60">
            {(order.lineItems as any[])?.map((item) => (
              <div key={item._key} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground truncate">{item.productName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.colorVariant} · Size {item.size} · Qty {item.qty}
                    {item.sku && <span className="ml-2 font-mono">SKU: {item.sku}</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm text-foreground tabular-nums">
                    {item.priceSnapshot != null
                      ? formatPrice(item.priceSnapshot * (item.qty ?? 1))
                      : '—'}
                  </p>
                  {item.qty > 1 && item.priceSnapshot != null && (
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {formatPrice(item.priceSnapshot)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing summary */}
          <div className="border-t border-border px-5 py-5 space-y-2.5 bg-muted/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPrice(order.subtotal ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium tabular-nums">
                {(order.shippingCost ?? 0) === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                ) : (
                  formatPrice(order.shippingCost ?? 0)
                )}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground tabular-nums">
                {formatPrice(order.total ?? 0)}
              </span>
            </div>
          </div>
        </section>

        {/* ── Bottom grid: address + payment ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">

          {/* Shipping address */}
          {order.customerInfo?.address && (
            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin size={14} className="text-muted-foreground" />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Shipping Address
                </h2>
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
                    {order.customerInfo.address.city},{' '}
                    {order.customerInfo.address.state}{' '}
                    {order.customerInfo.address.pincode}
                  </p>
                  <p className="text-muted-foreground">{order.customerInfo.address.country}</p>
                </div>
              </div>
            </section>
          )}

          {/* Payment info */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <FiCreditCard size={14} className="text-muted-foreground" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Payment
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={`text-[10px] font-bold uppercase tracking-wide border-0 ${
                    STATUS_BADGE[order.paymentStatus ?? 'pending'] ?? STATUS_BADGE.pending
                  }`}
                >
                  {order.paymentStatus ?? 'pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium text-foreground">{order.currency ?? 'INR'}</span>
              </div>
              {order.paymentId && (
                <div className="pt-1 border-t border-border/60">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1">
                    Payment ID
                  </p>
                  <p className="font-mono text-xs text-foreground break-all">{order.paymentId}</p>
                </div>
              )}
              {order.razorpayOrderId && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1">
                    Razorpay Order ID
                  </p>
                  <p className="font-mono text-xs text-muted-foreground break-all">
                    {order.razorpayOrderId}
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="flex-1 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-6 text-xs font-bold uppercase tracking-[0.12em] hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="flex-1 inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground h-10 px-6 text-xs font-bold uppercase tracking-[0.12em] hover:bg-accent transition-colors"
          >
            All Orders
          </Link>
        </div>

      </div>
    </main>
  )
}
