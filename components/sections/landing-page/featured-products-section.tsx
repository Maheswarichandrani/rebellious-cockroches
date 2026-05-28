"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/shared/product-card"

const PRODUCTS = [
  { id: "1", name: "Shaggy Wool Cardigan",       price: "$282.00", images: ["/products/product1.1.webp", "/products/product1.2.webp"] },
  { id: "2", name: "Lightweight Turtleneck Top", price: "$92.00",  images: ["/products/product1.2.webp"] },
  { id: "3", name: "Mohair Shaggy Knit",         price: "$230.00", images: ["/products/product1.3.webp", "/products/product1.4.webp"] },
  { id: "4", name: "Striped Waffle LS Tee",      price: "$75.00",  images: ["/products/product1.4.webp"] },
  { id: "5", name: "Cashmere Zip Sweater",       price: "$212.00", images: ["/products/product1.1.webp", "/products/product1.3.webp"] },
  { id: "6", name: "Ribbed Mock-Neck Sweater",   price: "$148.00", images: ["/products/product1.2.webp"] },
  { id: "7", name: "Relaxed Linen Shirt",        price: "$110.00", images: ["/products/product1.3.webp", "/products/product1.1.webp"] },
  { id: "8", name: "Wide-Leg Wool Trousers",     price: "$195.00", images: ["/products/product1.4.webp"] },
]

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

export function FeaturedProductsSection() {
  return (
    <section className="section-py">
      <div className="page-container">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold leading-snug tracking-[-0.025em] md:text-3xl lg:text-4xl">Featured products</h2>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            View all
          </Link>
        </div>

        <motion.div
          className="product-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {PRODUCTS.map(product => (
            <motion.div key={product.id} variants={cardVariants}>
              <ProductCard {...product} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
