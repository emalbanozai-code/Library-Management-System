import { Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';
import { useBooksList } from '@/modules/books/queries/useBookQueries';
import { useCustomersList } from '@/modules/customers/queries/useCustomerQueries';

import LendingTable from '../components/LendingTable';
import { useLendingFilters } from '../hooks/useLendingFilters';
import { useDeleteLending, useLendingsList, useReturnLending } from '../queries/useLendingQueries';
import type { Lending } from '../types/lending';

export default function LendingsListPage() {
  const navigate = useNavigate();
  const { filters, params, updateFilter, setPage, clearFilters } = useLendingFilters();
  const { data, isLoading, isError, refetch } = useLendingsList(params);
  const { data: booksData } = useBooksList({ page_size: 200 });
  const { data: customersData } = useCustomersList({ page_size: 200 });
  const deleteLending = useDeleteLending();
  const returnLending = useReturnLending();

  const lendings = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const books = booksData?.results ?? [];
  const customers = customersData?.results ?? [];

  const handleDelete = async (lending: Lending) => {
    const confirmed = window.confirm(`Delete lending #${lending.id}?`);
    if (!confirmed) {
      return;
    }
    await deleteLending.mutateAsync(lending.id);
  };

  const handleReturn = async (lending: Lending) => {
    const confirmed = window.confirm(`Mark lending #${lending.id} as returned?`);
    if (!confirmed) {
      return;
    }
    await returnLending.mutateAsync({ id: lending.id });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lending"
        subtitle="Manage all lending transactions"
        actions={[
          {
            label: 'Add Lending',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/lending/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Search"
              placeholder="Book title, ISBN, customer"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              label="Book"
              value={filters.book}
              options={[
                { value: '', label: 'All Books' },
                ...books.map((book) => ({ value: String(book.id), label: book.title })),
              ]}
              onChange={(event) => updateFilter('book', event.target.value)}
            />
            <Select
              label="Customer"
              value={filters.customer}
              options={[
                { value: '', label: 'All Customers' },
                ...customers.map((customer) => ({ value: String(customer.id), label: customer.full_name })),
              ]}
              onChange={(event) => updateFilter('customer', event.target.value)}
            />
            <Select
              label="Status"
              value={filters.status}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'not_returned', label: 'Not Returned' },
                { value: 'returned', label: 'Returned' },
              ]}
              onChange={(event) => updateFilter('status', event.target.value)}
            />
            <Select
              label="Payment Status"
              value={filters.paymentStatus}
              options={[
                { value: '', label: 'All Payment Statuses' },
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'paid', label: 'Paid' },
              ]}
              onChange={(event) => updateFilter('paymentStatus', event.target.value)}
            />
            <Select
              label="Payment Method"
              value={filters.paymentMethod}
              options={[
                { value: '', label: 'All Methods' },
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'transfer', label: 'Bank Transfer' },
                { value: 'online', label: 'Online' },
                { value: 'other', label: 'Other' },
              ]}
              onChange={(event) => updateFilter('paymentMethod', event.target.value)}
            />
            <Select
              label="Late Records"
              value={filters.lateOnly ? 'true' : ''}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Late Only' },
              ]}
              onChange={(event) => updateFilter('lateOnly', event.target.value === 'true')}
            />
            <Select
              label="Overdue Records"
              value={filters.overdueOnly ? 'true' : ''}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Overdue Only' },
              ]}
              onChange={(event) => updateFilter('overdueOnly', event.target.value === 'true')}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
              Refresh
            </Button>
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">Failed to load lendings.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <LendingTable
            lendings={lendings}
            loading={isLoading}
            onView={(lending) => navigate(`/lending/${lending.id}`)}
            onEdit={(lending) => navigate(`/lending/${lending.id}/edit`)}
            onDelete={handleDelete}
            onReturn={handleReturn}
          />

          {!isLoading && totalCount > 0 ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={filters.page} pageSize={filters.pageSize} totalItems={totalCount} />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

