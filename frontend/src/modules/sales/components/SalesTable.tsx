import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Sale } from '../types/sale';

interface SalesTableProps {
  sales: Sale[];
  loading?: boolean;
  onEdit?: (sale: Sale) => void;
  onDelete?: (sale: Sale) => void;
  onViewCustomerHistory: (customerId: number) => void;
  canManage?: boolean;
}

export default function SalesTable({
  sales,
  loading,
  onEdit,
  onDelete,
  onViewCustomerHistory,
  canManage = false,
}: SalesTableProps) {
  const columns: Column<Sale>[] = [
    {
      key: 'id',
      header: 'Sale',
      label: 'Sale',
      sortable: true,
      render: (sale) => (
        <div>
          <p className="font-medium text-text-primary">#{sale.id}</p>
          <p className="text-xs text-text-secondary">{new Date(sale.sale_date).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      label: 'Customer',
      render: (sale) => sale.customer_name || 'Walk-in',
    },
    {
      key: 'price',
      header: 'Price',
      label: 'Price',
      sortable: true,
      render: (sale) => `Af ${Number(sale.price || sale.subtotal_amount).toFixed(2)}`,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      label: 'Quantity',
      sortable: true,
      render: (sale) =>
        String(
          sale.quantity ??
            sale.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        ),
    },
    {
      key: 'discount_amount',
      header: 'Discount',
      label: 'Discount',
      render: (sale) => `Af ${Number(sale.discount_amount).toFixed(2)} (${sale.discount_percent}%)`,
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      label: 'Total Amount',
      sortable: true,
      render: (sale) => `Af ${Number(sale.total_amount).toFixed(2)}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      label: 'Actions',
      render: (sale) => (
        <div className="flex items-center gap-2">
          {sale.customer ? (
            <Button size="sm" variant="ghost" onClick={() => onViewCustomerHistory(sale.customer as number)}>
              <Eye className="h-4 w-4" />
            </Button>
          ) : null}
          {canManage && onEdit ? (
            <Button size="sm" variant="ghost" onClick={() => onEdit(sale)}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {canManage && onDelete ? (
            <Button size="sm" variant="ghost" onClick={() => onDelete(sale)}>
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
        data={sales}
        loading={loading}
        pagination={false}
        emptyMessage="No sales found"
        getRowKey={(sale) => sale.id}
      />
    </Card>
  );
}
