import { defineField, defineType } from 'sanity'
import { PackageIcon } from '@sanity/icons'

export const shippingMethodType = defineType({
  name:  'shippingMethod',
  title: 'Shipping Method',
  type:  'document',
  icon:  PackageIcon,

  fields: [
    defineField({
      name:       'name',
      title:      'Name',
      type:       'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name:       'description',
      title:      'Description',
      type:       'string',
      description: 'Shown to customer at checkout, e.g. "5 to 8 business days"',
      validation:  (r) => r.required(),
    }),
    defineField({
      name:       'price',
      title:      'Price (₹)',
      type:       'number',
      description: 'Flat shipping cost in INR',
      validation:  (r) => r.required().min(0),
    }),
    defineField({
      name:         'isEnabled',
      title:        'Active',
      type:         'boolean',
      description:  'Uncheck to hide this method from checkout without deleting it',
      initialValue: true,
    }),
    defineField({
      name:        'freeAboveOrderTotal',
      title:       'Free if order subtotal exceeds (₹)',
      type:        'number',
      description: 'e.g. 999 → free shipping when cart is ≥ ₹999. Leave empty to never auto-apply free shipping.',
      validation:  (r) => r.min(0),
    }),
    defineField({
      name:       'estimatedMinDays',
      title:      'Estimated min delivery days',
      type:       'number',
      validation: (r) => r.min(0),
    }),
    defineField({
      name:       'estimatedMaxDays',
      title:      'Estimated max delivery days',
      type:       'number',
      validation: (r) => r.min(0),
    }),
    defineField({
      name:        'deliveryZones',
      title:       'Delivery Zones (Pincode Prefixes)',
      type:        'array',
      of:          [{ type: 'string' }],
      description: 'Pincode prefixes this method serves (e.g. "400" = Mumbai, "560" = Bangalore). Leave EMPTY to serve ALL pincodes.',
    }),
    defineField({
      name:         'sortOrder',
      title:        'Sort order',
      type:         'number',
      description:  'Lower numbers appear first in checkout',
      initialValue: 0,
    }),
  ],

  orderings: [
    { title: 'Sort order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
  ],

  preview: {
    select: {
      title:    'name',
      price:    'price',
      enabled:  'isEnabled',
    },
    prepare({ title, price, enabled }) {
      return {
        title,
        subtitle: `₹${price ?? '—'}${enabled === false ? '  [DISABLED]' : ''}`,
      }
    },
  },
})
