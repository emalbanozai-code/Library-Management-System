import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import { saleKeys } from './saleKeys';
import { saleService } from '../services/saleService';
import type { CreateSalePayload, SalesListParams } from '../types/sale';

export const useSalesList = (params?: SalesListParams) => {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => saleService.getSales(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useSaleDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => saleService.getSale(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalePayload) => saleService.createSale(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Sale created successfully');
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create sale'));
    },
  });
};

export const useUpdateSale = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalePayload) => saleService.updateSale(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Sale updated successfully');
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update sale'));
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => saleService.deleteSale(id),
    onSuccess: () => {
      toast.success('Sale deleted successfully');
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete sale'));
    },
  });
};
