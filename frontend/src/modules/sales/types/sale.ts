export interface SaleItem {
  id: number;
  book: number;
  book_title: string;
  book_title_snapshot: string;
  book_isbn_snapshot: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface CreateSaleItemPayload {
  book: number;
  quantity: number;
  unit_price?: number;
}

export interface Sale {
  id: number;
  sale_date: string;
  customer: number | null;
  customer_name: string | null;
  subtotal_amount: string;
  discount_percent: string;
  discount_amount: string;
  total_amount: string;
  notes: string;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateSalePayload {
  sale_date?: string;
  customer?: number | null;
  discount_percent?: number;
  notes?: string;
  items: CreateSaleItemPayload[];
}

export interface SalesListParams {
  page?: number;
  page_size?: number;
  customer?: number;
  date_from?: string;
  date_to?: string;
  min_total?: number;
  max_total?: number;
  ordering?: string;
  search?: string;
}

export interface PaginatedSalesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Sale[];
}
