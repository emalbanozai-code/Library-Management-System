import { Pencil, Trash2 } from 'lucide-react';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { BookCategory } from '../types/book';

interface BookCategoryTableProps {
  categories: BookCategory[];
  loading?: boolean;
  onEdit: (category: BookCategory) => void;
  onDelete: (category: BookCategory) => void;
}

export default function BookCategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
}: BookCategoryTableProps) {
  const columns: Column<BookCategory>[] = [
    {
      key: 'name',
      label: 'Name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      header: 'Description',
      render: (category) => category.description || '-',
    },
    {
      key: 'created_at',
      label: 'Created At',
      header: 'Created At',
      sortable: true,
      render: (category) => new Date(category.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      header: 'Actions',
      render: (category) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(category)}>
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
        data={categories}
        loading={loading}
        pagination={false}
        emptyMessage="No categories found"
        getRowKey={(category) => category.id}
      />
    </Card>
  );
}
