export { default as BookDetailCard } from './components/BookDetailCard';
export { default as BookForm } from './components/BookForm';
export { default as BookTable } from './components/BookTable';
export { default as BookCategoryForm } from './components/BookCategoryForm';
export { default as BookCategoryTable } from './components/BookCategoryTable';

export { useBookFilters } from './hooks/useBookFilters';

export { bookKeys } from './queries/bookKeys';
export {
  useBooksList,
  useBookDetail,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useBookCategoriesList,
  useBookCategoryDetail,
  useCreateBookCategory,
  useUpdateBookCategory,
  useDeleteBookCategory,
} from './queries/useBookQueries';

export { bookFormSchema } from './schemas/bookSchema';
export { bookCategoryFormSchema } from './schemas/bookCategorySchema';

export { useBookUiStore } from './stores/useBookUiStore';

export { default as BookDetailPage } from './pages/BookDetailPage';
export { default as BookFormPage } from './pages/BookFormPage';
export { default as BooksListPage } from './pages/BooksListPage';
export { default as BookCategoriesListPage } from './pages/BookCategoriesListPage';
export { default as BookCategoryFormPage } from './pages/BookCategoryFormPage';

export type {
  Book,
  BookCategory,
  BookListParams,
  BookCategoryListParams,
  BookFormValues,
  BookCategoryFormValues,
  PaginatedBooksResponse,
  PaginatedBookCategoriesResponse,
} from './types/book';
