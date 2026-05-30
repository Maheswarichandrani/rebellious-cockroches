import { defineField, defineType } from 'sanity'
import { ImagesIcon } from '@sanity/icons'

export const heroContentType = defineType({
  name: 'heroContent',
  title: 'Hero Content',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      description: 'Small label above heading e.g. "SS25 Collection"',
    }),
    defineField({
      name: 'heading',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'subtext',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'backgroundImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      initialValue: 'Shop Now',
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      initialValue: '/shop',
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'backgroundImage' },
  },
})
