import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { TrackOrderForm } from './_components/track-form'

export const metadata = {
  title: 'Track Order | CJP Brand Store',
}

export default async function TrackOrderPage() {
  const user         = await currentUser()
  const prefillEmail = user?.emailAddresses[0]?.emailAddress
  const isLoggedIn   = !!user

  return (
    <main className="min-h-screen pt-6 pb-24 md:pt-8">
      <div className="page-container-narrow">

        <div className="mb-8">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Order Tracking
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your order number from your confirmation email to see live status.
          </p>
        </div>

        {/* Logged-in shortcut */}
        {isLoggedIn && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-sm text-muted-foreground">
              Signed in — email pre-filled. Or view all orders at once.
            </p>
            <Link
              href="/account"
              className="flex-shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80 transition-colors"
            >
              My Orders →
            </Link>
          </div>
        )}

        <TrackOrderForm prefillEmail={prefillEmail} isLoggedIn={isLoggedIn} />

      </div>
    </main>
  )
}
