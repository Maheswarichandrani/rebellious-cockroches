import { defineField, defineType } from 'sanity'

export const seoFieldsType = defineType({
  name: 'seoFields',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      type: 'string',
      validation: (r) => r.max(60),
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      rows: 2,
      validation: (r) => r.max(160),
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
