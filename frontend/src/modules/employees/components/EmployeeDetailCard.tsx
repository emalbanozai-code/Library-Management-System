import type { ReactNode } from 'react';

import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';

import EmployeeStatusBadge from './EmployeeStatusBadge';
import type { Employee } from '../types/employee';

interface EmployeeDetailCardProps {
  employee: Employee;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onResetPassword: () => void;
  deleting?: boolean;
  statusUpdating?: boolean;
  resettingPassword?: boolean;
}

export default function EmployeeDetailCard({
  employee,
  onBack,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  deleting = false,
  statusUpdating = false,
  resettingPassword = false,
}: EmployeeDetailCardProps) {
  const workDays = employee.work_days.join(', ');

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            {employee.picture ? (
              <img
                src={employee.picture}
                alt={`${employee.first_name} ${employee.last_name}`}
                className="h-12 w-12 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                <span className="text-lg font-semibold text-primary">
                  {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <span>{employee.first_name} {employee.last_name}</span>
            </div>
          </div>
        }
        subtitle={`${employee.email} • @${employee.username}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outline" loading={statusUpdating} onClick={onToggleStatus}>
              {employee.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="outline" loading={resettingPassword} onClick={onResetPassword}>
              Reset Password
            </Button>
            <Button variant="danger" loading={deleting} onClick={onDelete}>
              Delete
            </Button>
          </div>
        }
      />
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label="First Name" value={employee.first_name} />
          <DetailItem label="Last Name" value={employee.last_name} />
          <DetailItem label="Father Name" value={employee.father_name} />
          <DetailItem label="Date of Birth" value={new Date(employee.date_of_birth).toLocaleDateString()} />
          <DetailItem label="Phone" value={employee.phone} />
          <DetailItem label="Email" value={employee.email} />
          <DetailItem label="Username" value={employee.username} />
          <DetailItem label="Salary" value={`$${Number(employee.salary).toFixed(2)}`} />
          <DetailItem label="Join Date" value={new Date(employee.join_date).toLocaleDateString()} />
          <DetailItem label="Membership Type" value={<Badge variant="primary">{employee.membership_type}</Badge>} />
          <DetailItem label="Role" value={<Badge variant="info">{employee.role}</Badge>} />
          <DetailItem label="Status" value={<EmployeeStatusBadge status={employee.status} />} />
          <DetailItem label="Work Days" value={workDays || 'N/A'} />
          <DetailItem label="Created At" value={new Date(employee.created_at).toLocaleString()} />
          <DetailItem label="Updated At" value={new Date(employee.updated_at).toLocaleString()} />
        </div>
        <div className="mt-5 rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">Address</p>
          <p className="text-sm text-text-secondary">{employee.address}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="mt-1 text-sm text-text-primary">{value}</div>
    </div>
  );
}
