'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProductCard, type ProductCardProduct } from '@/components/shared/product-card'

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
}

interface FeaturedProductsSectionProps {
  products: ProductCardProduct[]
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section className="section-py">
      <div className="page-container">

        <div className="mb-10 flex items-end justify-between md:mb-14">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Curated Selection
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl lg:text-5xl text-foreground">
              Featured T-Shirts
            </h2>
          </div>
          <Link
            href="/shop"
            className="group hidden md:inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-all hover:border-foreground"
          >
            Explore Collection
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {products.length > 0 ? (
          <motion.div
            className="product-grid"
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={cardVariants}>
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground">No featured products yet.</p>
        )}

        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-all hover:border-foreground"
          >
            Explore Collection
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

      </div>
    </section>
  )
}
