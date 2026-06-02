import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { ORDER_BY_NUMBER_QUERY } from '@/sanity/lib/queries'
import { formatPrice } from '@/lib/formatters'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { FiCheckCircle, FiPackage, FiMapPin } from 'react-icons/fi'

type PageProps = { params: Promise<{ orderNumber: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { orderNumber } = await params
  return { title: `Order ${orderNumber} Confirmed | CJP Brand Store` }
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { orderNumber } = await params

  const order = await client.fetch(
    ORDER_BY_NUMBER_QUERY,
    { orderNumber },
    { cache: 'no-store' }
  )

  if (!order) notFound()

  return (
    <main className="min-h-screen pt-[100px] pb-24">
      <div className="page-container-narrow">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FiCheckCircle size={32} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A confirmation has been sent to{' '}
            <strong className="text-foreground">{order.customerInfo?.email}</strong>
          </p>
        </div>

        {/* Order reference */}
        <div className="mb-5 rounded-lg border border-border bg-card p-5 shadow-card text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
            Order Number
          </p>
          <p className="font-mono text-xl font-bold text-foreground">{order.orderNumber}</p>
          {order.paymentId && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Payment ID: <span className="font-mono">{order.paymentId}</span>
            </p>
          )}
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge className="text-[10px] font-bold uppercase tracking-wide border-0 bg-primary/10 text-primary">
              {order.paymentStatus ?? 'paid'}
            </Badge>
            <Badge className="text-[10px] font-bold uppercase tracking-wide border-0 bg-muted text-muted-foreground">
              {order.status ?? 'processing'}
            </Badge>
          </div>
        </div>

        {/* Items */}
        <div className="mb-5 rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <FiPackage size={14} className="text-muted-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Items Ordered
            </h2>
          </div>

          <div className="divide-y divide-border">
            {order.lineItems?.map((item: any) => (
              <div key={item._key} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium text-sm text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.colorVariant} · {item.size} · qty {item.qty}
                  </p>
                </div>
                <p className="font-semibold text-sm text-foreground tabular-nums">
                  {formatPrice(item.priceSnapshot * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-5 py-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPrice(order.subtotal ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium tabular-nums">
                {(order.shippingCost ?? 0) === 0 ? 'Free' : formatPrice(order.shippingCost ?? 0)}
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
        </div>

        {/* Shipping address */}
        {order.customerInfo?.address && (
          <div className="mb-8 rounded-lg border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <FiMapPin size={14} className="text-muted-foreground" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Shipping To
              </h2>
            </div>
            <div className="text-sm space-y-0.5">
              <p className="font-medium text-foreground">{order.customerInfo.name}</p>
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
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="flex-1 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-6 text-xs font-bold uppercase tracking-[0.12em] hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/track-order"
            className="flex-1 inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground h-10 px-6 text-xs font-bold uppercase tracking-[0.12em] hover:bg-accent transition-colors"
          >
            Track Order
          </Link>
        </div>

      </div>
    </main>
  )
}
