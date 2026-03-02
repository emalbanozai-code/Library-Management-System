import { CheckCircle2, Eye, Pencil, Trash2 } from 'lucide-react';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Lending } from '../types/lending';
import { LendingPaymentStatusBadge, LendingStatusBadge } from './LendingStatusBadge';

interface LendingTableProps {
  lendings: Lending[];
  loading?: boolean;
  onView: (lending: Lending) => void;
  onEdit: (lending: Lending) => void;
  onDelete: (lending: Lending) => void;
  onReturn: (lending: Lending) => void;
}

export default function LendingTable({
  lendings,
  loading,
  onView,
  onEdit,
  onDelete,
  onReturn,
}: LendingTableProps) {
  const columns: Column<Lending>[] = [
    {
      key: 'book_title',
      header: 'Book',
      label: 'Book',
      sortable: true,
      render: (lending) => (
        <div>
          <p className="font-medium text-text-primary">{lending.book_title}</p>
          <p className="text-xs text-text-secondary">{lending.book_isbn}</p>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'start_date',
      header: 'Dates',
      label: 'Dates',
      render: (lending) => (
        <div>
          <p className="text-sm text-text-primary">{lending.start_date}</p>
          <p className="text-xs text-text-secondary">To: {lending.end_date}</p>
        </div>
      ),
    },
    {
      key: 'rent_price',
      header: 'Amounts',
      label: 'Amounts',
      render: (lending) => (
        <div>
          <p className="text-sm text-text-primary">Rent: {Number(lending.rent_price).toFixed(2)}</p>
          <p className="text-xs text-text-secondary">
            Fine: {Number(lending.fine_amount).toFixed(2)} ({lending.late_days} days)
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      label: 'Status',
      render: (lending) => (
        <div className="space-y-1">
          <LendingStatusBadge status={lending.status} />
          <div>
            <LendingPaymentStatusBadge status={lending.payment_status} />
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      label: 'Actions',
      render: (lending) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => onView(lending)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(lending)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {lending.status === 'not_returned' ? (
            <Button size="sm" variant="ghost" onClick={() => onReturn(lending)}>
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => onDelete(lending)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card padding="none">
      <DataTable
        columns={columns}
        data={lendings}
        loading={loading}
        pagination={false}
        emptyMessage="No lendings found"
        getRowKey={(lending) => lending.id}
      />
    </Card>
  );
}

