export { default as SalesTable } from './components/SalesTable';
export { default as SaleForm } from './components/SaleForm';
export { default as SaleItemsEditor } from './components/SaleItemsEditor';
export { default as CustomerSelector } from './components/CustomerSelector';
export { default as CustomerHistoryTable } from './components/CustomerHistoryTable';

export { useSaleFilters } from './hooks/useSaleFilters';
export { useSaleTotals } from './hooks/useSaleTotals';

export { customerKeys } from './queries/customerKeys';
export { saleKeys } from './queries/saleKeys';
export {
  useSalesList,
  useSaleDetail,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
} from './queries/useSalesQueries';
export {
  useCustomersList,
  useCustomerDetail,
  useCustomerHistory,
  useCreateCustomer,
  useUpdateCustomer,
} from './queries/useCustomersQueries';

export { customerSchema } from './schemas/customerSchema';
export { saleSchema } from './schemas/saleSchema';

export { useSaleDraftStore } from './stores/useSaleDraftStore';

export { default as SalesListPage } from './pages/SalesListPage';
export { default as AddSalePage } from './pages/AddSalePage';
export { default as CustomerPurchaseHistoryPage } from './pages/CustomerPurchaseHistoryPage';

export type {
  Customer,
  CustomerSummary,
  CustomerPurchaseHistoryItem,
  CustomerPurchaseHistoryResponse,
  CustomerListParams,
  PaginatedCustomersResponse,
} from './types/customer';
export type {
  Sale,
  SaleItem,
  CreateSalePayload,
  CreateSaleItemPayload,
  SalesListParams,
  PaginatedSalesResponse,
} from './types/sale';
