import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import useRecordManagementAccess from '@/modules/auth/hooks/useRecordManagementAccess';

import BookCategoryForm from '../components/BookCategoryForm';
import {
  useBookCategoryDetail,
  useCreateBookCategory,
  useUpdateBookCategory,
} from '../queries/useBookQueries';
import type { BookCategoryFormValues } from '../types/book';

export default function BookCategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canManageRecords } = useRecordManagementAccess();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  if (isEditMode && !canManageRecords) {
    return <Navigate to="/books/categories" replace />;
  }

  const {
    data: category,
    isLoading: isLoadingCategory,
    isError,
  } = useBookCategoryDetail(parsedId, isEditMode);
  const createCategoryMutation = useCreateBookCategory();
  const updateCategoryMutation = useUpdateBookCategory(parsedId);

  const initialValues: Partial<BookCategoryFormValues> | undefined = category
    ? {
        name: category.name,
        description: category.description || '',
      }
    : undefined;

  const handleSubmit = async (values: BookCategoryFormValues) => {
    if (isEditMode) {
      await updateCategoryMutation.mutateAsync(values);
      navigate('/books/categories');
      return;
    }

    await createCategoryMutation.mutateAsync(values);
    navigate('/books/categories');
  };

  if (isEditMode && isLoadingCategory) {
    return (
      <Card>
        <CardContent>Loading category...</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !category)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Category not found.</p>
          <Button variant="outline" onClick={() => navigate('/books/categories')}>
            Back to Categories
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Category' : 'Add Category'}
        subtitle={isEditMode ? 'Update category details' : 'Create a new book category'}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/books/categories'),
          },
        ]}
      />

      <BookCategoryForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/books/categories')}
        isSubmitting={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        submitLabel={isEditMode ? 'Update Category' : 'Create Category'}
      />
    </div>
  );
}
