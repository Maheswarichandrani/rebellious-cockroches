'use client'

import { useState } from 'react'
import { FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/hooks/use-cart'
import { urlFor } from '@/sanity/lib/image'
import type { PRODUCT_BY_SLUG_QUERY_RESULT } from '@/sanity.types'

type Product = NonNullable<PRODUCT_BY_SLUG_QUERY_RESULT>
type ColorVariant = Product['colorVariants'][number]
type SizeEntry = ColorVariant['sizes'][number]

interface ProductActionsProps {
  product: Product
  onVariantChange?: (variantIndex: number) => void
}

export function ProductActions({ product, onVariantChange }: ProductActionsProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { addItem, openCart } = useCartStore()

  const variant = product.colorVariants[selectedVariantIndex]

  function handleVariantChange(idx: number) {
    setSelectedVariantIndex(idx)
    setSelectedSize(null)
    setQty(1)
    onVariantChange?.(idx)
  }

  function handleAddToCart() {
    if (!selectedSize || !variant) return

    const imageUrl =
      variant.images[0]?.asset
        ? urlFor(variant.images[0]).width(400).height(533).fit('crop').auto('format').url()
        : ''

    addItem({
      productId: product._id,
      productSlug: product.slug,
      name: product.name,
      colorVariantSlug: variant.slug,
      colorVariantName: variant.name,
      size: selectedSize,
      qty,
      priceSnapshot: product.price,
      compareAtPriceSnapshot: product.compareAtPrice ?? undefined,
      imageSnapshot: imageUrl,
    })

    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  const selectedSizeEntry = variant?.sizes.find((s) => s.size === selectedSize)
  const isSoldOut = selectedSizeEntry?.stock === 0
  const canAdd = selectedSize && !isSoldOut

  return (
    <div className="flex flex-col gap-5">

      {/* Color */}
      {product.colorVariants.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Colour
            </span>
            <span className="text-xs text-muted-foreground">{variant?.name}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colorVariants.map((v, idx) => (
              <button
                key={v._key}
                onClick={() => handleVariantChange(idx)}
                aria-label={`Select colour ${v.name}`}
                aria-pressed={idx === selectedVariantIndex}
                className={cn(
                  'relative h-8 w-8 rounded-full border-2 transition-all duration-150',
                  idx === selectedVariantIndex
                    ? 'border-foreground shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--foreground))]'
                    : 'border-border hover:border-foreground/50'
                )}
                style={{ background: v.hex ?? '#ccc' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {variant?.sizes && variant.sizes.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Size
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {variant.sizes.map((s) => {
              const outOfStock = s.stock === 0
              const isSelected = selectedSize === s.size
              return (
                <button
                  key={s._key}
                  onClick={() => !outOfStock && setSelectedSize(s.size)}
                  disabled={outOfStock}
                  aria-pressed={isSelected}
                  aria-label={`Size ${s.size}${outOfStock ? ', sold out' : ''}`}
                  className={cn(
                    'relative min-w-[3rem] rounded-md border px-4 py-2.5 text-xs font-semibold transition-all duration-150',
                    isSelected
                      ? 'border-foreground bg-foreground text-primary-foreground'
                      : outOfStock
                        ? 'cursor-not-allowed border-border text-muted-foreground/40'
                        : 'border-border text-foreground hover:border-foreground'
                  )}
                >
                  {s.size}
                  {outOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-px w-3/4 bg-muted-foreground/30 rotate-[-25deg]" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {!selectedSize && (
            <p className="mt-2 text-[11px] text-muted-foreground">Please select a size.</p>
          )}
        </div>
      )}

      <Separator />

      {/* Qty + Add to Cart */}
      <div className="flex items-center gap-3">
        {/* Qty stepper */}
        <div className="flex items-center rounded-md border border-border overflow-hidden shrink-0">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex h-11 w-10 items-center justify-center text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Decrease quantity"
          >
            <FiMinus size={13} />
          </button>
          <span className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums text-foreground">
            {qty}
          </span>
          <button
            onClick={() => setQty(qty + 1)}
            className="flex h-11 w-10 items-center justify-center text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Increase quantity"
          >
            <FiPlus size={13} />
          </button>
        </div>

        {/* Add to Cart */}
        <Button
          size="lg"
          className={cn(
            'flex-1 h-11 gap-2 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200',
            !canAdd && 'opacity-60'
          )}
          onClick={handleAddToCart}
          disabled={!canAdd}
        >
          <FiShoppingBag size={15} />
          {added ? 'Added!' : isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>

    </div>
  )
}
