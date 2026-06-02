'use client'

import { PortableText } from '@portabletext/react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/formatters'
import { useProductVariant } from '@/hooks/use-product-variant'
import { ProductImages } from './product-images'
import { ProductActions } from './product-actions'
import type { PRODUCT_BY_SLUG_QUERY_RESULT } from '@/sanity.types'

type Product = NonNullable<PRODUCT_BY_SLUG_QUERY_RESULT>

export function ProductClient({ product }: { product: Product }) {
  const variantState = useProductVariant(product)

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16 xl:grid-cols-[1fr_480px]">

      {/* LEFT: images — key resets carousel activeIndex on variant change */}
      <ProductImages
        key={variantState.variantIndex}
        images={variantState.images}
        productName={product.name ?? ''}
      />

      {/* RIGHT: sticky info panel */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-[100px] lg:self-start">

        {/* Name + price */}
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-foreground md:text-3xl">
            {product.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
            <span className="text-xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <Badge className="bg-green-600 text-white hover:bg-green-600 text-[10px] px-1.5 py-0.5">
                  {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Color, size, qty, add to cart */}
        <ProductActions product={product} variantState={variantState} />

        {/* Description */}
        {product.description && product.description.length > 0 && (
          <>
            <Separator />
            <div className="prose prose-sm max-w-none leading-relaxed text-muted-foreground [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-foreground">
              <PortableText value={product.description} />
            </div>
          </>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-wider">
                {tag}
              </Badge>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
