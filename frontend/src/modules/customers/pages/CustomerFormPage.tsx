import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import useRecordManagementAccess from '@/modules/auth/hooks/useRecordManagementAccess';

import CustomerForm from '../components/CustomerForm';
import { useCreateCustomer, useCustomerDetail, useUpdateCustomer } from '../queries/useCustomerQueries';
import type { CustomerFormValues } from '../types/customer';

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canManageRecords } = useRecordManagementAccess();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  if (isEditMode && !canManageRecords) {
    return <Navigate to={Number.isFinite(parsedId) ? `/customers/${parsedId}` : '/customers'} replace />;
  }

  const { data: customer, isLoading: isLoadingCustomer, isError } = useCustomerDetail(parsedId, isEditMode);
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer(parsedId);

  const initialValues: (Partial<CustomerFormValues> & { photo_url?: string | null }) | undefined = customer
    ? {
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        gender: customer.gender,
        total_purchases: Number(customer.total_purchases),
        discount_percent: Number(customer.discount_percent),
        is_active: customer.is_active,
        photo_url: customer.photo_url,
      }
    : undefined;

  const handleSubmit = async (values: CustomerFormValues) => {
    if (isEditMode) {
      await updateCustomerMutation.mutateAsync(values);
      navigate(`/customers/${parsedId}`);
      return;
    }

    const createdCustomer = await createCustomerMutation.mutateAsync(values);
    navigate(`/customers/${createdCustomer.id}`);
  };

  if (isEditMode && isLoadingCustomer) {
    return (
      <Card>
        <CardContent>Loading customer...</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !customer)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Customer not found.</p>
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
        title={isEditMode ? 'Edit Customer' : 'Add Customer'}
        subtitle={isEditMode ? 'Update customer details' : 'Create a new customer profile'}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/customers'),
          },
        ]}
      />

      <CustomerForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/customers')}
        isSubmitting={createCustomerMutation.isPending || updateCustomerMutation.isPending}
        submitLabel={isEditMode ? 'Update Customer' : 'Create Customer'}
      />
    </div>
  );
}
