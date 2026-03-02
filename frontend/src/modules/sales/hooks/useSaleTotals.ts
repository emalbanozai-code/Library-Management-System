import { useMemo } from 'react';

import type { CreateSaleItemPayload } from '../types/sale';

interface SaleTotals {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export const useSaleTotals = (items: CreateSaleItemPayload[], discountPercent: number): SaleTotals => {
  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unit_price || 0);
      return sum + quantity * unitPrice;
    }, 0);

    const normalizedDiscountPercent = Math.max(0, Math.min(100, Number(discountPercent || 0)));
    const discountAmount = (subtotal * normalizedDiscountPercent) / 100;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discountPercent: normalizedDiscountPercent,
      discountAmount,
      total,
    };
  }, [items, discountPercent]);
};
