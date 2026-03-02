import apiClient from '@/lib/api';

import type {
  Lending,
  LendingFormValues,
  LendingListParams,
  PaginatedLendingsResponse,
  ReturnLendingPayload,
} from '../types/lending';

const LENDING_ENDPOINT = '/lending/';

const normalizePayload = (payload: LendingFormValues) => ({
  ...payload,
  rent_price: Number(payload.rent_price),
  fine_per_day: Number(payload.fine_per_day),
});

export const lendingService = {
  getLendings: (params?: LendingListParams) =>
    apiClient.get<PaginatedLendingsResponse>(LENDING_ENDPOINT, { params }),

  getLending: (id: number) => apiClient.get<Lending>(`${LENDING_ENDPOINT}${id}/`),

  createLending: (payload: LendingFormValues) =>
    apiClient.post<Lending>(LENDING_ENDPOINT, normalizePayload(payload)),

  updateLending: (id: number, payload: LendingFormValues) =>
    apiClient.put<Lending>(`${LENDING_ENDPOINT}${id}/`, normalizePayload(payload)),

  deleteLending: (id: number) => apiClient.delete(`${LENDING_ENDPOINT}${id}/`),

  returnLending: (id: number, payload?: ReturnLendingPayload) =>
    apiClient.post<Lending>(`${LENDING_ENDPOINT}${id}/return/`, payload || {}),
};

export default lendingService;

