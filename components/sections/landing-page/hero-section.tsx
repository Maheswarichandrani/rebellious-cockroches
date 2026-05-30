import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { urlFor } from '@/sanity/lib/image'
import type { HERO_CONTENT_QUERY_RESULT } from '@/sanity.types'

interface HeroSectionProps {
  hero: HERO_CONTENT_QUERY_RESULT
}

export function HeroSection({ hero }: HeroSectionProps) {
  const eyebrow = hero?.eyebrow ?? 'SS25 Collection'
  const heading = hero?.heading ?? 'New Arrivals'
  const subtext = hero?.subtext ?? 'Premium streetwear for those who refuse to blend in.'
  const ctaText = hero?.ctaText ?? 'Shop Now'
  const ctaLink = hero?.ctaLink ?? '/shop'

  const bgImageUrl =
    hero?.backgroundImage?.asset
      ? urlFor(hero.backgroundImage).width(1920).quality(90).auto('format').url()
      : null

  return (
    <section className="relative flex items-center overflow-hidden min-h-[95vh]">

      {bgImageUrl ? (
        <Image
          src={bgImageUrl}
          alt={heading}
          fill
          priority
          quality={90}
          className="object-cover object-top sm:object-[center_20%]"
          sizes="100vw"
        />
      ) : (
        <Image
          src="/hero.webp"
          alt={heading}
          fill
          priority
          quality={90}
          className="object-cover object-top sm:object-[center_20%]"
          sizes="100vw"
        />
      )}

      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, transparent 20%, oklch(0 0 0 / 0.28) 100%)' }}
        aria-hidden="true"
      />

      <div
        className="absolute sm:hidden inset-x-0 top-0 h-32 bg-gradient-to-b from-white/50 to-transparent mix-blend-screen"
        aria-hidden="true"
      />

      <div className="page-container relative z-10 py-20 text-white flex flex-col items-center text-center">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4 text-white/70">
          {eyebrow}
        </p>

        <h1 className="font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance text-white">
          {heading}
        </h1>

        <p className="mt-5 max-w-md text-[15px] font-normal leading-relaxed text-white/70">
          {subtext}
        </p>

        <div className="mt-10">
          <Link
            href={ctaLink}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'border-white/80 bg-transparent px-10 py-6 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:border-white hover:bg-white hover:text-foreground'
            )}
          >
            {ctaText}
          </Link>
        </div>

      </div>
    </section>
  )
}
