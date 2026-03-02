import { Badge } from '@/components/ui';

import type { EmployeeStatus } from '../types/employee';

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

export default function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return (
    <Badge variant={status === 'active' ? 'success' : 'error'} size="sm" dot>
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}
