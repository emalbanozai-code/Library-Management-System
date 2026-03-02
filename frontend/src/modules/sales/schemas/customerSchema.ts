import { z } from 'zod';

export const customerSchema = z.object({
  full_name: z.string().trim().min(1, 'Customer name is required'),
  phone: z.string().trim().max(32, 'Phone is too long').optional().default(''),
  email: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Invalid email address'),
  notes: z.string().trim().optional().default(''),
});

export type CustomerSchema = z.infer<typeof customerSchema>;
