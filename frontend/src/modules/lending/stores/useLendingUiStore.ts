import { create } from 'zustand';

import type {
  LendingPaymentMethod,
  LendingPaymentStatus,
  LendingStatus,
} from '../types/lending';

interface LendingUiState {
  page: number;
  pageSize: number;
  search: string;
  book: string;
  customer: string;
  status: '' | LendingStatus;
  paymentStatus: '' | LendingPaymentStatus;
  paymentMethod: '' | LendingPaymentMethod;
  lateOnly: boolean;
  overdueOnly: boolean;
  ordering: string;
  setFilters: (patch: Partial<Omit<LendingUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

const initialState: Omit<LendingUiState, 'setFilters' | 'resetFilters'> = {
  page: 1,
  pageSize: 10,
  search: '',
  book: '',
  customer: '',
  status: '',
  paymentStatus: '',
  paymentMethod: '',
  lateOnly: false,
  overdueOnly: false,
  ordering: '-created_at',
};

export const useLendingUiStore = create<LendingUiState>((set) => ({
  ...initialState,
  setFilters: (patch) => set((state) => ({ ...state, ...patch })),
  resetFilters: () => set(initialState),
}));

