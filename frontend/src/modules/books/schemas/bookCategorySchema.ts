import { z } from 'zod';

export const bookCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100, 'Category name is too long'),
  description: z.string().trim(),
});

export type BookCategoryFormSchema = z.infer<typeof bookCategoryFormSchema>;
