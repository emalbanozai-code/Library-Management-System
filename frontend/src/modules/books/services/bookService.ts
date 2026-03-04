import apiClient from '@/lib/api';

import type {
  Book,
  BookCategory,
  BookCategoryFormValues,
  BookCategoryListParams,
  BookFormValues,
  BookListParams,
  PaginatedBookCategoriesResponse,
  PaginatedBooksResponse,
} from '../types/book';

const BOOKS_ENDPOINT = '/books/';
const BOOK_CATEGORIES_ENDPOINT = '/books/categories/';

export const bookService = {
  getBooks: (params?: BookListParams) =>
    apiClient.get<PaginatedBooksResponse>(BOOKS_ENDPOINT, { params }),

  getBook: (id: number) => apiClient.get<Book>(`${BOOKS_ENDPOINT}${id}/`),

  createBook: (data: BookFormValues) =>
    apiClient.post<Book>(BOOKS_ENDPOINT, {
      ...data,
      publish_date: data.publish_date || null,
    }),

  updateBook: (id: number, data: BookFormValues) =>
    apiClient.put<Book>(`${BOOKS_ENDPOINT}${id}/`, {
      ...data,
      publish_date: data.publish_date || null,
    }),

  deleteBook: (id: number) => apiClient.delete(`${BOOKS_ENDPOINT}${id}/`),

  getBookCategories: (params?: BookCategoryListParams) =>
    apiClient.get<PaginatedBookCategoriesResponse>(BOOK_CATEGORIES_ENDPOINT, { params }),

  getBookCategory: (id: number) => apiClient.get<BookCategory>(`${BOOK_CATEGORIES_ENDPOINT}${id}/`),

  createBookCategory: (data: BookCategoryFormValues) =>
    apiClient.post<BookCategory>(BOOK_CATEGORIES_ENDPOINT, data),

  updateBookCategory: (id: number, data: BookCategoryFormValues) =>
    apiClient.put<BookCategory>(`${BOOK_CATEGORIES_ENDPOINT}${id}/`, data),

  deleteBookCategory: (id: number) => apiClient.delete(`${BOOK_CATEGORIES_ENDPOINT}${id}/`),
};

export default bookService;
