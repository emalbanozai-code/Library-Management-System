import apiClient from '@/lib/api';

import type {
  CreateSalePayload,
  PaginatedSalesResponse,
  Sale,
  SalesListParams,
} from '../types/sale';

const SALES_ENDPOINT = '/sales/';

export const saleService = {
  getSales: (params?: SalesListParams) =>
    apiClient.get<PaginatedSalesResponse>(SALES_ENDPOINT, { params }),

  getSale: (id: number) => apiClient.get<Sale>(`${SALES_ENDPOINT}${id}/`),

  createSale: (payload: CreateSalePayload) => apiClient.post<Sale>(SALES_ENDPOINT, payload),

  updateSale: (id: number, payload: CreateSalePayload) =>
    apiClient.put<Sale>(`${SALES_ENDPOINT}${id}/`, payload),

  deleteSale: (id: number) => apiClient.delete(`${SALES_ENDPOINT}${id}/`),
};

export default saleService;
