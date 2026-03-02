import { Plus, Trash2 } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import type { Book } from '@/modules/books/types/book';

import type { CreateSaleItemPayload } from '../types/sale';

interface SaleItemsEditorProps {
  items: CreateSaleItemPayload[];
  books: Book[];
  onAddItem: () => void;
  onUpdateItem: (index: number, patch: Partial<CreateSaleItemPayload>) => void;
  onRemoveItem: (index: number) => void;
}

export default function SaleItemsEditor({
  items,
  books,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: SaleItemsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Sale Items</h3>
        <Button size="sm" variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={onAddItem}>
          Add Item
        </Button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Book</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={item.book || ''}
              onChange={(event) => {
                const nextBookId = Number(event.target.value);
                const selectedBook = books.find((book) => book.id === nextBookId);
                onUpdateItem(index, {
                  book: nextBookId,
                  unit_price: selectedBook ? Number(selectedBook.price) : 0,
                });
              }}
            >
              <option value="">Select book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.isbn})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Qty"
              type="number"
              min="1"
              value={item.quantity || 1}
              onChange={(event) => onUpdateItem(index, { quantity: Number(event.target.value || 1) })}
            />
          </div>

          <div className="md:col-span-3">
            <Input
              label="Price"
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price ?? 0}
              onChange={(event) => onUpdateItem(index, { unit_price: Number(event.target.value || 0) })}
            />
          </div>

          <div className="flex items-end md:col-span-2">
            <Button variant="ghost" onClick={() => onRemoveItem(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
