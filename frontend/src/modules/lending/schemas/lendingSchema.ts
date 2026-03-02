import { z } from 'zod';

export const lendingSchema = z
  .object({
    book: z.coerce.number().int().positive('Book is required'),
    customer: z.coerce.number().int().positive('Customer is required'),
    start_date: z.string().trim().min(1, 'Start date is required'),
    end_date: z.string().trim().min(1, 'End date is required'),
    rent_price: z.coerce.number().min(0, 'Rent price cannot be negative'),
    status: z.enum(['returned', 'not_returned']),
    fine_per_day: z.coerce.number().min(0, 'Fine per day cannot be negative'),
    payment_status: z.enum(['paid', 'unpaid']),
    payment_method: z.enum(['cash', 'card', 'transfer', 'online', 'other']),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  });

export type LendingSchema = z.infer<typeof lendingSchema>;

