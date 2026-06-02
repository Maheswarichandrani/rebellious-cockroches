import { z } from 'zod'

export const checkoutSchema = z.object({
  firstName:    z.string().min(1, 'First name is required').max(50).trim(),
  lastName:     z.string().min(1, 'Last name is required').max(50).trim(),
  email:        z.string().email('Enter a valid email address').max(200).trim(),
  phone:        z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number').trim(),
  addressLine1: z.string().min(3, 'Address is required').max(200).trim(),
  addressLine2: z.string().max(200).trim().optional().or(z.literal('')),
  city:         z.string().min(2, 'City is required').max(100).trim(),
  state:        z.string().min(2, 'State is required').max(100).trim(),
  pincode:      z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').trim(),
  country:      z.string().min(2, 'Country is required').max(100).trim(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

export const cartItemInputSchema = z.object({
  productId:        z.string().min(1),
  colorVariantSlug: z.string().min(1),
  size:             z.string().min(1),
  qty:              z.number().int().positive().max(20),
})

export type CartItemInput = z.infer<typeof cartItemInputSchema>
