import type { StructureResolver } from 'sanity/structure'
import {
  BasketIcon,
  ClipboardIcon,
  CogIcon,
  ImagesIcon,
  TagIcon,
} from '@sanity/icons'


export const structure: StructureResolver = (S) =>
  S.list()
    .title('CJP Store')
    .items([
      // Singletons pinned at top
      S.listItem()
        .title('Hero Content')
        .icon(ImagesIcon)
        .id('heroContent')
        .child(
          S.document()
            .schemaType('heroContent')
            .documentId('heroContent')
        ),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.divider(),
      S.documentTypeListItem('product').title('Products').icon(BasketIcon),
      S.documentTypeListItem('category').title('Categories').icon(TagIcon),
      S.divider(),
      S.documentTypeListItem('order').title('Orders').icon(ClipboardIcon),
      // No generic documentTypeListItems() — all types explicitly listed above
      // so singletons never appear duplicated
    ])
