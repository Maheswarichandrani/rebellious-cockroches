import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiChevronRight } from 'react-icons/fi'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { PRODUCT_BY_SLUG_QUERY, ALL_PRODUCT_SLUGS_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { ProductClient } from '@/components/product/product-client'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const { data: slugs } = await sanityFetch({
    query: ALL_PRODUCT_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  return slugs.map((s) => ({ id: s.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const product = await client.fetch(PRODUCT_BY_SLUG_QUERY, { slug: id })

  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.seo?.metaTitle ?? product.name} | CJP Brand Store`,
    description: product.seo?.metaDescription ?? undefined,
    openGraph: product.seo?.ogImage?.asset
      ? { images: [urlFor(product.seo.ogImage).width(1200).url()] }
      : undefined,
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params

  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug: id },
  })

  if (!product) notFound()

  return (
    <main className="min-h-screen pt-6 pb-24 md:pt-8">
      <div className="page-container">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1 overflow-hidden text-xs text-muted-foreground">
          <Link href="/" className="shrink-0 transition-colors hover:text-foreground">Home</Link>
          <FiChevronRight size={12} className="shrink-0" />
          <Link href="/shop" className="shrink-0 transition-colors hover:text-foreground">Shop</Link>
          {product.category && (
            <>
              <FiChevronRight size={12} className="hidden shrink-0 sm:block" />
              <span className="hidden shrink-0 sm:block">{product.category.name}</span>
            </>
          )}
          <FiChevronRight size={12} className="shrink-0" />
          <span className="min-w-0 truncate text-foreground">{product.name}</span>
        </nav>

        <ProductClient product={product} />

      </div>

      <SanityLive />

    </main>
  )
}
