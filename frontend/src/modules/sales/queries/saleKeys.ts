import type { SalesListParams } from '../types/sale';

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (params?: SalesListParams) => [...saleKeys.lists(), params] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: number) => [...saleKeys.details(), id] as const,
};
