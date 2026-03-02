import apiClient from '@/lib/api';

import type {
  Customer,
  CustomerFormValues,
  CustomerListParams,
  PaginatedCustomersResponse,
} from '../types/customer';

const CUSTOMERS_ENDPOINT = '/customers/';

const buildCustomerFormData = (payload: CustomerFormValues) => {
  const formData = new FormData();

  formData.append('first_name', payload.first_name);
  formData.append('last_name', payload.last_name);
  formData.append('phone', payload.phone || '');
  formData.append('email', payload.email || '');
  formData.append('address', payload.address || '');
  formData.append('gender', payload.gender);
  formData.append('total_purchases', String(payload.total_purchases));
  formData.append('discount_percent', String(payload.discount_percent));
  formData.append('is_active', String(payload.is_active));

  if (payload.photo instanceof File) {
    formData.append('photo', payload.photo);
  } else if (payload.photo === null) {
    formData.append('photo', '');
  }

  return formData;
};

export const customerService = {
  getCustomers: (params?: CustomerListParams) =>
    apiClient.get<PaginatedCustomersResponse>(CUSTOMERS_ENDPOINT, { params }),

  getCustomer: (id: number) => apiClient.get<Customer>(`${CUSTOMERS_ENDPOINT}${id}/`),

  createCustomer: (payload: CustomerFormValues) =>
    apiClient.post<Customer>(CUSTOMERS_ENDPOINT, buildCustomerFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateCustomer: (id: number, payload: CustomerFormValues) =>
    apiClient.patch<Customer>(`${CUSTOMERS_ENDPOINT}${id}/`, buildCustomerFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteCustomer: (id: number) => apiClient.delete(`${CUSTOMERS_ENDPOINT}${id}/`),
};

export default customerService;

