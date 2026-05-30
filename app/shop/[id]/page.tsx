import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa6'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { PRODUCT_BY_SLUG_QUERY, ALL_PRODUCT_SLUGS_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { formatPrice } from '@/lib/formatters'
import { Separator } from '@/components/ui/separator'
import { ProductImages } from '@/components/product/product-images'
import { ProductActions } from '@/components/product/product-actions'

export const revalidate = 3600

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

  // Build all image URLs from ALL color variants for the default (first) variant
  const firstVariant = product.colorVariants[0]
  const allImages = (firstVariant?.images ?? [])
    .filter((img) => img.asset != null)
    .map((img) => ({
      url: urlFor(img).width(900).height(1200).fit('crop').auto('format').url(),
      alt: img.alt ?? product.name,
    }))

  return (
    <main className="min-h-screen pt-[80px] md:pt-[100px] pb-24">
      <div className="page-container">

        {/* Back */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <FaArrowLeft size={10} />
          Back to Shop
        </Link>

        {/* Two-column PDP layout */}
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16 xl:grid-cols-[1fr_480px]">

          {/* ── LEFT: Images ── */}
          <ProductImages images={allImages} productName={product.name} />

          {/* ── RIGHT: Info panel ── */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-[120px] lg:self-start">

            {/* Name + price */}
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-foreground md:text-3xl">
                {product.name}
              </h1>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Interactive: color, size, qty, add-to-cart */}
            <ProductActions product={product} />

            {/* Description */}
            {product.description && product.description.length > 0 && (
              <>
                <Separator />
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-foreground">
                  <PortableText value={product.description} />
                </div>
              </>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  )
}
