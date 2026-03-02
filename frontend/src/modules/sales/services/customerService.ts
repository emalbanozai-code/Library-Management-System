import apiClient from '@/lib/api';

import type {
  Customer,
  CustomerListParams,
  CustomerPurchaseHistoryResponse,
  PaginatedCustomersResponse,
} from '../types/customer';

const CUSTOMERS_ENDPOINT = '/sales/customers/';

export interface CustomerCreatePayload {
  full_name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export const customerService = {
  getCustomers: (params?: CustomerListParams) =>
    apiClient.get<PaginatedCustomersResponse>(CUSTOMERS_ENDPOINT, { params }),

  getCustomer: (id: number) => apiClient.get<Customer>(`${CUSTOMERS_ENDPOINT}${id}/`),

  createCustomer: (payload: CustomerCreatePayload) =>
    apiClient.post<Customer>(CUSTOMERS_ENDPOINT, payload),

  updateCustomer: (id: number, payload: Partial<CustomerCreatePayload>) =>
    apiClient.patch<Customer>(`${CUSTOMERS_ENDPOINT}${id}/`, payload),

  getCustomerPurchaseHistory: (id: number, params?: { page?: number; page_size?: number }) =>
    apiClient.get<CustomerPurchaseHistoryResponse>(`${CUSTOMERS_ENDPOINT}${id}/purchase-history/`, { params }),
};

export default customerService;
