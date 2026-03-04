import { useEffect, useState } from 'react';

import apiClient from '@/lib/api';
import { Alert, Button, Card, CardContent, Input, Textarea } from '@/components/ui';
import type { Book } from '@/modules/books/types/book';
import { extractAxiosError } from '@/utils/extractError';

import { useSaleTotals } from '../hooks/useSaleTotals';
import { saleSchema } from '../schemas/saleSchema';
import { useSaleDraftStore } from '../stores/useSaleDraftStore';
import type { Customer } from '../types/customer';
import type { CreateSalePayload } from '../types/sale';
import CustomerSelector from './CustomerSelector';
import SaleItemsEditor from './SaleItemsEditor';

interface SaleFormProps {
  books: Book[];
  onSubmit: (payload: CreateSalePayload) => Promise<void>;
  onViewHistory: (customerId: number) => void;
  saving?: boolean;
  submitLabel?: string;
}

interface CustomerFromCustomersModule {
  id: number;
  sales_customer_id?: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  total_purchases: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedCustomersFromCustomersModule {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerFromCustomersModule[];
}

export default function SaleForm({
  books,
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoadError, setCustomersLoadError] = useState<string | null>(null);
  const totals = useSaleTotals(items, discountPercent);

  useEffect(() => {
    let active = true;

    const loadCustomers = async () => {
      try {
        const response = await apiClient.get<PaginatedCustomersFromCustomersModule>('/customers/for-sales/', {
          params: { page_size: 200, ordering: 'first_name' },
        });

        if (!active) {
          return;
        }

        const normalizedCustomers: Customer[] = response.data.results.map((customer) => ({
          id: customer.sales_customer_id ?? customer.id,
          full_name: customer.full_name || `${customer.first_name} ${customer.last_name}`.trim(),
          phone: customer.phone || '',
          email: customer.email || '',
          is_active: customer.is_active,
          total_completed_sales: 0,
          total_spent: customer.total_purchases || '0',
          last_purchase_date: null,
          notes: '',
          created_at: customer.created_at,
          updated_at: customer.updated_at,
        }));

        setCustomers(normalizedCustomers);
        setCustomersLoadError(null);
      } catch (error) {
        if (!active) {
          return;
        }
        setCustomers([]);
        setCustomersLoadError(extractAxiosError(error, 'Failed to load customers'));
      }
    };

    loadCustomers();

    return () => {
      active = false;
    };
  }, []);

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
        {customersLoadError ? <Alert variant="error">{customersLoadError}</Alert> : null}

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
