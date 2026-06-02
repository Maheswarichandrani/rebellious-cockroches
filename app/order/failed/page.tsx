import Link from 'next/link'
import { FiXCircle, FiRefreshCw, FiMessageSquare } from 'react-icons/fi'

export const metadata = {
  title: 'Payment Failed | CJP Brand Store',
}

export default function OrderFailedPage() {
  return (
    <main className="min-h-screen pt-[100px] pb-24">
      <div className="page-container-narrow">

        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <FiXCircle size={32} className="text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            Payment Failed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Your payment could not be processed. No money has been deducted from your account.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-card mb-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            What you can do
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-foreground font-bold">1.</span>
              Check that your card details and billing address are correct.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-foreground font-bold">2.</span>
              Ensure your card has sufficient funds or try a different payment method.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-foreground font-bold">3.</span>
              If the problem persists, contact your bank or reach out to our support team.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/checkout"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground h-10 px-6 text-xs font-bold uppercase tracking-[0.12em] hover:bg-primary/90 transition-colors"
          >
            <FiRefreshCw size={13} />
            Retry Payment
          </Link>
          <Link
            href="/contact"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card text-foreground h-10 px-6 text-xs font-bold uppercase tracking-[0.12em] hover:bg-accent transition-colors"
          >
            <FiMessageSquare size={13} />
            Contact Support
          </Link>
        </div>

      </div>
    </main>
  )
}
