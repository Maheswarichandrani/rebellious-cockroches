'use client'

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { formatPrice } from '@/lib/formatters'
import { useCartStore, selectCartTotal } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

export function CartSummary() {
  const total = useCartStore(selectCartTotal)

  return (
    <div className="flex flex-col gap-4 p-4 pt-2">
      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Subtotal
        </span>
        <span className="text-base font-extrabold tracking-tight text-foreground tabular-nums">
          {formatPrice(total)}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Shipping &amp; taxes calculated at checkout.
      </p>

      <Link
        href="/checkout"
        className={cn(
          buttonVariants({ variant: 'default', size: 'lg' }),
          'w-full justify-center text-xs font-bold uppercase tracking-[0.12em]'
        )}
      >
        Checkout
      </Link>

      <Link
        href="/shop"
        className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  )
}
