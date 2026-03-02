import { create } from 'zustand';

import type {
  LendingFormValues,
  LendingPaymentMethod,
  LendingPaymentStatus,
  LendingStatus,
} from '../types/lending';

interface LendingDraftState {
  book: number;
  customer: number;
  startDate: string;
  endDate: string;
  rentPrice: number;
  status: LendingStatus;
  finePerDay: number;
  paymentStatus: LendingPaymentStatus;
  paymentMethod: LendingPaymentMethod;
  setBook: (value: number) => void;
  setCustomer: (value: number) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setRentPrice: (value: number) => void;
  setStatus: (value: LendingStatus) => void;
  setFinePerDay: (value: number) => void;
  setPaymentStatus: (value: LendingPaymentStatus) => void;
  setPaymentMethod: (value: LendingPaymentMethod) => void;
  setDraft: (values: LendingFormValues) => void;
  resetDraft: () => void;
}

const initialState = {
  book: 0,
  customer: 0,
  startDate: '',
  endDate: '',
  rentPrice: 0,
  status: 'not_returned' as LendingStatus,
  finePerDay: 0,
  paymentStatus: 'unpaid' as LendingPaymentStatus,
  paymentMethod: 'cash' as LendingPaymentMethod,
};

export const useLendingDraftStore = create<LendingDraftState>((set) => ({
  ...initialState,
  setBook: (value) => set({ book: value }),
  setCustomer: (value) => set({ customer: value }),
  setStartDate: (value) => set({ startDate: value }),
  setEndDate: (value) => set({ endDate: value }),
  setRentPrice: (value) => set({ rentPrice: value }),
  setStatus: (value) => set({ status: value }),
  setFinePerDay: (value) => set({ finePerDay: value }),
  setPaymentStatus: (value) => set({ paymentStatus: value }),
  setPaymentMethod: (value) => set({ paymentMethod: value }),
  setDraft: (values) =>
    set({
      book: values.book,
      customer: values.customer,
      startDate: values.start_date,
      endDate: values.end_date,
      rentPrice: values.rent_price,
      status: values.status,
      finePerDay: values.fine_per_day,
      paymentStatus: values.payment_status,
      paymentMethod: values.payment_method,
    }),
  resetDraft: () => set(initialState),
}));

