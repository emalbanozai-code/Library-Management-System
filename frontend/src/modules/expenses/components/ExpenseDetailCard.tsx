import { Button, Card, CardContent } from '@/components/ui';

import type { Expense } from '../types/expense';
import ExpenseCategoryBadge from './ExpenseCategoryBadge';

interface ExpenseDetailCardProps {
  expense: Expense;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export default function ExpenseDetailCard({
  expense,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: ExpenseDetailCardProps) {
  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <ExpenseCategoryBadge category={expense.category} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Title" value={expense.title} />
          <Field label="Amount" value={Number(expense.amount).toFixed(2)} />
          <Field label="Payment Date" value={expense.payment_date} />
          <Field label="Paid By" value={`${expense.paid_by_name} (${expense.paid_by_username})`} />
          <Field label="Created At" value={new Date(expense.created_at).toLocaleString()} />
          <Field label="Updated At" value={new Date(expense.updated_at).toLocaleString()} />
          <Field label="Description" value={expense.description || '-'} />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="danger" onClick={onDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

