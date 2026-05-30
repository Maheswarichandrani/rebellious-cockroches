import { type SchemaTypeDefinition } from 'sanity'

import { sizeEntryType } from './objects/sizeEntry'
import { colorVariantType } from './objects/colorVariant'
import { seoFieldsType } from './objects/seoFields'
import { categoryType } from './documents/category'
import { productType } from './documents/product'
import { orderType } from './documents/order'
import { heroContentType } from './singletons/heroContent'
import { siteSettingsType } from './singletons/siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objects (embedded inside documents)
    sizeEntryType,
    colorVariantType,
    seoFieldsType,
    // Documents
    categoryType,
    productType,
    orderType,
    // Singletons
    heroContentType,
    siteSettingsType,
  ],
}
