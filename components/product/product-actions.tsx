'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiShoppingBag, FiMinus, FiPlus, FiShare2, FiCheck, FiTruck, FiRefreshCw, FiShield, FiZap } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/hooks/use-cart'
import { useShare } from '@/hooks/use-share'
import { urlFor } from '@/sanity/lib/image'
import { SizeGuideDialog } from './size-guide-dialog'
import type { PRODUCT_BY_SLUG_QUERY_RESULT } from '@/sanity.types'
import type { ProductVariantState } from '@/hooks/use-product-variant'

type Product = NonNullable<PRODUCT_BY_SLUG_QUERY_RESULT>

interface ProductActionsProps {
  product: Product
  variantState: ProductVariantState
}

export function ProductActions({ product, variantState }: ProductActionsProps) {
  const [added, setAdded] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  const { addItem, openCart } = useCartStore()
  const { share, copied } = useShare(product.name ?? '')
  const router = useRouter()

  const {
    variant, variantIndex, selectVariant,
    selectedSize, setSelectedSize,
    qty, incrementQty, decrementQty,
    selectedSizeEntry,
    isSoldOut, canAddToCart,
  } = variantState

  function buildCartItem() {
    if (!canAddToCart || !variant || !selectedSize) return null
    const imageUrl = variant.images[0]?.asset
      ? urlFor(variant.images[0]).width(400).height(533).fit('crop').auto('format').url()
      : ''
    return {
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
    }
  }

  function handleAddToCart() {
    const item = buildCartItem()
    if (!item) return
    addItem(item)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    const item = buildCartItem()
    if (!item) return
    addItem(item)
    router.push('/checkout')
  }

  const isLowStock = selectedSizeEntry !== null && selectedSizeEntry.stock > 0 && selectedSizeEntry.stock <= 5

  return (
    <div className="flex flex-col gap-5">

      {/* Color swatches */}
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
                onClick={() => selectVariant(idx)}
                aria-label={`Select colour ${v.name}`}
                aria-pressed={idx === variantIndex}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all duration-150',
                  idx === variantIndex
                    ? 'border-foreground shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--foreground))]'
                    : 'border-border hover:border-foreground/50'
                )}
                style={{ background: v.hex ?? '#ccc' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {variant?.sizes && variant.sizes.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Size
            </span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => setSizeGuideOpen(true)}
            >
              Size Guide
            </Button>
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
                      <span className="h-px w-3/4 rotate-[-25deg] bg-muted-foreground/30" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex items-center gap-2">
            {!selectedSize && (
              <p className="text-[11px] text-muted-foreground">Please select a size.</p>
            )}
            {isLowStock && (
              <Badge variant="outline" className="border-amber-500 text-amber-600 text-[10px]">
                Only {selectedSizeEntry!.stock} left
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Qty + Add to Cart + Share */}
      <div className="flex items-center gap-2">
        {/* Qty stepper */}
        <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-10 rounded-none"
            onClick={decrementQty}
            aria-label="Decrease quantity"
          >
            <FiMinus size={13} />
          </Button>
          <span className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums text-foreground">
            {qty}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-10 rounded-none"
            onClick={incrementQty}
            aria-label="Increase quantity"
          >
            <FiPlus size={13} />
          </Button>
        </div>

        {/* Add to Cart */}
        <Button
          size="lg"
          className={cn(
            'h-11 flex-1 gap-2 text-xs font-bold uppercase tracking-[0.1em]',
            !canAddToCart && 'opacity-60'
          )}
          onClick={handleAddToCart}
          disabled={!canAddToCart}
        >
          <FiShoppingBag size={15} />
          {added ? 'Added!' : isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </Button>

        {/* Share */}
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={share}
          aria-label="Share product"
        >
          {copied ? <FiCheck size={15} /> : <FiShare2 size={15} />}
        </Button>
      </div>

      {/* Buy It Now */}
      <Button
        size="lg"
        variant="outline"
        className={cn(
          'h-11 w-full gap-2 text-xs font-bold uppercase tracking-[0.1em]',
          !canAddToCart && 'opacity-60'
        )}
        onClick={handleBuyNow}
        disabled={!canAddToCart}
      >
        <FiZap size={14} />
        Buy It Now
      </Button>

      {/* Trust badges */}
      <div className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-muted/40 px-3.5 py-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-2">
          <FiTruck size={12} className="shrink-0" />
          Free shipping above ₹999
        </span>
        <span className="flex items-center gap-2">
          <FiRefreshCw size={12} className="shrink-0" />
          Easy 7-day returns
        </span>
        <span className="flex items-center gap-2">
          <FiShield size={12} className="shrink-0" />
          Secure checkout
        </span>
      </div>

      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </div>
  )
}
