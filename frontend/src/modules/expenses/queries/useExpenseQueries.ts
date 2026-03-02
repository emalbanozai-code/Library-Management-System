import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import { expenseKeys } from './expenseKeys';
import { expenseService } from '../services/expenseService';
import type { ExpenseFormValues, ExpenseListParams } from '../types/expense';

export const useExpensesList = (params?: ExpenseListParams) => {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expenseService.getExpenses(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useExpenseDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseService.getExpense(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpenseFormValues) => expenseService.createExpense(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Expense created successfully');
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create expense'));
    },
  });
};

export const useUpdateExpense = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpenseFormValues) => expenseService.updateExpense(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Expense updated successfully');
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update expense'));
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete expense'));
    },
  });
};

