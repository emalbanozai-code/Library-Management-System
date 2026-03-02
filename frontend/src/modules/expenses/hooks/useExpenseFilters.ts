import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useExpenseUiStore } from '../stores/useExpenseUiStore';
import type { ExpenseListParams } from '../types/expense';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const useExpenseFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const {
    page,
    pageSize,
    search,
    paidBy,
    category,
    paymentDateFrom,
    paymentDateTo,
    minAmount,
    maxAmount,
    ordering,
    setFilters,
    resetFilters,
  } = useExpenseUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const categoryParam = searchParams.get('category');
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      paidBy: searchParams.get('paid_by') || '',
      category:
        categoryParam === 'salary' ||
        categoryParam === 'electricity' ||
        categoryParam === 'rent' ||
        categoryParam === 'water' ||
        categoryParam === 'internet' ||
        categoryParam === 'maintenance' ||
        categoryParam === 'supplies' ||
        categoryParam === 'other'
          ? categoryParam
          : '',
      paymentDateFrom: searchParams.get('payment_date_from') || '',
      paymentDateTo: searchParams.get('payment_date_to') || '',
      minAmount: searchParams.get('min_amount') || '',
      maxAmount: searchParams.get('max_amount') || '',
      ordering: searchParams.get('ordering') || '-payment_date',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) {
      params.set('page', String(page));
    }
    if (pageSize !== 10) {
      params.set('page_size', String(pageSize));
    }
    if (search) {
      params.set('search', search);
    }
    if (paidBy) {
      params.set('paid_by', paidBy);
    }
    if (category) {
      params.set('category', category);
    }
    if (paymentDateFrom) {
      params.set('payment_date_from', paymentDateFrom);
    }
    if (paymentDateTo) {
      params.set('payment_date_to', paymentDateTo);
    }
    if (minAmount) {
      params.set('min_amount', minAmount);
    }
    if (maxAmount) {
      params.set('max_amount', maxAmount);
    }
    if (ordering && ordering !== '-payment_date') {
      params.set('ordering', ordering);
    }
    setSearchParams(params, { replace: true });
  }, [
    page,
    pageSize,
    search,
    paidBy,
    category,
    paymentDateFrom,
    paymentDateTo,
    minAmount,
    maxAmount,
    ordering,
    setSearchParams,
  ]);

  const params = useMemo<ExpenseListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      paid_by: paidBy ? Number(paidBy) : undefined,
      category: category || undefined,
      payment_date_from: paymentDateFrom || undefined,
      payment_date_to: paymentDateTo || undefined,
      min_amount: minAmount ? Number(minAmount) : undefined,
      max_amount: maxAmount ? Number(maxAmount) : undefined,
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, paidBy, category, paymentDateFrom, paymentDateTo, minAmount, maxAmount, ordering]);

  const updateFilter = (
    key:
      | 'search'
      | 'paidBy'
      | 'category'
      | 'paymentDateFrom'
      | 'paymentDateTo'
      | 'minAmount'
      | 'maxAmount'
      | 'ordering'
      | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });
  const clearFilters = () => resetFilters();

  return {
    filters: {
      page,
      pageSize,
      search,
      paidBy,
      category,
      paymentDateFrom,
      paymentDateTo,
      minAmount,
      maxAmount,
      ordering,
    },
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};
