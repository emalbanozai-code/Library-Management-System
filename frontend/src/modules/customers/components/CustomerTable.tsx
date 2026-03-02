import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';

import type { Customer } from '../types/customer';

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const getInitials = (customer: Customer) =>
  `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase();

export default function CustomerTable({
  customers,
  loading,
  onView,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  const columns: Column<Customer>[] = [
    {
      key: 'profile',
      label: 'Profile',
      header: 'Profile',
      render: (customer) => (
        <div className="flex items-center gap-3">
          {customer.photo_url ? (
            <img
              src={customer.photo_url}
              alt={customer.full_name}
              className="h-10 w-10 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-text-secondary">
              {getInitials(customer) || 'NA'}
            </div>
          )}
          <div>
            <p className="font-medium text-text-primary">{customer.full_name}</p>
            <p className="text-xs text-text-secondary">{customer.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      header: 'Phone',
      render: (customer) => customer.phone || '-',
    },
    {
      key: 'gender',
      label: 'Gender',
      header: 'Gender',
      sortable: true,
      render: (customer) => (
        <Badge variant="outline" size="sm">
          {customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'total_purchases',
      label: 'Total Purchases',
      header: 'Total Purchases',
      sortable: true,
      render: (customer) => `$${Number(customer.total_purchases).toFixed(2)}`,
    },
    {
      key: 'discount_percent',
      label: 'Discount',
      header: 'Discount',
      sortable: true,
      render: (customer) => `${Number(customer.discount_percent).toFixed(2)}%`,
    },
    {
      key: 'is_active',
      label: 'Status',
      header: 'Status',
      render: (customer) => (
        <Badge variant={customer.is_active ? 'success' : 'warning'} size="sm" dot>
          {customer.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      header: 'Created At',
      sortable: true,
      render: (customer) => new Date(customer.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      header: 'Actions',
      render: (customer) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(customer)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(customer)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(customer)}>
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
        data={customers}
        loading={loading}
        pagination={false}
        emptyMessage="No customers found"
        getRowKey={(customer) => customer.id}
      />
    </Card>
  );
}

