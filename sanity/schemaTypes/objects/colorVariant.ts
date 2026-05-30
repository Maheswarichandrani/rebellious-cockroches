import { defineArrayMember, defineField, defineType } from 'sanity'

export const colorVariantType = defineType({
  name: 'colorVariant',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'hex',
      type: 'string',
      description: 'Hex color code e.g. #1A1A1A — used for swatch display',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
          ],
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'sizes',
      type: 'array',
      of: [defineArrayMember({ type: 'sizeEntry' })],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'name', media: 'images.0' },
  },
})
