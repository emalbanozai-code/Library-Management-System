import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useLendingUiStore } from '../stores/useLendingUiStore';
import type { LendingListParams } from '../types/lending';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | null) => value === 'true';

export const useLendingFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const {
    page,
    pageSize,
    search,
    book,
    customer,
    status,
    paymentStatus,
    paymentMethod,
    lateOnly,
    overdueOnly,
    ordering,
    setFilters,
    resetFilters,
  } = useLendingUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      book: searchParams.get('book') || '',
      customer: searchParams.get('customer') || '',
      status:
        searchParams.get('status') === 'returned' || searchParams.get('status') === 'not_returned'
          ? (searchParams.get('status') as 'returned' | 'not_returned')
          : '',
      paymentStatus:
        searchParams.get('payment_status') === 'paid' || searchParams.get('payment_status') === 'unpaid'
          ? (searchParams.get('payment_status') as 'paid' | 'unpaid')
          : '',
      paymentMethod:
        searchParams.get('payment_method') === 'cash' ||
        searchParams.get('payment_method') === 'card' ||
        searchParams.get('payment_method') === 'transfer' ||
        searchParams.get('payment_method') === 'online' ||
        searchParams.get('payment_method') === 'other'
          ? (searchParams.get('payment_method') as 'cash' | 'card' | 'transfer' | 'online' | 'other')
          : '',
      lateOnly: parseBoolean(searchParams.get('late_only')),
      overdueOnly: parseBoolean(searchParams.get('overdue_only')),
      ordering: searchParams.get('ordering') || '-created_at',
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
    if (book) {
      params.set('book', book);
    }
    if (customer) {
      params.set('customer', customer);
    }
    if (status) {
      params.set('status', status);
    }
    if (paymentStatus) {
      params.set('payment_status', paymentStatus);
    }
    if (paymentMethod) {
      params.set('payment_method', paymentMethod);
    }
    if (lateOnly) {
      params.set('late_only', 'true');
    }
    if (overdueOnly) {
      params.set('overdue_only', 'true');
    }
    if (ordering && ordering !== '-created_at') {
      params.set('ordering', ordering);
    }

    setSearchParams(params, { replace: true });
  }, [
    page,
    pageSize,
    search,
    book,
    customer,
    status,
    paymentStatus,
    paymentMethod,
    lateOnly,
    overdueOnly,
    ordering,
    setSearchParams,
  ]);

  const params = useMemo<LendingListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      book: book ? Number(book) : undefined,
      customer: customer ? Number(customer) : undefined,
      status: status || undefined,
      payment_status: paymentStatus || undefined,
      payment_method: paymentMethod || undefined,
      late_only: lateOnly || undefined,
      overdue_only: overdueOnly || undefined,
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, book, customer, status, paymentStatus, paymentMethod, lateOnly, overdueOnly, ordering]);

  const updateFilter = (
    key:
      | 'search'
      | 'book'
      | 'customer'
      | 'status'
      | 'paymentStatus'
      | 'paymentMethod'
      | 'lateOnly'
      | 'overdueOnly'
      | 'ordering'
      | 'pageSize',
    value: string | boolean | number
  ) => {
    setFilters({
      [key]: value,
      page:
        key === 'search' ||
        key === 'book' ||
        key === 'customer' ||
        key === 'status' ||
        key === 'paymentStatus' ||
        key === 'paymentMethod' ||
        key === 'lateOnly' ||
        key === 'overdueOnly' ||
        key === 'ordering' ||
        key === 'pageSize'
          ? 1
          : page,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });
  const clearFilters = () => resetFilters();

  return {
    filters: {
      page,
      pageSize,
      search,
      book,
      customer,
      status,
      paymentStatus,
      paymentMethod,
      lateOnly,
      overdueOnly,
      ordering,
    },
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};

