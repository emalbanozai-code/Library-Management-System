import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import CustomerTable from '../components/CustomerTable';
import { useCustomerFilters } from '../hooks/useCustomerFilters';
import { useCustomersList, useDeleteCustomer } from '../queries/useCustomerQueries';
import type { Customer } from '../types/customer';

export default function CustomersListPage() {
  const navigate = useNavigate();
  const { filters, params, updateFilter, setPage, clearFilters } = useCustomerFilters();
  const { data, isLoading, isError, refetch } = useCustomersList(params);
  const deleteCustomerMutation = useDeleteCustomer();

  const customers = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(`Delete "${customer.full_name}"?`);
    if (!confirmed) {
      return;
    }

    await deleteCustomerMutation.mutateAsync(customer.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage customer profiles"
        actions={[
          {
            label: 'Add Customer',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/customers/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search by name, phone, email"
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.gender}
              options={[
                { label: 'All Genders', value: '' },
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
              onChange={(event) => updateFilter('gender', event.target.value)}
            />
            <Select
              value={filters.isActive}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
              onChange={(event) => updateFilter('isActive', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: '10 / page', value: '10' },
                { label: '25 / page', value: '25' },
                { label: '50 / page', value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: 'Newest', value: '-created_at' },
                { label: 'Oldest', value: 'created_at' },
                { label: 'Name A-Z', value: 'first_name' },
                { label: 'Name Z-A', value: '-first_name' },
                { label: 'Highest Purchases', value: '-total_purchases' },
                { label: 'Lowest Purchases', value: 'total_purchases' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Refresh
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">Failed to load customers.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CustomerTable
            customers={customers}
            loading={isLoading}
            onView={(customer) => navigate(`/customers/${customer.id}`)}
            onEdit={(customer) => navigate(`/customers/${customer.id}/edit`)}
            onDelete={handleDelete}
          />

          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={filters.page} pageSize={filters.pageSize} totalItems={totalCount} />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

