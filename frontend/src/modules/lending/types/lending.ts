export type LendingStatus = 'returned' | 'not_returned';
export type LendingPaymentStatus = 'paid' | 'unpaid';
export type LendingPaymentMethod = 'cash' | 'card' | 'transfer' | 'online' | 'other';

export interface Lending {
  id: number;
  book: number;
  book_title: string;
  book_isbn: string;
  customer: number;
  customer_name: string;
  start_date: string;
  end_date: string;
  rent_price: string;
  status: LendingStatus;
  fine_per_day: string;
  late_days: number;
  fine_amount: string;
  payment_status: LendingPaymentStatus;
  payment_method: LendingPaymentMethod;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LendingFormValues {
  book: number;
  customer: number;
  start_date: string;
  end_date: string;
  rent_price: number;
  status: LendingStatus;
  fine_per_day: number;
  payment_status: LendingPaymentStatus;
  payment_method: LendingPaymentMethod;
}

export interface ReturnLendingPayload {
  payment_status?: LendingPaymentStatus;
  payment_method?: LendingPaymentMethod;
}

export interface LendingListParams {
  page?: number;
  page_size?: number;
  book?: number;
  customer?: number;
  status?: LendingStatus;
  payment_status?: LendingPaymentStatus;
  payment_method?: LendingPaymentMethod;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  min_rent_price?: number;
  max_rent_price?: number;
  min_fine_amount?: number;
  max_fine_amount?: number;
  late_only?: boolean;
  overdue_only?: boolean;
  search?: string;
  ordering?: string;
}

export interface PaginatedLendingsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lending[];
}

