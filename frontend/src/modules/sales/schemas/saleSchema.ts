import { z } from 'zod';

export const saleItemSchema = z.object({
  book: z.coerce.number().int().positive('Book is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  unit_price: z.coerce.number().min(0, 'Unit price cannot be negative').optional(),
});

export const saleSchema = z
  .object({
    sale_date: z.string().trim().optional().default(''),
    customer: z.coerce.number().int().positive().nullable().optional(),
    discount_percent: z.coerce.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%').optional(),
    notes: z.string().trim().optional().default(''),
    items: z.array(saleItemSchema).min(1, 'At least one sale item is required'),
  })
  .refine(
    (data) => {
      const books = data.items.map((item) => item.book);
      return new Set(books).size === books.length;
    },
    {
      message: 'Duplicate books are not allowed in sale items',
      path: ['items'],
    }
  );

export type SaleSchema = z.infer<typeof saleSchema>;
