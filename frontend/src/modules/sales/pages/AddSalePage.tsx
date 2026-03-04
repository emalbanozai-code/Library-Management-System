import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';
import { useBooksList } from '@/modules/books/queries/useBookQueries';

import SaleForm from '../components/SaleForm';
import { useCreateSale, useSaleDetail, useUpdateSale } from '../queries/useSalesQueries';
import { useSaleDraftStore } from '../stores/useSaleDraftStore';
import type { CreateSalePayload } from '../types/sale';

const toDateTimeLocal = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

export default function AddSalePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: booksData, isLoading: loadingBooks } = useBooksList({ page_size: 200 });
  const { data: sale, isLoading: loadingSale, isError: saleError } = useSaleDetail(parsedId, isEditMode);

  const createSale = useCreateSale();
  const updateSale = useUpdateSale(parsedId);
  const setDraft = useSaleDraftStore((state) => state.setDraft);
  const resetDraft = useSaleDraftStore((state) => state.resetDraft);

  const books = booksData?.results || [];

  useEffect(() => {
    if (!isEditMode || !sale) {
      return;
    }

    setDraft({
      saleDate: toDateTimeLocal(sale.sale_date),
      customerId: sale.customer,
      discountPercent: Number(sale.discount_percent || 0),
      notes: sale.notes || '',
      items: sale.items.map((item) => ({
        book: item.book,
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unit_price || 0),
      })),
    });
  }, [isEditMode, sale, setDraft]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }
    resetDraft();
  }, [isEditMode, resetDraft]);

  const normalizePayload = (payload: CreateSalePayload): CreateSalePayload => ({
    ...payload,
    customer: payload.customer || null,
    discount_percent: Math.max(0, Math.min(100, Number(payload.discount_percent || 0))),
    items: payload.items.map((item) => ({
      ...item,
      unit_price: item.unit_price ?? undefined,
    })),
  });

  const handleSubmit = async (payload: CreateSalePayload) => {
    const normalizedPayload = normalizePayload(payload);

    if (isEditMode) {
      await updateSale.mutateAsync(normalizedPayload);
    } else {
      await createSale.mutateAsync(normalizedPayload);
    }

    resetDraft();
    navigate('/sales');
  };

  if (loadingBooks || (isEditMode && loadingSale)) {
    return (
      <Card>
        <CardContent>{t('sales.loadingFormData')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (saleError || !sale)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Sale not found.</p>
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Back to Sales
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Sale' : t('sales.add')}
        subtitle={isEditMode ? 'Update sale details' : t('sales.addSubtitle')}
      />
      <SaleForm
        books={books}
        onSubmit={handleSubmit}
        onViewHistory={(customerId) => navigate(`/sales/customers/${customerId}/purchase-history`)}
        saving={createSale.isPending || updateSale.isPending}
        submitLabel={isEditMode ? 'Update Sale' : 'Create Sale'}
      />
    </div>
  );
}
