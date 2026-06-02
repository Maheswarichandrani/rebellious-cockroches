import { defineQuery } from 'next-sanity'

export const ORDER_BY_PAYMENT_ID_QUERY = defineQuery(
  `*[_type == "order" && paymentId == $paymentId][0]{
    _id,
    orderNumber,
    paymentStatus,
    status,
    total,
    subtotal,
    shippingCost,
    customerInfo{
      name, email, phone,
      address{ line1, line2, city, state, pincode, country }
    }
  }`
)

export const PRODUCT_SEARCH_QUERY = defineQuery(
  `*[_type == "product" && name match $q] | order(_createdAt desc) [0...6] {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    "image": colorVariants[0].images[0]
  }`
)

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

// ── Shipping methods ──────────────────────────────────────────────────────────

export const SHIPPING_METHODS_QUERY = defineQuery(
  `*[_type == "shippingMethod" && isEnabled == true] | order(sortOrder asc) {
    _id,
    name,
    description,
    price,
    freeAboveOrderTotal,
    estimatedMinDays,
    estimatedMaxDays,
    deliveryZones
  }`
)

// ── Checkout queries ──────────────────────────────────────────────────────────

export const PRODUCTS_BY_IDS_QUERY = defineQuery(
  `*[_type == "product" && _id in $ids]{
    _id,
    name,
    price,
    compareAtPrice,
    "colorVariants": colorVariants[]{
      _key,
      name,
      "slug": slug.current,
      sizes[]{ size, stock, sku }
    }
  }`
)

export const ORDER_BY_NUMBER_QUERY = defineQuery(
  `*[_type == "order" && orderNumber == $orderNumber][0]{
    _id,
    orderNumber,
    clerkUserId,
    customerInfo{
      name, email, phone,
      address{ line1, line2, city, state, pincode, country }
    },
    lineItems[]{
      _key,
      productId,
      productName,
      colorVariant,
      colorVariantSlug,
      size,
      qty,
      priceSnapshot,
      sku
    },
    subtotal,
    shippingCost,
    taxAmount,
    total,
    currency,
    shippingMethodId,
    shippingMethodName,
    newsletterOptIn,
    billingAddress{ name, line1, line2, city, state, pincode, country },
    paymentStatus,
    status,
    paymentId,
    razorpayOrderId,
    createdAt,
    updatedAt
  }`
)

export const ORDER_BY_RAZORPAY_ORDER_ID_QUERY = defineQuery(
  `*[_type == "order" && razorpayOrderId == $razorpayOrderId][0]{
    _id,
    orderNumber,
    clerkUserId,
    paymentStatus,
    status,
    newsletterOptIn,
    lineItems[]{
      _key,
      productId,
      productName,
      colorVariant,
      colorVariantSlug,
      size,
      qty,
      priceSnapshot
    },
    subtotal,
    shippingCost,
    taxAmount,
    total,
    currency,
    shippingMethodId,
    shippingMethodName,
    customerInfo{
      name, email, phone,
      address{ line1, line2, city, state, pincode, country }
    }
  }`
)

// ── Account / orders ──────────────────────────────────────────────────────────

export const ORDERS_BY_USER_QUERY = defineQuery(
  `*[_type == "order" && (clerkUserId == $userId || customerInfo.email == $email)] | order(createdAt desc) {
    _id,
    orderNumber,
    lineItems[]{
      _key,
      productName,
      colorVariant,
      size,
      qty,
      priceSnapshot
    },
    subtotal,
    shippingCost,
    taxAmount,
    total,
    paymentStatus,
    status,
    createdAt
  }`
)
