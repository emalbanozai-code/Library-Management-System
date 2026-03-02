export type ExpenseCategory =
  | 'salary'
  | 'electricity'
  | 'rent'
  | 'water'
  | 'internet'
  | 'maintenance'
  | 'supplies'
  | 'other';

export interface Expense {
  id: number;
  title: string;
  description: string;
  amount: string;
  payment_date: string;
  paid_by: number;
  paid_by_name: string;
  paid_by_username: string;
  category: ExpenseCategory;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormValues {
  title: string;
  description: string;
  amount: number;
  payment_date: string;
  paid_by: number;
  category: ExpenseCategory;
}

export interface ExpenseListParams {
  page?: number;
  page_size?: number;
  search?: string;
  paid_by?: number;
  category?: ExpenseCategory;
  payment_date_from?: string;
  payment_date_to?: string;
  min_amount?: number;
  max_amount?: number;
  ordering?: string;
}

export interface PaginatedExpensesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Expense[];
}

export const expenseCategoryOptions: Array<{ label: string; value: ExpenseCategory }> = [
  { label: 'Salary', value: 'salary' },
  { label: 'Electricity', value: 'electricity' },
  { label: 'Rent', value: 'rent' },
  { label: 'Water', value: 'water' },
  { label: 'Internet', value: 'internet' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Supplies', value: 'supplies' },
  { label: 'Other', value: 'other' },
];

