'use client'

import Image from 'next/image'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/formatters'
import { useCartStore, type CartItem } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

interface CartItemProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemProps) {
  const { removeItem, updateQty } = useCartStore()

  const lineTotal = item.priceSnapshot * item.qty

  return (
    <div className="flex gap-3 py-4">
      {/* Image */}
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-card">
        <Image
          src={item.imageSnapshot}
          alt={item.name}
          fill
          className="object-cover object-top"
          sizes="64px"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground leading-snug">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.colorVariantName} · {item.size}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          {/* Qty stepper */}
          <div className="flex items-center gap-1 rounded-md border border-border">
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6 rounded-none rounded-l-md"
              onClick={() =>
                updateQty(
                  item.productId,
                  item.colorVariantSlug,
                  item.size,
                  item.qty - 1
                )
              }
              aria-label="Decrease quantity"
            >
              <FiMinus size={10} />
            </Button>
            <span className="min-w-[1.5rem] text-center text-xs font-medium tabular-nums">
              {item.qty}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6 rounded-none rounded-r-md"
              onClick={() =>
                updateQty(
                  item.productId,
                  item.colorVariantSlug,
                  item.size,
                  item.qty + 1
                )
              }
              aria-label="Increase quantity"
            >
              <FiPlus size={10} />
            </Button>
          </div>

          {/* Line total + remove */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatPrice(lineTotal)}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              onClick={() =>
                removeItem(item.productId, item.colorVariantSlug, item.size)
              }
              aria-label={`Remove ${item.name} from cart`}
            >
              <FiTrash2 size={13} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
