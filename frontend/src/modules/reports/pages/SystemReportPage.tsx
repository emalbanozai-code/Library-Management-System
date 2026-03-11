import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Printer, RefreshCw } from 'lucide-react';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input } from '@/components/ui';
import apiClient from '@/lib/api';

interface SystemReportResponse {
  period: {
    start_date: string;
    end_date: string;
  };
  overview: {
    books_total: number;
    employees_total: number;
    customers_total: number;
    lendings_total: number;
    sales_total: number;
    expenses_total: number;
  };
  financial: {
    sales_total_amount: string;
    expenses_total_amount: string;
    net_amount: string;
  };
  lending: {
    total_in_period: number;
    returned_in_period: number;
    not_returned_in_period: number;
    overdue_now: number;
  };
  top_books_by_lending: Array<{
    book__id: number;
    book__title: string | null;
    total_lendings: number;
  }>;
  top_expense_categories: Array<{
    category: string | null;
    total_amount: string;
    entries: number;
  }>;
}

interface DateRangeState {
  start_date: string;
  end_date: string;
}

const toCurrency = (amount: number | string) => `Af ${Number(amount || 0).toFixed(2)}`;

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = (): DateRangeState => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 29);

  return {
    start_date: formatDateForInput(startDate),
    end_date: formatDateForInput(endDate),
  };
};

export default function SystemReportPage() {
  const initialRange = useMemo(() => getDefaultDateRange(), []);
  const [draftRange, setDraftRange] = useState<DateRangeState>(initialRange);
  const [appliedRange, setAppliedRange] = useState<DateRangeState>(initialRange);
  const [dateError, setDateError] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['reports', 'system', appliedRange.start_date, appliedRange.end_date],
    queryFn: () =>
      apiClient
        .get<SystemReportResponse>('/core/reports/system', {
          params: appliedRange,
        })
        .then((response) => response.data),
  });
  const handlePrint = () => {
    window.print();
  };

  const applyDateFilter = () => {
    if (draftRange.end_date < draftRange.start_date) {
      setDateError('End date must be greater than or equal to start date.');
      return;
    }

    setDateError(null);
    setAppliedRange(draftRange);
  };

  const overviewCards = data
    ? [
        { label: 'Books', value: data.overview.books_total },
        { label: 'Sales', value: data.overview.sales_total },
        { label: 'Employees', value: data.overview.employees_total },
        { label: 'Customers', value: data.overview.customers_total },
        { label: 'Lending', value: data.overview.lendings_total },
        { label: 'Expenses', value: data.overview.expenses_total },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Reports"
        subtitle="Consolidated report for books, sales, employees, customers, lending, and expenses."
        actions={[
          {
            label: isFetching ? 'Refreshing...' : 'Refresh',
            icon: <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />,
            variant: 'outline',
            onClick: () => refetch(),
          },
          {
            label: 'Print',
            icon: <Printer className="h-4 w-4" />,
            variant: 'outline',
            onClick: handlePrint,
          },
        ]}
      />

      <Card className="border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
        <CardContent className="mt-0 space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <BarChart3 className="h-4 w-4" />
            <span>Filter report period</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <Input
              type="date"
              label="Start date"
              value={draftRange.start_date}
              onChange={(event) =>
                setDraftRange((current) => ({
                  ...current,
                  start_date: event.target.value,
                }))
              }
            />
            <Input
              type="date"
              label="End date"
              value={draftRange.end_date}
              onChange={(event) =>
                setDraftRange((current) => ({
                  ...current,
                  end_date: event.target.value,
                }))
              }
            />
            <Button variant="secondary" onClick={applyDateFilter}>
              Apply
            </Button>
          </div>
          {dateError && <p className="text-sm text-rose-300">{dateError}</p>}
          {data && (
            <p className="text-xs text-slate-300">
              Showing data from {data.period.start_date} to {data.period.end_date}
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent>Loading report...</CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="space-y-3">
            <p className="text-sm text-error">Failed to load report data.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && (
        <>
          <Card className="overflow-hidden border-0 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-lg">
            <CardContent className="mt-0 grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
              <SummaryBlock label="Sales Total" value={toCurrency(data.financial.sales_total_amount)} />
              <SummaryBlock label="Expenses Total" value={toCurrency(data.financial.expenses_total_amount)} />
              <SummaryBlock
                label="Net Amount"
                value={toCurrency(data.financial.net_amount)}
                valueClassName={Number(data.financial.net_amount) >= 0 ? 'text-emerald-100' : 'text-rose-200'}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overviewCards.map((item) => (
              <Card key={item.label} className="border border-border/60 bg-card">
                <CardContent className="mt-0 p-4">
                  <p className="text-sm text-text-secondary">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="mt-0 space-y-3 p-4">
                <h3 className="text-base font-semibold text-text-primary">Lending Status</h3>
                <InfoRow label="Total In Period" value={data.lending.total_in_period} />
                <InfoRow label="Returned In Period" value={data.lending.returned_in_period} />
                <InfoRow label="Not Returned In Period" value={data.lending.not_returned_in_period} />
                <InfoRow label="Overdue Now" value={data.lending.overdue_now} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="mt-0 space-y-3 p-4">
                <h3 className="text-base font-semibold text-text-primary">Top Books By Lending</h3>
                {data.top_books_by_lending.length === 0 ? (
                  <p className="text-sm text-text-secondary">No lending records in selected period.</p>
                ) : (
                  <div className="space-y-2">
                    {data.top_books_by_lending.map((book) => (
                      <div
                        key={book.book__id}
                        className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                      >
                        <span className="text-sm font-medium text-text-primary">
                          {book.book__title || 'Unknown book'}
                        </span>
                        <span className="text-sm font-semibold text-primary">{book.total_lendings}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="mt-0 space-y-3 p-4">
              <h3 className="text-base font-semibold text-text-primary">Top Expense Categories</h3>
              {data.top_expense_categories.length === 0 ? (
                <p className="text-sm text-text-secondary">No expenses in selected period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-text-secondary">
                        <th className="px-2 py-2 font-medium">Category</th>
                        <th className="px-2 py-2 font-medium">Entries</th>
                        <th className="px-2 py-2 font-medium">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.top_expense_categories.map((category) => (
                        <tr key={`${category.category || 'uncategorized'}-${category.entries}`} className="border-b border-border/60">
                          <td className="px-2 py-2 text-text-primary">{category.category || 'Uncategorized'}</td>
                          <td className="px-2 py-2 text-text-primary">{category.entries}</td>
                          <td className="px-2 py-2 font-medium text-text-primary">{toCurrency(category.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryBlock({
  label,
  value,
  valueClassName = 'text-white',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-100">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}
