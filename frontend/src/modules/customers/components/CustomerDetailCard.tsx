import type { ReactNode } from 'react';

import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';

import type { Customer } from '../types/customer';

interface CustomerDetailCardProps {
  customer: Customer;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
  canManage?: boolean;
}

export default function CustomerDetailCard({
  customer,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
  canManage = false,
}: CustomerDetailCardProps) {
  return (
    <Card>
      <CardHeader
        title={customer.full_name}
        subtitle={customer.email || 'No email provided'}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {canManage && onEdit ? (
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
            {canManage && onDelete ? (
              <Button variant="danger" onClick={onDelete} loading={deleting}>
                Delete
              </Button>
            ) : null}
          </div>
        }
      />
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          {customer.photo_url ? (
            <img
              src={customer.photo_url}
              alt={customer.full_name}
              className="h-24 w-24 rounded-xl border border-border object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-surface text-sm text-text-secondary">
              No Photo
            </div>
          )}
          <div className="space-y-2">
            <Badge variant={customer.is_active ? 'success' : 'warning'} dot>
              {customer.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <p className="text-sm text-text-secondary">
              Joined on {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label="First Name" value={customer.first_name} />
          <DetailItem label="Last Name" value={customer.last_name} />
          <DetailItem label="Phone" value={customer.phone || '-'} />
          <DetailItem label="Email" value={customer.email || '-'} />
          <DetailItem
            label="Gender"
            value={customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)}
          />
          <DetailItem label="Total Purchases" value={`$${Number(customer.total_purchases).toFixed(2)}`} />
          <DetailItem label="Discount Percent" value={`${Number(customer.discount_percent).toFixed(2)}%`} />
          <DetailItem label="Updated At" value={new Date(customer.updated_at).toLocaleString()} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">Address</p>
          <p className="text-sm text-text-secondary">{customer.address || 'No address provided'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="mt-1 text-sm text-text-primary">{value}</div>
    </div>
  );
}
