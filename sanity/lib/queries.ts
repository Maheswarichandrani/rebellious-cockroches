import { defineQuery } from 'next-sanity'

export const HERO_CONTENT_QUERY = defineQuery(
  `*[_type == "heroContent" && _id == "heroContent-singleton"][0]{
    _id,
    eyebrow,
    heading,
    subtext,
    backgroundImage,
    ctaText,
    ctaLink
  }`
)

export const FEATURED_PRODUCTS_QUERY = defineQuery(
  `*[_type == "product" && featured == true] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    "colorVariants": colorVariants[]{
      _key,
      name,
      hex,
      "slug": slug.current,
      images[]{ _type, asset, hotspot, alt },
      sizes[]{ _key, size, stock }
    }
  }`
)

export const PRODUCTS_QUERY = defineQuery(
  `*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    featured,
    "colorVariants": colorVariants[]{
      _key,
      name,
      hex,
      "slug": slug.current,
      images[]{ _type, asset, hotspot, alt },
      sizes[]{ _key, size, stock }
    },
    "category": category->{ _id, name, "slug": slug.current }
  }`
)

export const PRODUCT_BY_SLUG_QUERY = defineQuery(
  `*[_type == "product" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    compareAtPrice,
    featured,
    colorVariants[]{
      _key,
      name,
      hex,
      "slug": slug.current,
      images[]{ _type, asset, hotspot, alt },
      sizes[]{ _key, size, stock, sku }
    },
    "category": category->{ _id, name, "slug": slug.current },
    tags,
    seo{ metaTitle, metaDescription, ogImage }
  }`
)

export const ALL_PRODUCT_SLUGS_QUERY = defineQuery(
  `*[_type == "product" && defined(slug.current)]{ "slug": slug.current }`
)

export const CATEGORIES_QUERY = defineQuery(
  `*[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description
  }`
)

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings" && _id == "siteSettings-singleton"][0]{
    _id,
    storeName,
    supportEmail,
    logo,
    socialLinks,
    footerTagline
  }`
)

export const ORDERS_BY_USER_QUERY = defineQuery(
  `*[_type == "order" && clerkUserId == $userId] | order(createdAt desc) {
    _id,
    orderNumber,
    lineItems,
    total,
    status,
    createdAt
  }`
)
