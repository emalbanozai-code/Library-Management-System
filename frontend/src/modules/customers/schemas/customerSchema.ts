import { z } from 'zod';

export const customerFormSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(150, 'First name is too long'),
  last_name: z.string().trim().min(1, 'Last name is required').max(150, 'Last name is too long'),
  photo: z.any().optional(),
  phone: z.string().trim().max(32, 'Phone is too long'),
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Invalid email address'),
  address: z.string().trim(),
  gender: z.enum(['male', 'female', 'other']),
  total_purchases: z.coerce.number().min(0, 'Total purchases cannot be negative'),
  discount_percent: z.coerce
    .number()
    .min(0, 'Discount percent cannot be negative')
    .max(100, 'Discount percent cannot be greater than 100'),
  is_active: z.boolean(),
});

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;
