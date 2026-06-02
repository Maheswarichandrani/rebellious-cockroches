import { Suspense } from 'react'
import { client } from '@/sanity/lib/client'
import { CATEGORIES_QUERY } from '@/sanity/lib/queries'
import { ProductCard } from '@/components/shared/product-card'
import { ShopToolbar } from './_components/shop-toolbar'
import { cn } from '@/lib/utils'
import type { PRODUCTS_QUERY_RESULT, CATEGORIES_QUERY_RESULT } from '@/sanity.types'

export const revalidate = 3600

export const metadata = {
  title: 'Shop | CJP Brand Store',
  description: 'Browse all our premium CJP T-shirts and streetwear.',
}

// ── Types ──────────────────────────────────────────────────────────────────────

type SearchParams = Promise<{
  availability?: string
  price?: string
  category?: string
  sort?: string
  view?: string
}>

// ── GROQ query builder ────────────────────────────────────────────────────────

const PRODUCT_PROJECTION = `
  _id,
  name,
  "slug": slug.current,
  price,
  compareAtPrice,
  featured,
  "colorVariants": colorVariants[]{
    _key, name, hex,
    "slug": slug.current,
    images[]{ _type, asset, hotspot, alt },
    sizes[]{ _key, size, stock }
  },
  "category": category->{ _id, name, "slug": slug.current }
`

function buildProductsQuery(
  params: { availability?: string; price?: string; sort?: string },
  safeCategory: string
): { query: string; groqParams: Record<string, string> } {
  const filters = ['_type == "product"']
  const groqParams: Record<string, string> = {}

  if (params.availability === 'in-stock')
    filters.push('count(colorVariants[count(sizes[stock > 0]) > 0]) > 0')
  else if (params.availability === 'out-of-stock')
    filters.push('count(colorVariants[count(sizes[stock > 0]) > 0]) == 0')

  if (params.price === 'under-500')      filters.push('price < 500')
  else if (params.price === '500-1000')  filters.push('price >= 500 && price <= 1000')
  else if (params.price === 'over-1000') filters.push('price > 1000')

  if (safeCategory) {
    filters.push('category->slug.current == $cat')
    groqParams.cat = safeCategory
  }

  const orderBy =
    params.sort === 'price-asc'  ? 'price asc' :
    params.sort === 'price-desc' ? 'price desc' :
    params.sort === 'featured'   ? 'featured desc, _createdAt desc' :
    '_createdAt desc'

  return {
    query: `*[${filters.join(' && ')}] | order(${orderBy}) { ${PRODUCT_PROJECTION} }`,
    groqParams,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const categories = await client.fetch<CATEGORIES_QUERY_RESULT>(CATEGORIES_QUERY)

  // Validate category slug against real data — prevents invalid GROQ params
  const safeCategory =
    params.category && categories.some((c) => c.slug === params.category)
      ? params.category
      : ''

  const { query, groqParams } = buildProductsQuery(params, safeCategory)
  const products = await client.fetch<PRODUCTS_QUERY_RESULT>(query, groqParams)

  const view = params.view ?? 'grid'
  const gridClass = view === 'list' ? 'product-grid-3' : 'product-grid'
  const hasFilters = !!(params.availability || params.price || safeCategory)

  return (
    <main className="min-h-screen pt-6 pb-24 md:pt-8">
      <div className="page-container">

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Full Range
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl lg:text-6xl text-foreground">
            All Products
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Explore the complete CJP collection — premium quality T-shirts in every colour and size.
          </p>
        </div>

        {/* Toolbar — Suspense required for useSearchParams */}
        <Suspense fallback={<div className="h-[52px] border-b border-border" />}>
          <ShopToolbar totalCount={products.length} categories={categories} />
        </Suspense>

        {/* Products */}
        {products.length > 0 ? (
          <div className={cn(gridClass, 'mt-8')}>
            {products.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <p className="text-sm font-medium text-foreground">No products found</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters ? 'Try adjusting or clearing your filters.' : 'Products coming soon.'}
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
