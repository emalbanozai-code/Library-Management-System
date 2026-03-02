import { useState } from 'react';

import { Alert, Button, Card, CardContent, Input, Select } from '@/components/ui';
import type { Book } from '@/modules/books/types/book';
import type { Customer } from '@/modules/customers/types/customer';

import { lendingSchema } from '../schemas/lendingSchema';
import { useLendingDraftStore } from '../stores/useLendingDraftStore';
import type { LendingFormValues } from '../types/lending';

interface LendingFormProps {
  books: Book[];
  customers: Customer[];
  onSubmit: (values: LendingFormValues) => Promise<void>;
  saving?: boolean;
  submitLabel?: string;
}

export default function LendingForm({
  books,
  customers,
  onSubmit,
  saving = false,
  submitLabel = 'Save Lending',
}: LendingFormProps) {
  const {
    book,
    customer,
    startDate,
    endDate,
    rentPrice,
    status,
    finePerDay,
    paymentStatus,
    paymentMethod,
    setBook,
    setCustomer,
    setStartDate,
    setEndDate,
    setRentPrice,
    setStatus,
    setFinePerDay,
    setPaymentStatus,
    setPaymentMethod,
  } = useLendingDraftStore();

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsed = lendingSchema.safeParse({
      book,
      customer,
      start_date: startDate,
      end_date: endDate,
      rent_price: rentPrice,
      status,
      fine_per_day: finePerDay,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Invalid lending data');
      return;
    }

    setFormError(null);
    await onSubmit(parsed.data);
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Book"
            options={[
              { value: '', label: 'Select book' },
              ...books.map((item) => ({
                value: String(item.id),
                label: `${item.title} (${item.available_quantity} available)`,
              })),
            ]}
            value={book ? String(book) : ''}
            onChange={(event) => setBook(Number(event.target.value || 0))}
          />
          <Select
            label="Customer"
            options={[
              { value: '', label: 'Select customer' },
              ...customers.map((item) => ({
                value: String(item.id),
                label: item.full_name,
              })),
            ]}
            value={customer ? String(customer) : ''}
            onChange={(event) => setCustomer(Number(event.target.value || 0))}
          />
          <Input label="Start Date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Input
            label="Rent Price"
            type="number"
            min="0"
            step="0.01"
            value={rentPrice}
            onChange={(event) => setRentPrice(Number(event.target.value || 0))}
          />
          <Input
            label="Fine Per Day"
            type="number"
            min="0"
            step="0.01"
            value={finePerDay}
            onChange={(event) => setFinePerDay(Number(event.target.value || 0))}
          />
          <Select
            label="Status"
            options={[
              { value: 'not_returned', label: 'Not Returned' },
              { value: 'returned', label: 'Returned' },
            ]}
            value={status}
            onChange={(event) => setStatus(event.target.value as 'returned' | 'not_returned')}
          />
          <Select
            label="Payment Status"
            options={[
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
            ]}
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value as 'paid' | 'unpaid')}
          />
          <Select
            label="Payment Method"
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'transfer', label: 'Bank Transfer' },
              { value: 'online', label: 'Online' },
              { value: 'other', label: 'Other' },
            ]}
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value as 'cash' | 'card' | 'transfer' | 'online' | 'other')
            }
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

