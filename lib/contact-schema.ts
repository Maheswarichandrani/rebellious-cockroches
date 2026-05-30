import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim(),
  email: z
    .string()
    .email('Enter a valid email address')
    .max(200)
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^[+\d\s\-()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
})

export type ContactFormData = z.infer<typeof contactSchema>
