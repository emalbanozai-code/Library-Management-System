import { useState } from 'react';

import { Alert, Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui';
import type { Employee } from '@/modules/employees/types/employee';

import { expenseSchema } from '../schemas/expenseSchema';
import { useExpenseDraftStore } from '../stores/useExpenseDraftStore';
import { expenseCategoryOptions, type ExpenseFormValues } from '../types/expense';

interface ExpenseFormProps {
  employees: Employee[];
  onSubmit: (payload: ExpenseFormValues) => Promise<void>;
  saving?: boolean;
  submitLabel?: string;
}

export default function ExpenseForm({
  employees,
  onSubmit,
  saving = false,
  submitLabel = 'Save Expense',
}: ExpenseFormProps) {
  const {
    title,
    description,
    amount,
    paymentDate,
    paidBy,
    category,
    setTitle,
    setDescription,
    setAmount,
    setPaymentDate,
    setPaidBy,
    setCategory,
  } = useExpenseDraftStore();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsed = expenseSchema.safeParse({
      title,
      description,
      amount,
      payment_date: paymentDate,
      paid_by: paidBy,
      category,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Invalid expense data');
      return;
    }

    setFormError(null);
    await onSubmit(parsed.data);
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Select
            label="Paid By"
            options={[
              { value: '', label: 'Select employee' },
              ...employees.map((employee) => ({
                value: String(employee.id),
                label: `${employee.first_name} ${employee.last_name} (${employee.username})`,
              })),
            ]}
            value={paidBy ? String(paidBy) : ''}
            onChange={(event) => setPaidBy(Number(event.target.value || 0))}
          />
          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value || 0))}
          />
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
          />
          <Select
            label="Category"
            options={expenseCategoryOptions.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as
                  | 'salary'
                  | 'electricity'
                  | 'rent'
                  | 'water'
                  | 'internet'
                  | 'maintenance'
                  | 'supplies'
                  | 'other'
              )
            }
          />
        </div>

        <Textarea
          label="Description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional description"
        />

        <div className="flex justify-end">
          <Button onClick={handleSubmit} loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

