import { Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';
import { useEmployeesList } from '@/modules/employees/queries/useEmployeeQueries';

import ExpenseTable from '../components/ExpenseTable';
import { useExpenseFilters } from '../hooks/useExpenseFilters';
import { useDeleteExpense, useExpensesList } from '../queries/useExpenseQueries';
import { expenseCategoryOptions, type Expense } from '../types/expense';

export default function ExpensesListPage() {
  const navigate = useNavigate();
  const { filters, params, updateFilter, setPage, clearFilters } = useExpenseFilters();
  const { data, isLoading, isError, refetch } = useExpensesList(params);
  const { data: employeesData } = useEmployeesList({ page_size: 200 });
  const deleteExpense = useDeleteExpense();

  const expenses = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const employees = employeesData?.results || [];

  const handleDelete = async (expense: Expense) => {
    const confirmed = window.confirm(`Delete expense "${expense.title}"?`);
    if (!confirmed) {
      return;
    }
    await deleteExpense.mutateAsync(expense.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense/Payment"
        subtitle="Manage expense and payment records"
        actions={[
          {
            label: 'Add Expense',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/expenses/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Search"
              placeholder="Title, description, paid by"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              label="Paid By"
              value={filters.paidBy}
              options={[
                { value: '', label: 'All Employees' },
                ...employees.map((employee) => ({
                  value: String(employee.id),
                  label: `${employee.first_name} ${employee.last_name}`,
                })),
              ]}
              onChange={(event) => updateFilter('paidBy', event.target.value)}
            />
            <Select
              label="Category"
              value={filters.category}
              options={[
                { value: '', label: 'All Categories' },
                ...expenseCategoryOptions.map((category) => ({
                  value: category.value,
                  label: category.label,
                })),
              ]}
              onChange={(event) => updateFilter('category', event.target.value)}
            />
            <Input
              label="Payment Date From"
              type="date"
              value={filters.paymentDateFrom}
              onChange={(event) => updateFilter('paymentDateFrom', event.target.value)}
            />
            <Input
              label="Payment Date To"
              type="date"
              value={filters.paymentDateTo}
              onChange={(event) => updateFilter('paymentDateTo', event.target.value)}
            />
            <Input
              label="Min Amount"
              type="number"
              min="0"
              step="0.01"
              value={filters.minAmount}
              onChange={(event) => updateFilter('minAmount', event.target.value)}
            />
            <Input
              label="Max Amount"
              type="number"
              min="0"
              step="0.01"
              value={filters.maxAmount}
              onChange={(event) => updateFilter('maxAmount', event.target.value)}
            />
            <Select
              label="Order By"
              value={filters.ordering}
              options={[
                { value: '-payment_date', label: 'Newest Payment' },
                { value: 'payment_date', label: 'Oldest Payment' },
                { value: '-amount', label: 'Highest Amount' },
                { value: 'amount', label: 'Lowest Amount' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
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
            <p className="text-sm text-error">Failed to load expenses.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ExpenseTable
            expenses={expenses}
            loading={isLoading}
            onView={(expense) => navigate(`/expenses/${expense.id}`)}
            onEdit={(expense) => navigate(`/expenses/${expense.id}/edit`)}
            onDelete={handleDelete}
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

