import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import CustomerDetailCard from '../components/CustomerDetailCard';
import { useCustomerDetail, useDeleteCustomer } from '../queries/useCustomerQueries';

export default function CustomerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const customerId = Number(id);
  const { data: customer, isLoading, isError } = useCustomerDetail(
    customerId,
    Number.isFinite(customerId)
  );
  const deleteCustomerMutation = useDeleteCustomer();

  const handleDelete = async () => {
    if (!customer) {
      return;
    }

    const confirmed = window.confirm(`Delete "${customer.full_name}"?`);
    if (!confirmed) {
      return;
    }

    await deleteCustomerMutation.mutateAsync(customer.id);
    navigate('/customers');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading customer details...</CardContent>
      </Card>
    );
  }

  if (isError || !customer) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Unable to load customer details.</p>
          <Button variant="outline" onClick={() => navigate('/customers')}>
            Back to Customers
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Details"
        subtitle="View and manage a single customer"
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/customers'),
          },
          {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/customers/${customer.id}/edit`),
          },
        ]}
      />

      <CustomerDetailCard
        customer={customer}
        onBack={() => navigate('/customers')}
        onEdit={() => navigate(`/customers/${customer.id}/edit`)}
        onDelete={handleDelete}
        deleting={deleteCustomerMutation.isPending}
      />
    </div>
  );
}

