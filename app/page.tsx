import { sanityFetch } from '@/sanity/lib/live'
import { HERO_CONTENT_QUERY, FEATURED_PRODUCTS_QUERY } from '@/sanity/lib/queries'
import { HeroSection } from '@/components/sections/landing-page/hero-section'
import { FeaturedProductsSection } from '@/components/sections/landing-page/featured-products-section'

export const revalidate = 3600

export default async function Home() {
  const [{ data: hero }, { data: featuredProducts }] = await Promise.all([
    sanityFetch({ query: HERO_CONTENT_QUERY }),
    sanityFetch({ query: FEATURED_PRODUCTS_QUERY }),
  ])

  return (
    <>
      <HeroSection hero={hero} />
      <FeaturedProductsSection products={featuredProducts} />
    </>
  )
}
