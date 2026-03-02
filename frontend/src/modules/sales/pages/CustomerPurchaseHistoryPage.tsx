import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Pagination } from '@/components/ui';

import CustomerHistoryTable from '../components/CustomerHistoryTable';
import { useCustomerDetail, useCustomerHistory } from '../queries/useCustomersQueries';

export default function CustomerPurchaseHistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const customerId = Number(id);
  const [page, setPage] = useState(1);

  const { data: customer, isLoading: loadingCustomer } = useCustomerDetail(customerId, Number.isFinite(customerId));
  const { data: history, isLoading: loadingHistory, isError } = useCustomerHistory(
    customerId,
    page,
    Number.isFinite(customerId)
  );

  const totalPages = Math.max(1, Math.ceil((history?.count || 0) / 25));

  if (!Number.isFinite(customerId)) {
    return (
      <Card>
        <CardContent>{t('customers.invalidCustomer')}</CardContent>
      </Card>
    );
  }

  if (loadingCustomer || loadingHistory) {
    return (
      <Card>
        <CardContent>{t('customers.loadingHistory')}</CardContent>
      </Card>
    );
  }

  if (isError || !history || !customer) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">{t('customers.historyLoadError')}</p>
          <Button variant="outline" onClick={() => navigate('/sales')}>
            {t('customers.backToSales')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('customers.purchaseHistoryTitle')}
        subtitle={`${customer.full_name} • ${t('customers.totalSpent')}: $${Number(history.summary.total_spent).toFixed(2)}`}
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SummaryCard label={t('customers.completedSales')} value={String(history.summary.total_completed_sales)} />
          <SummaryCard label={t('customers.totalSpent')} value={`$${Number(history.summary.total_spent).toFixed(2)}`} />
          <SummaryCard
            label={t('customers.lastPurchase')}
            value={
              history.summary.last_purchase_date
                ? new Date(history.summary.last_purchase_date).toLocaleString()
                : t('customers.never')
            }
          />
        </CardContent>
      </Card>

      <CustomerHistoryTable records={history.results} />

      {history.count > 25 ? (
        <div className="flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-1 text-base font-semibold text-text-primary">{value}</p>
    </div>
  );
}
