import { defineArrayMember, defineField, defineType } from 'sanity'
import { ClipboardIcon } from '@sanity/icons'

export const orderType = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  icon: ClipboardIcon,
  fields: [
    defineField({
      name: 'orderNumber',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'customerInfo',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string' }),
        defineField({ name: 'email', type: 'string' }),
        defineField({ name: 'phone', type: 'string' }),
        defineField({
          name: 'address',
          type: 'object',
          fields: [
            defineField({ name: 'line1', type: 'string' }),
            defineField({ name: 'line2', type: 'string' }),
            defineField({ name: 'city', type: 'string' }),
            defineField({ name: 'state', type: 'string' }),
            defineField({ name: 'pincode', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'lineItems',
      type: 'array',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'productId', type: 'string' }),
            defineField({ name: 'productName', type: 'string' }),
            defineField({ name: 'colorVariant', type: 'string' }),
            defineField({ name: 'size', type: 'string' }),
            defineField({ name: 'qty', type: 'number' }),
            defineField({ name: 'priceSnapshot', type: 'number' }),
          ],
          preview: {
            select: {
              title: 'productName',
              subtitle: 'qty',
              color: 'colorVariant',
              size: 'size',
            },
            prepare({ title, subtitle, color, size }) {
              return {
                title: `${title}`,
                subtitle: `${color} / ${size} × ${subtitle}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({ name: 'subtotal', type: 'number', readOnly: true }),
    defineField({ name: 'total', type: 'number', readOnly: true }),
    defineField({ name: 'paymentId', type: 'string', readOnly: true }),
    defineField({ name: 'razorpayOrderId', type: 'string', readOnly: true }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Paid', value: 'paid' },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Refunded', value: 'refunded' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({ name: 'clerkUserId', type: 'string', readOnly: true }),
    defineField({ name: 'createdAt', type: 'datetime', readOnly: true }),
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
      title: 'orderNumber',
      name: 'customerInfo.name',
      status: 'status',
    },
    prepare({ title, name, status }) {
      return {
        title: title ?? 'Draft order',
        subtitle: `${name ?? 'Guest'} — ${status ?? 'pending'}`,
      }
    },
  },
})
