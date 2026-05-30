'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingBag } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'
import { formatPrice } from '@/lib/formatters'
import type { FEATURED_PRODUCTS_QUERY_RESULT } from '@/sanity.types'

// Use the featured query shape (minimal). PRODUCTS_QUERY_RESULT is a superset — assignable.
export type ProductCardProduct = FEATURED_PRODUCTS_QUERY_RESULT[number]

function ArrowRight() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
      <line x1="0" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 1L19 6L12 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function ArrowLeft() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
      <line x1="20" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 1L1 6L8 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function ProductCard({ _id, name, slug, price, compareAtPrice, colorVariants }: ProductCardProduct) {
  const [imgIndex, setImgIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const firstVariant = colorVariants[0]
  const images = firstVariant?.images ?? []

  const imageUrls = images
    .filter((img) => img.asset != null)
    .map((img) =>
      urlFor(img).width(600).height(800).fit('crop').auto('format').url()
    )

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex((imgIndex - 1 + imageUrls.length) % imageUrls.length)
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex((imgIndex + 1) % imageUrls.length)
  }

  return (
    <article className="flex flex-col">
      <Link href={`/shop/${slug}`} className="block">

        {/* Image area */}
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative aspect-[3/5] w-full overflow-hidden bg-card sm:aspect-[3/4]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={imgIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {imageUrls[imgIndex] ? (
                <Image
                  src={imageUrls[imgIndex]}
                  alt={images[imgIndex]?.alt ?? name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls — visible on hover */}
          <AnimatePresence>
            {isHovered && (
              <>
                {imageUrls.length > 1 && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      onClick={prev}
                      aria-label="Previous image"
                      className="absolute left-3 cursor-pointer top-1/2 z-10 -translate-y-1/2 text-foreground/80"
                    >
                      <ArrowLeft />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ duration: 0.2, ease: 'easeOut', delay: 0.04 }}
                      onClick={next}
                      aria-label="Next image"
                      className="absolute right-3 cursor-pointer top-1/2 z-10 -translate-y-1/2 text-foreground/80"
                    >
                      <ArrowRight />
                    </motion.button>
                  </>
                )}

                {/* CTA bar */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-center gap-2 rounded-md bg-background/95 py-2 shadow-md backdrop-blur-sm"
                >
                  <FiShoppingBag size={13} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">
                    Select options
                  </span>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Dot indicators */}
          {imageUrls.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {imageUrls.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'block h-1 rounded-full transition-all duration-200',
                    i === imgIndex ? 'w-3 bg-foreground' : 'w-1 bg-foreground/30'
                  )}
                />
              ))}
            </div>
          )}

          {/* Sale badge */}
          {compareAtPrice && compareAtPrice > price && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Sale
            </span>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 pb-3 pt-2.5">
          <p className="text-sm font-medium leading-snug text-foreground">{name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{formatPrice(price)}</p>
            {compareAtPrice && compareAtPrice > price && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </p>
            )}
          </div>
        </div>

      </Link>
    </article>
  )
}
