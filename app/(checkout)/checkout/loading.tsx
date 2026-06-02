import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div data-checkout className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Brand bar */}
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">

          {/* ── Left form skeleton ── */}
          <div className="space-y-0 divide-y divide-border">

            {/* Contact section */}
            <div className="py-6 pt-0 space-y-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            {/* Delivery section */}
            <div className="py-6 space-y-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>

            {/* Shipping method */}
            <div className="py-6 space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>

            {/* Payment */}
            <div className="py-6 space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>

            {/* Billing address */}
            <div className="py-6 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Pay button */}
            <div className="pt-6 space-y-3">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-3 w-36 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>

          </div>

          {/* ── Right order summary skeleton ── */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-xl border border-border bg-card overflow-hidden">

              {/* Items */}
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 px-5 py-4 border-b border-border last:border-0">
                  <Skeleton className="h-16 w-12 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Subtotals */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Total */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-7 w-28" />
                </div>
                <Skeleton className="h-3 w-36 ml-auto" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
