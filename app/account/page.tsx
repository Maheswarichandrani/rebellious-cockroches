import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { ORDERS_BY_USER_QUERY } from '@/sanity/lib/queries'
import { formatPrice } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-muted text-muted-foreground',
  paid:       'bg-primary/10 text-primary',
  processing: 'bg-primary/10 text-primary',
  shipped:    'bg-accent text-accent-foreground',
  delivered:  'bg-primary/20 text-foreground',
  cancelled:  'bg-destructive/10 text-destructive',
  refunded:   'bg-destructive/10 text-destructive',
}

export const metadata = {
  title: 'My Orders | CJP Brand Store',
}

export default async function AccountPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const orders = await client.fetch(
    ORDERS_BY_USER_QUERY,
    { userId },
    { cache: 'no-store' }
  )

  return (
    <main className="min-h-screen pt-[120px] pb-24">
      <div className="page-container-narrow">

        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Your Account
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            Order History
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center shadow-card">
            <p className="text-sm font-medium text-muted-foreground">No orders yet.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Your orders will appear here after checkout.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-lg border border-border bg-card shadow-card overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Order
                    </p>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {order.orderNumber ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                    <Badge
                      className={`mt-1 text-[10px] font-bold uppercase tracking-wide border-0 ${
                        STATUS_COLORS[order.status ?? 'pending'] ?? STATUS_COLORS.pending
                      }`}
                    >
                      {order.status ?? 'pending'}
                    </Badge>
                  </div>
                </div>

                {/* Line items */}
                {order.lineItems && order.lineItems.length > 0 && (
                  <div className="px-5 py-3">
                    {order.lineItems.map((item) => (
                      <div
                        key={item._key}
                        className="flex items-center justify-between py-2 text-sm border-b border-border/50 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.colorVariant} · {item.size} · qty {item.qty}
                          </p>
                        </div>
                        <p className="font-semibold text-foreground tabular-nums">
                          {item.priceSnapshot != null
                            ? formatPrice(item.priceSnapshot * (item.qty ?? 1))
                            : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Total
                  </span>
                  <span className="font-bold text-foreground tabular-nums">
                    {order.total != null ? formatPrice(order.total) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
