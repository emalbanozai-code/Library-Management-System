import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import useRecordManagementAccess from '@/modules/auth/hooks/useRecordManagementAccess';

import ExpenseDetailCard from '../components/ExpenseDetailCard';
import { useDeleteExpense, useExpenseDetail } from '../queries/useExpenseQueries';

export default function ExpenseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canManageRecords } = useRecordManagementAccess();

  const expenseId = Number(id);
  const isValidId = Number.isFinite(expenseId);

  const { data: expense, isLoading, isError } = useExpenseDetail(expenseId, isValidId);
  const deleteExpense = useDeleteExpense();

  const handleDelete = async () => {
    if (!expense) {
      return;
    }

    const confirmed = window.confirm(`Delete expense "${expense.title}"?`);
    if (!confirmed) {
      return;
    }
    await deleteExpense.mutateAsync(expense.id);
    navigate('/expenses');
  };

  if (!isValidId) {
    return (
      <Card>
        <CardContent>Invalid expense ID.</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading expense details...</CardContent>
      </Card>
    );
  }

  if (isError || !expense) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">Unable to load expense details.</p>
          <Button variant="outline" onClick={() => navigate('/expenses')}>
            Back to Expenses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Expense Details" subtitle="View and manage a single expense record" />
      <ExpenseDetailCard
        expense={expense}
        onBack={() => navigate('/expenses')}
        onEdit={canManageRecords ? () => navigate(`/expenses/${expense.id}/edit`) : undefined}
        onDelete={canManageRecords ? handleDelete : undefined}
        deleting={deleteExpense.isPending}
        canManage={canManageRecords}
      />
    </div>
  );
}
