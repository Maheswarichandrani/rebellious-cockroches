import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative flex items-center overflow-hidden min-h-[90vh]">

      <Image
        src="/hero.webp"
        alt="New arrivals — Rebellious Cockroaches"
        fill
        priority
        quality={90}
        className="object-cover object-[center_20%]"
        sizes="100vw"
      />

      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, transparent 20%, oklch(0 0 0 / 0.28) 100%)" }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-10 relative z-10 py-20 text-white flex flex-col items-center text-center">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4 text-white/70">
          SS25 Collection
        </p>

        <h1 className="font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance text-white">
          New Arrivals
        </h1>

        <p className="mt-5 max-w-md text-[15px] font-normal leading-relaxed text-white/70">
          Premium streetwear for those who refuse to blend in.
        </p>

        <div className="mt-10">
          <Link
            href="/shop"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-white/80 bg-transparent px-10 py-6 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:border-white hover:bg-white hover:text-foreground"
            )}
          >
            Shop Now
          </Link>
        </div>

      </div>

    </section>
  )
}
