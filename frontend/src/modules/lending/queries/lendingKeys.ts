import type { LendingListParams } from '../types/lending';

export const lendingKeys = {
  all: ['lending'] as const,
  lists: () => [...lendingKeys.all, 'list'] as const,
  list: (params?: LendingListParams) => [...lendingKeys.lists(), params] as const,
  details: () => [...lendingKeys.all, 'detail'] as const,
  detail: (id: number) => [...lendingKeys.details(), id] as const,
};

