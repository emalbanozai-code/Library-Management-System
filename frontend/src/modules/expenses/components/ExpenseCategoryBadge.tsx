import { Badge } from '@/components/ui';

import type { ExpenseCategory } from '../types/expense';

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategory;
}

const labelMap: Record<ExpenseCategory, string> = {
  salary: 'Salary',
  electricity: 'Electricity',
  rent: 'Rent',
  water: 'Water',
  internet: 'Internet',
  maintenance: 'Maintenance',
  supplies: 'Supplies',
  other: 'Other',
};

const variantMap: Record<ExpenseCategory, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'info' | 'outline'> =
  {
    salary: 'primary',
    electricity: 'warning',
    rent: 'info',
    water: 'secondary',
    internet: 'primary',
    maintenance: 'danger',
    supplies: 'success',
    other: 'default',
  };

export default function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  return <Badge variant={variantMap[category]}>{labelMap[category]}</Badge>;
}

