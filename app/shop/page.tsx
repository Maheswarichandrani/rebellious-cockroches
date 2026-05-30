import { sanityFetch } from '@/sanity/lib/live'
import { PRODUCTS_QUERY } from '@/sanity/lib/queries'
import { ProductCard } from '@/components/shared/product-card'

export const revalidate = 1800

export const metadata = {
  title: 'Shop | CJP Brand Store',
  description: 'Browse all our premium CJP T-shirts and streetwear.',
}

export default async function ShopPage() {
  const { data: products } = await sanityFetch({ query: PRODUCTS_QUERY })

  return (
    <main className="min-h-screen pt-[120px] pb-24">
      <div className="page-container">

        <div className="mb-12 md:mb-16">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Full Range
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl lg:text-6xl text-foreground">
            All Products
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-muted-foreground leading-relaxed">
            Explore the complete CJP collection — premium quality T-shirts in every colour and size.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm text-muted-foreground">Products coming soon.</p>
          </div>
        )}

      </div>
    </main>
  )
}
