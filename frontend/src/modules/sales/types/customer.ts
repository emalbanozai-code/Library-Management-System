export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  total_completed_sales: number;
  total_spent: string;
  last_purchase_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary {
  customer_id: number;
  customer_name: string;
  total_completed_sales: number;
  total_spent: string;
  last_purchase_date: string | null;
}

export interface CustomerPurchaseHistoryItem {
  id: number;
  sale_date: string;
  subtotal_amount: string;
  discount_percent: string;
  discount_amount: string;
  total_amount: string;
  item_count: number;
}

export interface CustomerPurchaseHistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerPurchaseHistoryItem[];
  summary: CustomerSummary;
}

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

export interface PaginatedCustomersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}
