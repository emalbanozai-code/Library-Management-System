import { Button, Card, CardContent } from '@/components/ui';

import type { Lending } from '../types/lending';
import { LendingPaymentStatusBadge, LendingStatusBadge } from './LendingStatusBadge';

interface LendingDetailCardProps {
  lending: Lending;
  onEdit: () => void;
  onDelete: () => void;
  onReturn: () => void;
  onBack: () => void;
  deleting?: boolean;
  returning?: boolean;
}

export default function LendingDetailCard({
  lending,
  onEdit,
  onDelete,
  onReturn,
  onBack,
  deleting = false,
  returning = false,
}: LendingDetailCardProps) {
  const rows = [
    ['Book', lending.book_title],
    ['ISBN', lending.book_isbn],
    ['Customer', lending.customer_name],
    ['Start Date', lending.start_date],
    ['End Date', lending.end_date],
    ['Rent Price', Number(lending.rent_price).toFixed(2)],
    ['Fine Per Day', Number(lending.fine_per_day).toFixed(2)],
    ['Late Days', String(lending.late_days)],
    ['Fine Amount', Number(lending.fine_amount).toFixed(2)],
    ['Payment Method', lending.payment_method],
    ['Created At', new Date(lending.created_at).toLocaleString()],
  ];

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <LendingStatusBadge status={lending.status} />
          <LendingPaymentStatusBadge status={lending.payment_status} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
              <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          {lending.status === 'not_returned' ? (
            <Button variant="outline" onClick={onReturn} loading={returning}>
              Mark Returned
            </Button>
          ) : null}
          <Button variant="danger" onClick={onDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

