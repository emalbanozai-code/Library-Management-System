import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import { useBooksList } from '@/modules/books/queries/useBookQueries';
import { useCustomersList } from '@/modules/customers/queries/useCustomerQueries';

import LendingForm from '../components/LendingForm';
import { useCreateLending, useLendingDetail, useUpdateLending } from '../queries/useLendingQueries';
import { useLendingDraftStore } from '../stores/useLendingDraftStore';
import type { LendingFormValues } from '../types/lending';

const getToday = () => new Date().toISOString().slice(0, 10);

export default function LendingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: booksData, isLoading: loadingBooks } = useBooksList({ page_size: 200 });
  const { data: customersData, isLoading: loadingCustomers } = useCustomersList({ page_size: 200 });
  const { data: lending, isLoading: loadingLending, isError: lendingError } = useLendingDetail(parsedId, isEditMode);
  const createLending = useCreateLending();
  const updateLending = useUpdateLending(parsedId);

  const setDraft = useLendingDraftStore((state) => state.setDraft);
  const resetDraft = useLendingDraftStore((state) => state.resetDraft);

  const books = booksData?.results || [];
  const customers = customersData?.results || [];

  useEffect(() => {
    if (isEditMode && lending) {
      setDraft({
        book: lending.book,
        customer: lending.customer,
        start_date: lending.start_date,
        end_date: lending.end_date,
        rent_price: Number(lending.rent_price),
        status: lending.status,
        fine_per_day: Number(lending.fine_per_day),
        payment_status: lending.payment_status,
        payment_method: lending.payment_method,
      });
      return;
    }

    if (!isEditMode) {
      setDraft({
        book: 0,
        customer: 0,
        start_date: getToday(),
        end_date: getToday(),
        rent_price: 0,
        status: 'not_returned',
        fine_per_day: 0,
        payment_status: 'unpaid',
        payment_method: 'cash',
      });
    }
  }, [isEditMode, lending, setDraft]);

  useEffect(() => {
    return () => {
      resetDraft();
    };
  }, [resetDraft]);

  const handleSubmit = async (values: LendingFormValues) => {
    if (isEditMode) {
      await updateLending.mutateAsync(values);
      navigate(`/lending/${parsedId}`);
      return;
    }

    const created = await createLending.mutateAsync(values);
    navigate(`/lending/${created.id}`);
  };

  if (loadingBooks || loadingCustomers || (isEditMode && loadingLending)) {
    return (
      <Card>
        <CardContent>Loading form data...</CardContent>
      </Card>
    );
  }

  if (isEditMode && (lendingError || !lending)) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">Lending not found.</p>
          <Button variant="outline" onClick={() => navigate('/lending')}>
            Back to Lending
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Lending' : 'Add Lending'}
        subtitle={isEditMode ? 'Update lending details' : 'Create a new lending record'}
      />

      <LendingForm
        books={books}
        customers={customers}
        onSubmit={handleSubmit}
        saving={createLending.isPending || updateLending.isPending}
        submitLabel={isEditMode ? 'Update Lending' : 'Create Lending'}
      />
    </div>
  );
}

