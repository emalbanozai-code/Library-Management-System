import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Expense } from '../types/expense';
import ExpenseCategoryBadge from './ExpenseCategoryBadge';

interface ExpenseTableProps {
  expenses: Expense[];
  loading?: boolean;
  onView: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  canManage?: boolean;
}

export default function ExpenseTable({
  expenses,
  loading,
  onView,
  onEdit,
  onDelete,
  canManage = false,
}: ExpenseTableProps) {
  const columns: Column<Expense>[] = [
    {
      key: 'title',
      header: 'Title',
      label: 'Title',
      sortable: true,
      render: (expense) => (
        <div>
          <p className="font-medium text-text-primary">{expense.title}</p>
          <p className="text-xs text-text-secondary">{expense.description || '-'}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      label: 'Category',
      sortable: true,
      render: (expense) => <ExpenseCategoryBadge category={expense.category} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      label: 'Amount',
      sortable: true,
      render: (expense) => Number(expense.amount).toFixed(2),
    },
    {
      key: 'payment_date',
      header: 'Payment Date',
      label: 'Payment Date',
      sortable: true,
    },
    {
      key: 'paid_by_name',
      header: 'Paid By',
      label: 'Paid By',
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      label: 'Actions',
      render: (expense) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => onView(expense)}>
            <Eye className="h-4 w-4" />
          </Button>
          {canManage && onEdit ? (
            <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {canManage && onDelete ? (
            <Button size="sm" variant="ghost" onClick={() => onDelete(expense)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <Card padding="none">
      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        pagination={false}
        emptyMessage="No expenses found"
        getRowKey={(expense) => expense.id}
      />
    </Card>
  );
}
