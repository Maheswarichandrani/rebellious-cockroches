import { client } from '@/sanity/lib/client'
import { HERO_CONTENT_QUERY, FEATURED_PRODUCTS_QUERY } from '@/sanity/lib/queries'
import { HeroSection } from '@/components/sections/landing-page/hero-section'
import { FeaturedProductsSection } from '@/components/sections/landing-page/featured-products-section'

export default async function Home() {
  const [hero, featuredProducts] = await Promise.all([
    client.fetch(HERO_CONTENT_QUERY, {}, { next: { revalidate: 3600 } }),
    client.fetch(FEATURED_PRODUCTS_QUERY, {}, { next: { revalidate: 3600 } }),
  ]);

  return (
    <>
      <HeroSection hero={hero} />
      <FeaturedProductsSection products={featuredProducts} />
    </>
  )
}
