'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingBag, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'
import { formatPrice } from '@/lib/formatters'
import type { FEATURED_PRODUCTS_QUERY_RESULT } from '@/sanity.types'

export type ProductCardProduct = FEATURED_PRODUCTS_QUERY_RESULT[number]

export function ProductCard({ name, slug, price, compareAtPrice, colorVariants }: ProductCardProduct) {
  const [imgIndex, setImgIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const firstVariant = colorVariants[0]
  const images = firstVariant?.images ?? []

  const imageUrls = images
    .filter((img) => img.asset != null)
    .map((img) => urlFor(img).width(600).height(800).fit('crop').auto('format').url())

  const hasMultiple = imageUrls.length > 1

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length)
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex((i) => (i + 1) % imageUrls.length)
  }

  return (
    <article className="group flex flex-col">
      <Link href={`/shop/${slug}`} className="block">

        {/* Image */}
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative aspect-[3/4] w-full overflow-hidden bg-muted"
        >
          {/* Image crossfade */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={imgIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              {imageUrls[imgIndex] ? (
                <Image
                  src={imageUrls[imgIndex]}
                  alt={images[imgIndex]?.alt ?? name ?? ''}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sale badge */}
          {compareAtPrice != null && compareAtPrice > price && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
              Sale
            </span>
          )}

          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <>
                {/* Prev / Next arrows */}
                {hasMultiple && (
                  <>
                    <motion.button
                      key="prev"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      onClick={prev}
                      aria-label="Previous image"
                      className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
                    >
                      <FiArrowLeft size={14} />
                    </motion.button>

                    <motion.button
                      key="next"
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      onClick={next}
                      aria-label="Next image"
                      className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
                    >
                      <FiArrowRight size={14} />
                    </motion.button>
                  </>
                )}

                {/* CTA bar */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 bg-foreground py-2.5 text-background"
                >
                  <FiShoppingBag size={13} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
                    Select options
                  </span>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Dot indicators — hidden on hover so they don't clash with CTA */}
          {hasMultiple && (
            <motion.div
              animate={{ opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1"
            >
              {imageUrls.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'block h-1 rounded-full transition-all duration-200',
                    i === imgIndex ? 'w-3 bg-foreground' : 'w-1 bg-foreground/30'
                  )}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex flex-col gap-1 pt-3">
          <p className="text-sm font-medium leading-snug text-foreground">{name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{formatPrice(price)}</p>
            {compareAtPrice != null && compareAtPrice > price && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
