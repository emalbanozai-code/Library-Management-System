import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  BookMarked,
  Handshake,
  RefreshCw,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';

import { DashboardCard, PageHeader } from '@/components';
import apiClient from '@/lib/api';
import { Button, Card, CardContent } from '@/components/ui';

interface DashboardSummary {
  books: {
    total: number;
    in_stock: number;
    out_of_stock: number;
  };
  sales: {
    count: number;
    total_amount: string;
  };
  employees: {
    total: number;
    active: number;
  };
  customers: {
    total: number;
    active: number;
  };
  lending: {
    total: number;
    returned: number;
    not_returned: number;
  };
  expenses: {
    count: number;
    total_amount: string;
  };
}

const toCurrency = (amount: number | string) => `Af ${Number(amount || 0).toFixed(2)}`;

const toPercent = (value: number, total: number) => {
  if (!total) {
    return 0;
  }
  return Math.round((value / total) * 100);
};

export default function Dashboard() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => apiClient.get<DashboardSummary>('/core/dashboard/summary').then((response) => response.data),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading dashboard...</CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">Failed to load dashboard summary.</p>
          <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalSalesAmount = Number(data.sales.total_amount || 0);
  const totalExpensesAmount = Number(data.expenses.total_amount || 0);
  const netAmount = totalSalesAmount - totalExpensesAmount;

  const booksInStockPercent = toPercent(data.books.in_stock, data.books.total);
  const activeEmployeesPercent = toPercent(data.employees.active, data.employees.total);
  const activeCustomersPercent = toPercent(data.customers.active, data.customers.total);
  const lendingReturnedPercent = toPercent(data.lending.returned, data.lending.total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of books, sales, employees, customers, lending, and expenses"
        actions={[
          {
            label: isFetching ? 'Refreshing...' : 'Refresh',
            icon: <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />,
            variant: 'outline',
            onClick: () => refetch(),
          },
        ]}
      />

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl">
        <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
          <SummaryBlock label="Total Sales" value={toCurrency(totalSalesAmount)} />
          <SummaryBlock label="Total Expenses" value={toCurrency(totalExpensesAmount)} />
          <SummaryBlock
            label="Net Balance"
            value={toCurrency(netAmount)}
            valueClassName={netAmount >= 0 ? 'text-emerald-300' : 'text-rose-300'}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Books"
          value={data.books.total}
          icon={BookMarked}
          color="primary"
          subtitle={`${data.books.in_stock} in stock | ${data.books.out_of_stock} out of stock`}
        />
        <DashboardCard
          title="Sales"
          value={data.sales.count}
          icon={ShoppingCart}
          color="success"
          subtitle={`Total sales amount: ${toCurrency(data.sales.total_amount)}`}
        />
        <DashboardCard
          title="Employees"
          value={data.employees.total}
          icon={Briefcase}
          color="info"
          subtitle={`${data.employees.active} active`}
        />
        <DashboardCard
          title="Customers"
          value={data.customers.total}
          icon={Users}
          color="warning"
          subtitle={`${data.customers.active} active`}
        />
        <DashboardCard
          title="Lending"
          value={data.lending.total}
          icon={Handshake}
          color="primary"
          subtitle={`${data.lending.not_returned} not returned | ${data.lending.returned} returned`}
        />
        <DashboardCard
          title="Expenses"
          value={data.expenses.count}
          icon={Wallet}
          color="error"
          subtitle={`Total expenses: ${toCurrency(data.expenses.total_amount)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Operations Health</h3>
            <HealthRow label="Books In Stock" value={booksInStockPercent} />
            <HealthRow label="Active Employees" value={activeEmployeesPercent} />
            <HealthRow label="Active Customers" value={activeCustomersPercent} />
            <HealthRow label="Returned Lendings" value={lendingReturnedPercent} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-semibold text-text-primary">Quick Insights</h3>
            <InsightRow label="Current Open Lendings" value={String(data.lending.not_returned)} />
            <InsightRow label="Books Out Of Stock" value={String(data.books.out_of_stock)} />
            <InsightRow label="Average Sale Value" value={toCurrency(data.sales.count ? totalSalesAmount / data.sales.count : 0)} />
            <InsightRow label="Average Expense Value" value={toCurrency(data.expenses.count ? totalExpensesAmount / data.expenses.count : 0)} />
          </CardContent>
        </Card>
      </div>
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
    <div className="rounded-lg border border-white/15 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-300">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text-primary">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}
