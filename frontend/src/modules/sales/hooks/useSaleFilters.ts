import { useMemo, useState } from 'react';

import type { SalesListParams } from '../types/sale';

interface SaleFilters {
  customer: string;
  dateFrom: string;
  dateTo: string;
  minTotal: string;
  maxTotal: string;
  ordering: string;
  search: string;
  page: number;
  pageSize: number;
}

const defaultFilters: SaleFilters = {
  customer: '',
  dateFrom: '',
  dateTo: '',
  minTotal: '',
  maxTotal: '',
  ordering: '-sale_date',
  search: '',
  page: 1,
  pageSize: 10,
};

export const useSaleFilters = () => {
  const [filters, setFilters] = useState<SaleFilters>(defaultFilters);

  const params = useMemo<SalesListParams>(() => {
    return {
      page: filters.page,
      page_size: filters.pageSize,
      customer: filters.customer ? Number(filters.customer) : undefined,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
      min_total: filters.minTotal ? Number(filters.minTotal) : undefined,
      max_total: filters.maxTotal ? Number(filters.maxTotal) : undefined,
      ordering: filters.ordering || undefined,
      search: filters.search || undefined,
    };
  }, [filters]);

  const updateFilter = (key: keyof SaleFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? Number(value) : 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};
