import { useState } from 'react';

import { Alert, Button, Card, CardContent, Input, Textarea } from '@/components/ui';
import type { Book } from '@/modules/books/types/book';

import { useSaleTotals } from '../hooks/useSaleTotals';
import { saleSchema } from '../schemas/saleSchema';
import { useSaleDraftStore } from '../stores/useSaleDraftStore';
import type { Customer } from '../types/customer';
import type { CreateSalePayload } from '../types/sale';
import CustomerSelector from './CustomerSelector';
import SaleItemsEditor from './SaleItemsEditor';

interface SaleFormProps {
  books: Book[];
  customers: Customer[];
  onSubmit: (payload: CreateSalePayload) => Promise<void>;
  onViewHistory: (customerId: number) => void;
  saving?: boolean;
  submitLabel?: string;
}

export default function SaleForm({
  books,
  customers,
  onSubmit,
  onViewHistory,
  saving = false,
  submitLabel = 'Save Sale',
}: SaleFormProps) {
  const {
    saleDate,
    customerId,
    discountPercent,
    notes,
    items,
    setSaleDate,
    setCustomerId,
    setDiscountPercent,
    setNotes,
    addItem,
    updateItem,
    removeItem,
  } = useSaleDraftStore();

  const [formError, setFormError] = useState<string | null>(null);
  const totals = useSaleTotals(items, discountPercent);

  const buildPayload = (): CreateSalePayload | null => {
    const payload: CreateSalePayload = {
      sale_date: saleDate || undefined,
      customer: customerId,
      discount_percent: discountPercent,
      notes,
      items,
    };

    const validation = saleSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || 'Invalid sale data');
      return null;
    }

    setFormError(null);
    return validation.data;
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    await onSubmit(payload);
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            type="datetime-local"
            label="Sale Date"
            value={saleDate}
            onChange={(event) => setSaleDate(event.target.value)}
          />
          <CustomerSelector
            customers={customers}
            selectedCustomerId={customerId}
            onChange={setCustomerId}
            onViewHistory={onViewHistory}
          />
        </div>

        <SaleItemsEditor
          items={items}
          books={books}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Discount %"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={discountPercent}
            onChange={(event) => setDiscountPercent(Number(event.target.value || 0))}
          />
        </div>

        <Textarea
          label="Notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional notes"
        />

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">Subtotal: ${totals.subtotal.toFixed(2)}</p>
          <p className="text-sm text-text-secondary">
            Discount: {totals.discountPercent}% (${totals.discountAmount.toFixed(2)})
          </p>
          <p className="text-base font-semibold text-text-primary">Total: ${totals.total.toFixed(2)}</p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={handleSubmit} loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
