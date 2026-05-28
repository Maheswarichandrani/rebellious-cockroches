"use client"

import { useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { motion } from "framer-motion"
import { FiShoppingBag } from "react-icons/fi"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

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

export interface ProductCardProps {
  id: string
  name: string
  price: string
  images: string[]
}

export function ProductCard({ id, name, price, images }: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)

  /* ── Refs ── */
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef     = useRef<HTMLDivElement>(null)
  const prevBtnRef   = useRef<HTMLButtonElement>(null)
  const nextBtnRef   = useRef<HTMLButtonElement>(null)
  const cartBtnRef   = useRef<HTMLButtonElement>(null)
  const hoverTl      = useRef<gsap.core.Timeline | null>(null)

  /* ── Hover timeline — built once on mount ── */
  useGSAP(() => {
    const controls = [prevBtnRef.current, nextBtnRef.current, cartBtnRef.current]

    // Set initial hidden state via GSAP (not CSS) so it owns the values
    gsap.set(controls, { opacity: 0, scale: 0.88 })
    gsap.set(cartBtnRef.current, { scale: 0.82 })

    hoverTl.current = gsap.timeline({ paused: true })
      .to([prevBtnRef.current, nextBtnRef.current], {
        opacity: 1,
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
        stagger: 0.04,
      })
      .to(cartBtnRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "back.out(1.4)",
      }, "-=0.12")

    return () => { hoverTl.current?.kill() }
  }, { scope: containerRef })

  const onMouseEnter = () => hoverTl.current?.play()
  const onMouseLeave = () => hoverTl.current?.reverse()

  /* ── Image transition — GSAP fade out → swap → fade in ── */
  const changeImage = useCallback((nextIndex: number) => {
    if (!imageRef.current) return
    gsap.to(imageRef.current, {
      opacity: 0,
      duration: 0.18,
      ease: "power1.in",
      onComplete: () => {
        setImgIndex(nextIndex)
        gsap.to(imageRef.current, { opacity: 1, duration: 0.28, ease: "power1.out" })
      },
    })
  }, [])

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    changeImage((imgIndex - 1 + images.length) % images.length)
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    changeImage((imgIndex + 1) % images.length)
  }

  return (
    <article className="flex flex-col">
      <Link href={`/products/${id}`} className="block">

        {/* Image area */}
        <div
          ref={containerRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="relative aspect-[3/5] w-full overflow-hidden bg-card sm:aspect-[3/4]"
        >
          {/* Image wrapper — GSAP owns opacity */}
          <div ref={imageRef} className="absolute inset-0">
            <Image
              src={images[imgIndex]}
              alt={name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>

          {/* Prev arrow — shown on ALL cards */}
          <button
            ref={prevBtnRef}
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 cursor-pointer top-1/2 z-10 -translate-y-1/2 text-foreground/80"
          >
            <ArrowLeft />
          </button>

          {/* Next arrow — shown on ALL cards */}
          <button
            ref={nextBtnRef}
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 cursor-pointer top-1/2 z-10 -translate-y-1/2 text-foreground/80"
          >
            <ArrowRight />
          </button>

          {/* Add to cart */}
          <button
            ref={cartBtnRef}
            onClick={e => { e.preventDefault() /* TODO: dispatch add-to-cart */ }}
            aria-label={`Add ${name} to cart`}
            className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/95 shadow-md backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
          >
            <FiShoppingBag size={15} />
          </button>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block h-1 rounded-full transition-all duration-200",
                    i === imgIndex ? "w-3 bg-foreground" : "w-1 bg-foreground/30"
                  )}
                />
              ))}
            </div>
          )}

        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 pb-3 pt-2.5">
          <p className="text-sm font-medium leading-snug text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{price}</p>
        </div>

      </Link>
    </article>
  )
}

export const MotionProductCard = motion.create(ProductCard)
