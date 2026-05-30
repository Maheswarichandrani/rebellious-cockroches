import { defineArrayMember, defineField, defineType } from 'sanity'

export const sizeEntryType = defineType({
  name: 'sizeEntry',
  type: 'object',
  fields: [
    defineField({
      name: 'size',
      type: 'string',
      options: {
        list: [
          { title: 'XS', value: 'XS' },
          { title: 'S', value: 'S' },
          { title: 'M', value: 'M' },
          { title: 'L', value: 'L' },
          { title: 'XL', value: 'XL' },
          { title: 'XXL', value: 'XXL' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'stock',
      type: 'number',
      initialValue: 0,
      validation: (r) => r.required().min(0).integer(),
    }),
    defineField({
      name: 'sku',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'size', subtitle: 'stock' },
    prepare({ title, subtitle }) {
      return { title, subtitle: `Stock: ${subtitle ?? 0}` }
    },
  },
})
