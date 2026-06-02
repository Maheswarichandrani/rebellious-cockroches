'use client'

import { FiShoppingBag } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCartStore, selectCartItemCount } from '@/hooks/use-cart'
import { CartItemRow } from './cart-item'
import { CartSummary } from './cart-summary'

export function CartSidebar() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const itemCount = useCartStore(selectCartItemCount)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex w-full flex-col p-0 sm:max-w-[400px]"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-5 py-4 gap-0">
          <div className="flex items-center gap-2.5">
            <FiShoppingBag size={18} className="text-foreground" />
            <SheetTitle className="text-sm font-bold uppercase tracking-[0.12em] text-foreground">
              Your Cart
            </SheetTitle>
            {itemCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold tabular-nums"
              >
                {itemCount}
              </Badge>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            aria-label="Close cart"
          >
            Close
          </button>
        </SheetHeader>

        {/* Item list */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <FiShoppingBag size={32} className="text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Your cart is empty
            </p>
            <p className="text-xs text-muted-foreground/60">
              Add some items to get started.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 scrollbar-hide">
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.colorVariantSlug}-${item.size}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer summary — only visible when cart has items */}
        {items.length > 0 && <CartSummary />}
      </SheetContent>
    </Sheet>
  )
}
