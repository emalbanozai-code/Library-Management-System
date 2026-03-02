import { create } from 'zustand';

import type { CreateSaleItemPayload } from '../types/sale';

interface SaleDraftState {
  saleDate: string;
  customerId: number | null;
  discountPercent: number;
  notes: string;
  items: CreateSaleItemPayload[];
  setSaleDate: (value: string) => void;
  setCustomerId: (value: number | null) => void;
  setDiscountPercent: (value: number) => void;
  setNotes: (value: string) => void;
  setItems: (items: CreateSaleItemPayload[]) => void;
  setDraft: (draft: {
    saleDate: string;
    customerId: number | null;
    discountPercent: number;
    notes: string;
    items: CreateSaleItemPayload[];
  }) => void;
  addItem: () => void;
  updateItem: (index: number, patch: Partial<CreateSaleItemPayload>) => void;
  removeItem: (index: number) => void;
  resetDraft: () => void;
}

const defaultItem: CreateSaleItemPayload = {
  book: 0,
  quantity: 1,
  unit_price: 0,
};

const initialState = {
  saleDate: '',
  customerId: null,
  discountPercent: 0,
  notes: '',
  items: [{ ...defaultItem }],
};

export const useSaleDraftStore = create<SaleDraftState>((set) => ({
  ...initialState,
  setSaleDate: (value) => set({ saleDate: value }),
  setCustomerId: (value) => set({ customerId: value }),
  setDiscountPercent: (value) => set({ discountPercent: value }),
  setNotes: (value) => set({ notes: value }),
  setItems: (items) => set({ items }),
  setDraft: (draft) => set({ ...draft }),
  addItem: () => set((state) => ({ items: [...state.items, { ...defaultItem }] })),
  updateItem: (index, patch) =>
    set((state) => ({
      items: state.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    })),
  removeItem: (index) =>
    set((state) => {
      const items = state.items.filter((_, itemIndex) => itemIndex !== index);
      return { items: items.length ? items : [{ ...defaultItem }] };
    }),
  resetDraft: () => set({ ...initialState }),
}));
