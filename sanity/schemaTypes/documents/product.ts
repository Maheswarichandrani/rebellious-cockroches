import { defineArrayMember, defineField, defineType } from 'sanity'
import { BasketIcon } from '@sanity/icons'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'price',
      type: 'number',
      description: 'Price in INR (₹)',
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'compareAtPrice',
      type: 'number',
      description: 'Original price shown as strikethrough',
    }),
    defineField({
      name: 'colorVariants',
      type: 'array',
      of: [defineArrayMember({ type: 'colorVariant', options: { modal: { type: 'popover' } } })],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      type: 'seoFields',
      title: 'SEO',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      price: 'price',
      media: 'colorVariants.0.images.0',
    },
    prepare({ title, price, media }) {
      return {
        title,
        subtitle: price ? `₹${Number(price).toLocaleString('en-IN')}` : 'No price set',
        media,
      }
    },
  },
})
