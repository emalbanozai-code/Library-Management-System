export type CustomerGender = 'male' | 'female' | 'other';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  photo: string | null;
  photo_url: string | null;
  phone: string;
  email: string;
  address: string;
  gender: CustomerGender;
  total_purchases: string;
  discount_percent: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormValues {
  first_name: string;
  last_name: string;
  photo?: File | null;
  phone: string;
  email: string;
  address: string;
  gender: CustomerGender;
  total_purchases: number;
  discount_percent: number;
  is_active: boolean;
}

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  gender?: CustomerGender;
  is_active?: boolean;
  min_total_purchases?: number;
  max_total_purchases?: number;
  ordering?: string;
}

export interface PaginatedCustomersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

