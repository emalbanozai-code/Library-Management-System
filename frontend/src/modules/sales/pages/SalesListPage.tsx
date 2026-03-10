import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';
import useRecordManagementAccess from '@/modules/auth/hooks/useRecordManagementAccess';

import SalesTable from '../components/SalesTable';
import { useSaleFilters } from '../hooks/useSaleFilters';
import { useDeleteSale, useSalesList } from '../queries/useSalesQueries';
import { useCustomersList } from '../queries/useCustomersQueries';
import type { Sale } from '../types/sale';

export default function SalesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canManageRecords } = useRecordManagementAccess();

  const { filters, params, updateFilter, setPage, clearFilters } = useSaleFilters();
  const { data, isLoading, isError, refetch } = useSalesList(params);
  const { data: customersData } = useCustomersList({ page_size: 100 });
  const deleteSale = useDeleteSale();

  const sales = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const customers = customersData?.results || [];

  const handleDelete = async (sale: Sale) => {
    const confirmed = window.confirm('Delete this sale?');
    if (!confirmed) {
      return;
    }
    await deleteSale.mutateAsync(sale.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sales.title')}
        subtitle={t('sales.subtitle')}
        actions={[
          {
            label: t('sales.add'),
            onClick: () => navigate('/sales/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Select
              label={t('sales.customer')}
              value={filters.customer}
              options={[
                { value: '', label: t('sales.allCustomers') },
                ...customers.map((customer) => ({
                  value: String(customer.id),
                  label: customer.full_name,
                })),
              ]}
              onChange={(event) => updateFilter('customer', event.target.value)}
            />
            <Input
              label={t('sales.dateFrom')}
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
            <Input
              label={t('sales.dateTo')}
              type="datetime-local"
              value={filters.dateTo}
              onChange={(event) => updateFilter('dateTo', event.target.value)}
            />
            <Input
              label={t('sales.minTotal')}
              type="number"
              min="0"
              value={filters.minTotal}
              onChange={(event) => updateFilter('minTotal', event.target.value)}
            />
            <Input
              label={t('sales.maxTotal')}
              type="number"
              min="0"
              value={filters.maxTotal}
              onChange={(event) => updateFilter('maxTotal', event.target.value)}
            />
            <Select
              label={t('sales.orderBy')}
              value={filters.ordering}
              options={[
                { value: '-sale_date', label: t('sales.newest') },
                { value: 'sale_date', label: t('sales.oldest') },
                { value: '-total_amount', label: t('sales.highestTotal') },
                { value: 'total_amount', label: t('sales.lowestTotal') },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <Input
              label={t('sales.search')}
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
              {t('sales.refresh')}
            </Button>
            <Button variant="ghost" onClick={clearFilters}>
              {t('sales.clear')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('sales.loadError')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <SalesTable
            sales={sales}
            loading={isLoading}
            onEdit={canManageRecords ? (sale) => navigate(`/sales/${sale.id}/edit`) : undefined}
            onDelete={canManageRecords ? handleDelete : undefined}
            onViewCustomerHistory={(customerId) => navigate(`/sales/customers/${customerId}/purchase-history`)}
            canManage={canManageRecords}
          />

          {!isLoading && totalCount > 0 ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={filters.page} pageSize={filters.pageSize} totalItems={totalCount} />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
