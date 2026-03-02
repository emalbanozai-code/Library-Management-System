import { Card, DataTable, type Column } from '@/components/ui';

import type { CustomerPurchaseHistoryItem } from '../types/customer';

interface CustomerHistoryTableProps {
  records: CustomerPurchaseHistoryItem[];
  loading?: boolean;
}

export default function CustomerHistoryTable({ records, loading }: CustomerHistoryTableProps) {
  const columns: Column<CustomerPurchaseHistoryItem>[] = [
    {
      key: 'id',
      label: 'Sale ID',
      header: 'Sale ID',
      sortable: true,
      render: (record) => `#${record.id}`,
    },
    {
      key: 'sale_date',
      label: 'Sale Date',
      header: 'Sale Date',
      sortable: true,
      render: (record) => new Date(record.sale_date).toLocaleString(),
    },
    {
      key: 'item_count',
      label: 'Items',
      header: 'Items',
      sortable: true,
    },
    {
      key: 'discount_amount',
      label: 'Discount',
      header: 'Discount',
      render: (record) => `$${Number(record.discount_amount).toFixed(2)}`,
    },
    {
      key: 'total_amount',
      label: 'Total',
      header: 'Total',
      sortable: true,
      render: (record) => `$${Number(record.total_amount).toFixed(2)}`,
    },
  ];

  return (
    <Card padding="none">
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        pagination={false}
        emptyMessage="No purchase history found"
        getRowKey={(record) => record.id}
      />
    </Card>
  );
}
