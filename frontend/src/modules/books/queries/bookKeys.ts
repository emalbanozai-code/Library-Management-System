import type { BookCategoryListParams, BookListParams } from '../types/book';

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params?: BookListParams) => [...bookKeys.lists(), params] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookKeys.details(), id] as const,
  categoryAll: ['book-categories'] as const,
  categoryLists: () => [...bookKeys.categoryAll, 'list'] as const,
  categoryList: (params?: BookCategoryListParams) => [...bookKeys.categoryLists(), params] as const,
  categoryDetails: () => [...bookKeys.categoryAll, 'detail'] as const,
  categoryDetail: (id: number) => [...bookKeys.categoryDetails(), id] as const,
};
