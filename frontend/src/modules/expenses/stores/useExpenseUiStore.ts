import { create } from 'zustand';

import type { ExpenseCategory } from '../types/expense';

interface ExpenseUiState {
  page: number;
  pageSize: number;
  search: string;
  paidBy: string;
  category: '' | ExpenseCategory;
  paymentDateFrom: string;
  paymentDateTo: string;
  minAmount: string;
  maxAmount: string;
  ordering: string;
  setFilters: (patch: Partial<Omit<ExpenseUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

const initialState: Omit<ExpenseUiState, 'setFilters' | 'resetFilters'> = {
  page: 1,
  pageSize: 10,
  search: '',
  paidBy: '',
  category: '',
  paymentDateFrom: '',
  paymentDateTo: '',
  minAmount: '',
  maxAmount: '',
  ordering: '-payment_date',
};

export const useExpenseUiStore = create<ExpenseUiState>((set) => ({
  ...initialState,
  setFilters: (patch) => set((state) => ({ ...state, ...patch })),
  resetFilters: () => set(initialState),
}));

