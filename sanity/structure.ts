import type { StructureResolver } from 'sanity/structure'
import {
  BasketIcon,
  ClipboardIcon,
  CogIcon,
  ImagesIcon,
  TagIcon,
} from '@sanity/icons'

const ORDER_VIEWS = [
  { title: 'All Orders',  status: null        },
  { title: 'Pending',     status: 'pending'    },
  { title: 'Paid',        status: 'paid'       },
  { title: 'Processing',  status: 'processing' },
  { title: 'Shipped',     status: 'shipped'    },
  { title: 'Delivered',   status: 'delivered'  },
  { title: 'Cancelled',   status: 'cancelled'  },
  { title: 'Refunded',    status: 'refunded'   },
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('CJP Store')
    .items([
      S.listItem()
        .title('Hero Content')
        .icon(ImagesIcon)
        .id('heroContent')
        .child(S.document().schemaType('heroContent').documentId('heroContent')),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('product').title('Products').icon(BasketIcon),
      S.documentTypeListItem('category').title('Categories').icon(TagIcon),
      S.divider(),
      S.listItem()
        .title('Orders')
        .icon(ClipboardIcon)
        .child(
          S.list()
            .title('Orders')
            .items(
              ORDER_VIEWS.map(({ title, status }) =>
                S.listItem()
                  .title(title)
                  .id(status ?? 'all-orders')
                  .child(
                    S.documentList()
                      .title(title)
                      .schemaType('order')
                      .filter(status ? '_type == "order" && status == $status' : '_type == "order"')
                      .params(status ? { status } : {})
                      .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                  )
              )
            )
        ),
    ])
