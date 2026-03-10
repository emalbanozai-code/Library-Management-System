import { Plus, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';
import useRecordManagementAccess from '@/modules/auth/hooks/useRecordManagementAccess';

import BookCategoryTable from '../components/BookCategoryTable';
import { useBookCategoriesList, useDeleteBookCategory } from '../queries/useBookQueries';
import type { BookCategory } from '../types/book';

export default function BookCategoriesListPage() {
  const navigate = useNavigate();
  const { canManageRecords } = useRecordManagementAccess();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('name');

  const { data, isLoading, isError, refetch } = useBookCategoriesList({
    page,
    page_size: pageSize,
    search: search || undefined,
    ordering,
  });
  const deleteCategoryMutation = useDeleteBookCategory();

  const categories = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDelete = async (category: BookCategory) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) {
      return;
    }

    await deleteCategoryMutation.mutateAsync(category.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Categories"
        subtitle="Create and manage categories used by books"
        actions={[
          {
            label: 'Add Category',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/books/categories/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search categories"
              value={search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select
              value={String(pageSize)}
              options={[
                { label: '10 / page', value: '10' },
                { label: '25 / page', value: '25' },
                { label: '50 / page', value: '50' },
              ]}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            />
            <Select
              value={ordering}
              options={[
                { label: 'Name A-Z', value: 'name' },
                { label: 'Name Z-A', value: '-name' },
                { label: 'Newest', value: '-created_at' },
                { label: 'Oldest', value: 'created_at' },
              ]}
              onChange={(event) => {
                setOrdering(event.target.value);
                setPage(1);
              }}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Refresh
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                  setPageSize(10);
                  setOrdering('name');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">Failed to load categories.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <BookCategoryTable
            categories={categories}
            loading={isLoading}
            onEdit={canManageRecords ? (category) => navigate(`/books/categories/${category.id}/edit`) : undefined}
            onDelete={canManageRecords ? handleDelete : undefined}
            canManage={canManageRecords}
          />

          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={page} pageSize={pageSize} totalItems={totalCount} />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
