'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductImage {
  url: string
  alt: string
}

interface ProductImagesProps {
  images: ProductImage[]
  productName: string
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
  }

  return (
    <>
      {/* ── Desktop: 2-column grid ── */}
      <div className="hidden md:block">
        {images.length === 1 ? (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-card shadow-card">
            <Image
              src={images[0].url}
              alt={images[0].alt}
              fill
              className="object-cover object-top"
              priority
              sizes="50vw"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-card shadow-card"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover object-top"
                  priority={i < 2}
                  sizes="25vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile: carousel ── */}
      <div className="md:hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-card shadow-card">
          <AnimatePresence mode="wait">
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
                alt={images[activeIndex].alt}
                fill
                className="object-cover object-top"
                priority
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'block rounded-full transition-all duration-200',
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
