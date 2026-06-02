'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { cn } from '@/lib/utils'

export interface ProductImage {
  url: string
  alt: string
}

interface ProductImagesProps {
  images: ProductImage[]
  productName: string
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <>
        <div className="hidden lg:block aspect-[3/4] w-full rounded-sm bg-muted" />
        <div className="lg:hidden aspect-[4/5] w-full rounded-sm bg-muted" />
      </>
    )
  }

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIndex((i) => (i + 1) % images.length)

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const delta = touchStart - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
    setTouchStart(null)
  }

  const isOdd = images.length % 2 !== 0

  return (
    <>
      {/* ── Desktop: 2-col grid (Myntra-style) ── */}
      <div className="hidden lg:block">
        <div className={cn('grid gap-2', images.length > 1 && 'grid-cols-2')}>
          {images.map((img, i) => (
            <div
              key={i}
              className={cn(
                'relative aspect-[3/4] overflow-hidden rounded-sm bg-muted',
                images.length > 1 && i === 0 && isOdd && 'col-span-2'
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || productName}
                fill
                className="object-cover object-top"
                priority={i < 2}
                sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 40vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: Flipkart-style carousel ── */}
      <div className="lg:hidden">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={images[activeIndex].url}
                alt={images[activeIndex].alt || productName}
                fill
                className="object-cover object-top"
                priority
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <span className="absolute right-3 top-3 z-10 rounded-sm bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm tabular-nums">
              {activeIndex + 1} / {images.length}
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-1.5 shadow-sm backdrop-blur-sm"
              >
                <FiChevronLeft size={16} className="text-foreground" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-1.5 shadow-sm backdrop-blur-sm"
              >
                <FiChevronRight size={16} className="text-foreground" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === activeIndex
                    ? 'h-1.5 w-5 bg-foreground'
                    : 'h-1.5 w-1.5 bg-foreground/25 hover:bg-foreground/50'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
