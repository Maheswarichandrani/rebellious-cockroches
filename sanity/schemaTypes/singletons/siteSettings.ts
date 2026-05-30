import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'storeName',
      type: 'string',
      initialValue: 'CJP Brand Store',
    }),
    defineField({
      name: 'supportEmail',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'socialLinks',
      type: 'object',
      fields: [
        defineField({ name: 'instagram', type: 'url' }),
        defineField({ name: 'facebook', type: 'url' }),
        defineField({ name: 'youtube', type: 'url' }),
        defineField({ name: 'twitter', type: 'url' }),
      ],
    }),
    defineField({
      name: 'footerTagline',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'storeName' },
  },
})
