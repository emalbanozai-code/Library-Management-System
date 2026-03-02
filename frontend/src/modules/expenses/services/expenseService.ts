import apiClient from '@/lib/api';

import type {
  Expense,
  ExpenseFormValues,
  ExpenseListParams,
  PaginatedExpensesResponse,
} from '../types/expense';

const EXPENSES_ENDPOINT = '/expenses/';

const normalizePayload = (payload: ExpenseFormValues) => ({
  ...payload,
  amount: Number(payload.amount),
});

export const expenseService = {
  getExpenses: (params?: ExpenseListParams) =>
    apiClient.get<PaginatedExpensesResponse>(EXPENSES_ENDPOINT, { params }),

  getExpense: (id: number) => apiClient.get<Expense>(`${EXPENSES_ENDPOINT}${id}/`),

  createExpense: (payload: ExpenseFormValues) =>
    apiClient.post<Expense>(EXPENSES_ENDPOINT, normalizePayload(payload)),

  updateExpense: (id: number, payload: ExpenseFormValues) =>
    apiClient.put<Expense>(`${EXPENSES_ENDPOINT}${id}/`, normalizePayload(payload)),

  deleteExpense: (id: number) => apiClient.delete(`${EXPENSES_ENDPOINT}${id}/`),
};

export default expenseService;

