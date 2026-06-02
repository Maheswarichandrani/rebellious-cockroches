import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { ORDERS_BY_USER_QUERY } from '@/sanity/lib/queries'
import { formatPrice } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { FiArrowLeft, FiChevronRight, FiShoppingBag } from 'react-icons/fi'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-muted text-muted-foreground',
  paid:       'bg-primary/10 text-primary',
  processing: 'bg-primary/10 text-primary',
  shipped:    'bg-accent text-accent-foreground',
  delivered:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled:  'bg-destructive/10 text-destructive',
  refunded:   'bg-destructive/10 text-destructive',
}

export const metadata = {
  title: 'Order History | CJP Brand Store',
}

export default async function AccountPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const user  = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  const orders = await client.fetch(
    ORDERS_BY_USER_QUERY,
    { userId, email },
    { cache: 'no-store' }
  )

  return (
    <main className="min-h-screen pt-[100px] pb-24">
      <div className="page-container-narrow">

        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <FiArrowLeft size={13} />
          Back to Shop
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Your Account
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            Order History
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-14 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FiShoppingBag size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your orders will appear here after checkout.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-5 text-xs font-bold uppercase tracking-[0.1em] hover:bg-primary/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(orders as any[]).map((order) => {
              const itemCount = order.lineItems?.length ?? 0
              const preview   = (order.lineItems as any[] | null)?.slice(0, 2) ?? []
              const extra     = itemCount > 2 ? itemCount - 2 : 0

              return (
                <Link
                  key={order._id}
                  href={`/account/orders/${order.orderNumber}`}
                  className="group block rounded-xl border border-border bg-card shadow-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Order
                      </p>
                      <p className="font-mono text-sm font-bold text-foreground truncate">
                        {order.orderNumber ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
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
                      <FiChevronRight
                        size={16}
                        className="text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0"
                      />
                    </div>
                  </div>

                  {/* Items preview */}
                  {preview.length > 0 && (
                    <div className="px-5 py-3">
                      {preview.map((item: any) => (
                        <div
                          key={item._key}
                          className="flex items-center justify-between py-1.5 text-sm"
                        >
                          <div className="min-w-0 flex-1 mr-4">
                            <p className="font-medium text-foreground truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.colorVariant} · {item.size} · qty {item.qty}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground tabular-nums flex-shrink-0">
                            {item.priceSnapshot != null
                              ? formatPrice(item.priceSnapshot * (item.qty ?? 1))
                              : '—'}
                          </p>
                        </div>
                      ))}
                      {extra > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          +{extra} more item{extra > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total footer */}
                  <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-t border-border/50">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Total
                    </span>
                    <span className="font-bold text-sm text-foreground tabular-nums">
                      {order.total != null ? formatPrice(order.total) : '—'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
