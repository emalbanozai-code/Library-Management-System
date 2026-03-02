import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().trim().optional().default(''),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  payment_date: z.string().trim().min(1, 'Payment date is required'),
  paid_by: z.coerce.number().int().positive('Paid by is required'),
  category: z.enum([
    'salary',
    'electricity',
    'rent',
    'water',
    'internet',
    'maintenance',
    'supplies',
    'other',
  ]),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;

