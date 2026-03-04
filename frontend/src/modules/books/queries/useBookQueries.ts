import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import { bookKeys } from './bookKeys';
import { bookService } from '../services/bookService';
import type {
  BookCategoryFormValues,
  BookCategoryListParams,
  BookFormValues,
  BookListParams,
} from '../types/book';

export const useBooksList = (params?: BookListParams) => {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => bookService.getBooks(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useBookDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => bookService.getBook(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookFormValues) => bookService.createBook(data).then((res) => res.data),
    onSuccess: () => {
      toast.success('Book created successfully');
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create book'));
    },
  });
};

export const useUpdateBook = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookFormValues) => bookService.updateBook(id, data).then((res) => res.data),
    onSuccess: () => {
      toast.success('Book updated successfully');
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update book'));
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookService.deleteBook(id),
    onSuccess: () => {
      toast.success('Book deleted successfully');
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete book'));
    },
  });
};

export const useBookCategoriesList = (params?: BookCategoryListParams) => {
  return useQuery({
    queryKey: bookKeys.categoryList(params),
    queryFn: () => bookService.getBookCategories(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useBookCategoryDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: bookKeys.categoryDetail(id),
    queryFn: () => bookService.getBookCategory(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateBookCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookCategoryFormValues) =>
      bookService.createBookCategory(data).then((res) => res.data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: bookKeys.categoryLists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create category'));
    },
  });
};

export const useUpdateBookCategory = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookCategoryFormValues) =>
      bookService.updateBookCategory(id, data).then((res) => res.data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: bookKeys.categoryDetail(id) });
      queryClient.invalidateQueries({ queryKey: bookKeys.categoryLists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update category'));
    },
  });
};

export const useDeleteBookCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookService.deleteBookCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: bookKeys.categoryLists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete category'));
    },
  });
};
