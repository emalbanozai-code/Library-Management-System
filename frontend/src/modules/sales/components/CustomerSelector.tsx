import { Button, Select, type SelectOption } from '@/components/ui';

import type { Customer } from '../types/customer';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId: number | null;
  onChange: (customerId: number | null) => void;
  onViewHistory?: (customerId: number) => void;
}

export default function CustomerSelector({
  customers,
  selectedCustomerId,
  onChange,
  onViewHistory,
}: CustomerSelectorProps) {
  const options: SelectOption[] = [
    { value: '', label: 'Walk-in customer' },
    ...customers.map((customer) => ({ value: String(customer.id), label: customer.full_name })),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Select
        label="Customer (Optional)"
        options={options}
        value={selectedCustomerId ? String(selectedCustomerId) : ''}
        onChange={(event) => {
          const value = event.target.value;
          onChange(value ? Number(value) : null);
        }}
      />
      {selectedCustomerId && onViewHistory ? (
        <Button variant="outline" onClick={() => onViewHistory(selectedCustomerId)}>
          View Purchase History
        </Button>
      ) : null}
    </div>
  );
}
