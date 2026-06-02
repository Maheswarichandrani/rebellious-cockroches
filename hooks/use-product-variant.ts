'use client'

import { useState, useMemo } from 'react'
import { urlFor } from '@/sanity/lib/image'
import type { PRODUCT_BY_SLUG_QUERY_RESULT } from '@/sanity.types'

type Product = NonNullable<PRODUCT_BY_SLUG_QUERY_RESULT>

function firstInStockSize(variant: Product['colorVariants'][number] | undefined): string | null {
  return variant?.sizes.find((s) => s.stock > 0)?.size ?? null
}

export function useProductVariant(product: Product) {
  const [variantIndex, setVariantIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(() =>
    firstInStockSize(product.colorVariants[0])
  )
  const [qty, setQty] = useState(1)

  const variant = product.colorVariants[variantIndex]

  const images = useMemo(
    () =>
      (variant?.images ?? [])
        .filter((img) => img.asset != null)
        .map((img) => ({
          url: urlFor(img).width(900).height(1200).fit('crop').auto('format').url(),
          alt: img.alt ?? product.name ?? '',
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variantIndex, product._id]
  )

  function selectVariant(idx: number) {
    setVariantIndex(idx)
    setSelectedSize(firstInStockSize(product.colorVariants[idx]))
    setQty(1)
  }

  const selectedSizeEntry = variant?.sizes.find((s) => s.size === selectedSize) ?? null

  function incrementQty() {
    const max = selectedSizeEntry?.stock ?? 99
    setQty((q) => Math.min(q + 1, max))
  }

  function decrementQty() {
    setQty((q) => Math.max(1, q - 1))
  }

  const isSoldOut = selectedSizeEntry?.stock === 0
  const canAddToCart = !!selectedSize && !isSoldOut

  return {
    variant,
    variantIndex,
    selectVariant,
    images,
    selectedSize,
    setSelectedSize,
    qty,
    incrementQty,
    decrementQty,
    selectedSizeEntry,
    isSoldOut,
    canAddToCart,
  }
}

export type ProductVariantState = ReturnType<typeof useProductVariant>
