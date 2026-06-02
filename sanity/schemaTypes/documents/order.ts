import { defineArrayMember, defineField, defineType } from 'sanity'
import { ClipboardIcon } from '@sanity/icons'
import { OrderStatusInput } from '../../components/order-status-input'
import { OrderAddressDisplay } from '../../components/order-address-display'
import { OrderLineItemsDisplay } from '../../components/order-lineitems-display'

export const orderType = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  icon: ClipboardIcon,
  fields: [
    // ── Status controls at top ────────────────────────────────────────────────
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending',    value: 'pending'    },
          { title: 'Paid',       value: 'paid'       },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped',    value: 'shipped'    },
          { title: 'Delivered',  value: 'delivered'  },
          { title: 'Cancelled',  value: 'cancelled'  },
          { title: 'Refunded',   value: 'refunded'   },
        ],
      },
      initialValue: 'pending',
      components: { input: OrderStatusInput },
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: 'Pending',  value: 'pending'  },
          { title: 'Paid',     value: 'paid'     },
          { title: 'Failed',   value: 'failed'   },
          { title: 'Refunded', value: 'refunded' },
        ],
      },
      initialValue: 'pending',
    }),

    // ── Order identity ────────────────────────────────────────────────────────
    defineField({ name: 'orderNumber',  type: 'string',   title: 'Order Number', readOnly: true }),
    defineField({ name: 'clerkUserId',  type: 'string',   title: 'Clerk User ID', readOnly: true }),

    // ── Customer info (display-only card) ─────────────────────────────────────
    defineField({
      name: 'customerInfo',
      title: 'Customer Information',
      type: 'object',
      readOnly: true,
      components: { input: OrderAddressDisplay },
      fields: [
        defineField({ name: 'name',  type: 'string', readOnly: true }),
        defineField({ name: 'email', type: 'string', readOnly: true }),
        defineField({ name: 'phone', type: 'string', readOnly: true }),
        defineField({
          name: 'address',
          type: 'object',
          readOnly: true,
          fields: [
            defineField({ name: 'line1',   type: 'string', readOnly: true }),
            defineField({ name: 'line2',   type: 'string', readOnly: true }),
            defineField({ name: 'city',    type: 'string', readOnly: true }),
            defineField({ name: 'state',   type: 'string', readOnly: true }),
            defineField({ name: 'pincode', type: 'string', readOnly: true }),
            defineField({ name: 'country', type: 'string', readOnly: true }),
          ],
        }),
      ],
    }),

    // ── Line items (display-only table) ──────────────────────────────────────
    defineField({
      name: 'lineItems',
      title: 'Items Ordered',
      type: 'array',
      readOnly: true,
      components: { input: OrderLineItemsDisplay },
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'productId',        type: 'string' }),
            defineField({ name: 'productName',      type: 'string' }),
            defineField({ name: 'colorVariant',     type: 'string' }),
            defineField({ name: 'colorVariantSlug', type: 'string' }),
            defineField({ name: 'size',             type: 'string' }),
            defineField({ name: 'qty',              type: 'number' }),
            defineField({ name: 'priceSnapshot',    type: 'number' }),
            defineField({ name: 'sku',              type: 'string' }),
          ],
          preview: {
            select: { title: 'productName', subtitle: 'qty', color: 'colorVariant', size: 'size' },
            prepare({ title, subtitle, color, size }) {
              return { title, subtitle: `${color} / ${size} × ${subtitle}` }
            },
          },
        }),
      ],
    }),

    // ── Financials ────────────────────────────────────────────────────────────
    defineField({ name: 'subtotal',           type: 'number',  title: 'Subtotal',         readOnly: true }),
    defineField({ name: 'shippingCost',       type: 'number',  title: 'Shipping Cost',    readOnly: true }),
    defineField({ name: 'taxAmount',          type: 'number',  title: 'Tax Amount',       readOnly: true, description: 'GST (18%) included in subtotal' }),
    defineField({ name: 'total',              type: 'number',  title: 'Total',            readOnly: true }),
    defineField({ name: 'currency',           type: 'string',  title: 'Currency',         readOnly: true, initialValue: 'INR' }),
    defineField({ name: 'shippingMethodId',   type: 'string',  title: 'Shipping Method ID',   readOnly: true }),
    defineField({ name: 'shippingMethodName', type: 'string',  title: 'Shipping Method',  readOnly: true }),
    defineField({ name: 'newsletterOptIn',    type: 'boolean', title: 'Newsletter Opt-in', readOnly: true }),

    // ── Billing address (display-only card, optional) ─────────────────────────
    defineField({
      name: 'billingAddress',
      title: 'Billing Address',
      type: 'object',
      description: 'Populated only when billing differs from shipping',
      readOnly: true,
      components: { input: OrderAddressDisplay },
      fields: [
        defineField({ name: 'name',    type: 'string', readOnly: true }),
        defineField({ name: 'line1',   type: 'string', readOnly: true }),
        defineField({ name: 'line2',   type: 'string', readOnly: true }),
        defineField({ name: 'city',    type: 'string', readOnly: true }),
        defineField({ name: 'state',   type: 'string', readOnly: true }),
        defineField({ name: 'pincode', type: 'string', readOnly: true }),
        defineField({ name: 'country', type: 'string', readOnly: true }),
      ],
    }),

    // ── Payment / Razorpay ────────────────────────────────────────────────────
    defineField({ name: 'razorpayOrderId',   type: 'string', title: 'Razorpay Order ID',   readOnly: true }),
    defineField({ name: 'paymentId',         type: 'string', title: 'Payment ID',          readOnly: true }),
    defineField({ name: 'razorpaySignature', type: 'string', title: 'Razorpay Signature',  readOnly: true }),

    // ── Timestamps ────────────────────────────────────────────────────────────
    defineField({ name: 'createdAt', type: 'datetime', title: 'Created At', readOnly: true }),
    defineField({ name: 'updatedAt', type: 'datetime', title: 'Updated At', readOnly: true }),
  ],
  orderings: [
    {
      name: 'createdAtDesc',
      title: 'Newest first',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title:   'orderNumber',
      name:    'customerInfo.name',
      status:  'status',
      payment: 'paymentStatus',
      total:   'total',
    },
    prepare({ title, name, status, payment, total }) {
      const icon = payment === 'paid' ? '✓' : payment === 'failed' ? '✗' : '○'
      return {
        title:    `${icon} ${title ?? 'Draft order'}`,
        subtitle: `${name ?? 'Guest'} — ${status ?? 'pending'} — ₹${total?.toLocaleString('en-IN') ?? '0'}`,
      }
    },
  },
})
