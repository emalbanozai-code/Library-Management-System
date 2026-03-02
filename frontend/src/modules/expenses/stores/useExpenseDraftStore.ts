import { create } from 'zustand';

import type { ExpenseCategory, ExpenseFormValues } from '../types/expense';

interface ExpenseDraftState {
  title: string;
  description: string;
  amount: number;
  paymentDate: string;
  paidBy: number;
  category: ExpenseCategory;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setAmount: (value: number) => void;
  setPaymentDate: (value: string) => void;
  setPaidBy: (value: number) => void;
  setCategory: (value: ExpenseCategory) => void;
  setDraft: (values: ExpenseFormValues) => void;
  resetDraft: () => void;
}

const today = new Date().toISOString().slice(0, 10);

const initialState = {
  title: '',
  description: '',
  amount: 0,
  paymentDate: today,
  paidBy: 0,
  category: 'other' as ExpenseCategory,
};

export const useExpenseDraftStore = create<ExpenseDraftState>((set) => ({
  ...initialState,
  setTitle: (value) => set({ title: value }),
  setDescription: (value) => set({ description: value }),
  setAmount: (value) => set({ amount: value }),
  setPaymentDate: (value) => set({ paymentDate: value }),
  setPaidBy: (value) => set({ paidBy: value }),
  setCategory: (value) => set({ category: value }),
  setDraft: (values) =>
    set({
      title: values.title,
      description: values.description,
      amount: values.amount,
      paymentDate: values.payment_date,
      paidBy: values.paid_by,
      category: values.category,
    }),
  resetDraft: () => set(initialState),
}));

