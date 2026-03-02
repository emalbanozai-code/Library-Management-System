import { Badge } from '@/components/ui';

import type { Lending, LendingPaymentStatus } from '../types/lending';

interface LendingStatusBadgeProps {
  status: Lending['status'];
}

interface PaymentStatusBadgeProps {
  status: LendingPaymentStatus;
}

export function LendingStatusBadge({ status }: LendingStatusBadgeProps) {
  if (status === 'returned') {
    return <Badge variant="success">Returned</Badge>;
  }
  return <Badge variant="warning">Not Returned</Badge>;
}

export function LendingPaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  if (status === 'paid') {
    return <Badge variant="success">Paid</Badge>;
  }
  return <Badge variant="warning">Unpaid</Badge>;
}

