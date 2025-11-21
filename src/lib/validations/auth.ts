import { z } from 'zod'

export const buyerRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'Must be valid Egyptian phone (01XXXXXXXXX)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  budget: z.number().positive('Budget must be greater than 0'),
  buyingIntent: z.enum(['Cash', 'Installment', 'Mortgage']).optional()
})

export const marketerRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'Must be valid Egyptian phone'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().optional(),
  role: z.enum(['Marketer', 'Developer']),
  officeLocation: z.string().min(1, 'Office location is required')
})

export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required')
})

export type BuyerRegistrationInput = z.infer<typeof buyerRegistrationSchema>
export type MarketerRegistrationInput = z.infer<typeof marketerRegistrationSchema>
export type LoginInput = z.infer<typeof loginSchema>
