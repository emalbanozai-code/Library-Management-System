import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import useRecordManagementAccess from '@/modules/auth/hooks/useRecordManagementAccess';
import { useEmployeesList } from '@/modules/employees/queries/useEmployeeQueries';

import ExpenseForm from '../components/ExpenseForm';
import { useCreateExpense, useExpenseDetail, useUpdateExpense } from '../queries/useExpenseQueries';
import { useExpenseDraftStore } from '../stores/useExpenseDraftStore';
import type { ExpenseFormValues } from '../types/expense';

const today = new Date().toISOString().slice(0, 10);

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canManageRecords } = useRecordManagementAccess();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  if (isEditMode && !canManageRecords) {
    return <Navigate to={Number.isFinite(parsedId) ? `/expenses/${parsedId}` : '/expenses'} replace />;
  }

  const { data: employeesData, isLoading: loadingEmployees } = useEmployeesList({ page_size: 200 });
  const { data: expense, isLoading: loadingExpense, isError: expenseError } = useExpenseDetail(parsedId, isEditMode);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense(parsedId);
  const setDraft = useExpenseDraftStore((state) => state.setDraft);
  const resetDraft = useExpenseDraftStore((state) => state.resetDraft);

  const employees = employeesData?.results || [];

  useEffect(() => {
    if (isEditMode && expense) {
      setDraft({
        title: expense.title,
        description: expense.description || '',
        amount: Number(expense.amount),
        payment_date: expense.payment_date,
        paid_by: expense.paid_by,
        category: expense.category,
      });
      return;
    }

    if (!isEditMode) {
      setDraft({
        title: '',
        description: '',
        amount: 0,
        payment_date: today,
        paid_by: 0,
        category: 'other',
      });
    }
  }, [isEditMode, expense, setDraft]);

  useEffect(() => {
    return () => {
      resetDraft();
    };
  }, [resetDraft]);

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (isEditMode) {
      await updateExpense.mutateAsync(values);
      navigate(`/expenses/${parsedId}`);
      return;
    }

    const created = await createExpense.mutateAsync(values);
    navigate(`/expenses/${created.id}`);
  };

  if (loadingEmployees || (isEditMode && loadingExpense)) {
    return (
      <Card>
        <CardContent>Loading expense form...</CardContent>
      </Card>
    );
  }

  if (isEditMode && (expenseError || !expense)) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">Expense not found.</p>
          <Button variant="outline" onClick={() => navigate('/expenses')}>
            Back to Expenses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Expense' : 'Add Expense'}
        subtitle={isEditMode ? 'Update expense details' : 'Create a new expense entry'}
      />

      <ExpenseForm
        employees={employees}
        onSubmit={handleSubmit}
        saving={createExpense.isPending || updateExpense.isPending}
        submitLabel={isEditMode ? 'Update Expense' : 'Create Expense'}
      />
    </div>
  );
}
