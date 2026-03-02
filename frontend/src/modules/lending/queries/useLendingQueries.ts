import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import { lendingKeys } from './lendingKeys';
import { lendingService } from '../services/lendingService';
import type { LendingFormValues, LendingListParams, ReturnLendingPayload } from '../types/lending';

export const useLendingsList = (params?: LendingListParams) => {
  return useQuery({
    queryKey: lendingKeys.list(params),
    queryFn: () => lendingService.getLendings(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useLendingDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: lendingKeys.detail(id),
    queryFn: () => lendingService.getLending(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateLending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LendingFormValues) =>
      lendingService.createLending(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Lending created successfully');
      queryClient.invalidateQueries({ queryKey: lendingKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create lending'));
    },
  });
};

export const useUpdateLending = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LendingFormValues) =>
      lendingService.updateLending(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Lending updated successfully');
      queryClient.invalidateQueries({ queryKey: lendingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lendingKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update lending'));
    },
  });
};

export const useDeleteLending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lendingService.deleteLending(id),
    onSuccess: () => {
      toast.success('Lending deleted successfully');
      queryClient.invalidateQueries({ queryKey: lendingKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete lending'));
    },
  });
};

export const useReturnLending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: ReturnLendingPayload }) =>
      lendingService.returnLending(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Book marked as returned');
      queryClient.invalidateQueries({ queryKey: lendingKeys.details() });
      queryClient.invalidateQueries({ queryKey: lendingKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to mark lending as returned'));
    },
  });
};
