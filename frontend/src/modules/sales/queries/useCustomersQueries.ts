import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import { customerKeys } from './customerKeys';
import { customerService, type CustomerCreatePayload } from '../services/customerService';
import type { CustomerListParams } from '../types/customer';

export const useCustomersList = (params?: CustomerListParams) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getCustomers(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useCustomerDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomer(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCustomerHistory = (id: number, page = 1, enabled = true) => {
  return useQuery({
    queryKey: customerKeys.history(id, page),
    queryFn: () => customerService.getCustomerPurchaseHistory(id, { page }).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerCreatePayload) =>
      customerService.createCustomer(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Customer created successfully');
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create customer'));
    },
  });
};

export const useUpdateCustomer = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CustomerCreatePayload>) =>
      customerService.updateCustomer(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update customer'));
    },
  });
};
