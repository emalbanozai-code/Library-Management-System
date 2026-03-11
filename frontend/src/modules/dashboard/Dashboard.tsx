import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  BookMarked,
  Handshake,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
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
        subtitle="Real-time operational and financial snapshot"
        actions={[
          {
            label: isFetching ? 'Refreshing...' : 'Refresh',
            icon: <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />,
            variant: 'outline',
            onClick: () => refetch(),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total Sales"
          value={toCurrency(totalSalesAmount)}
          icon={ShoppingCart}
          tone="success"
        />
        <SummaryCard
          label="Total Expenses"
          value={toCurrency(totalExpensesAmount)}
          icon={Wallet}
          tone="error"
        />
        <SummaryCard
          label="Net Balance"
          value={toCurrency(netAmount)}
          icon={netAmount >= 0 ? TrendingUp : TrendingDown}
          tone={netAmount >= 0 ? 'success' : 'error'}
        />
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 p-4 text-xs text-text-secondary md:grid-cols-4">
          <MetaPill label="Books In Stock" value={`${booksInStockPercent}%`} />
          <MetaPill label="Active Employees" value={`${activeEmployeesPercent}%`} />
          <MetaPill label="Active Customers" value={`${activeCustomersPercent}%`} />
          <MetaPill label="Returned Lendings" value={`${lendingReturnedPercent}%`} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Books"
          value={data.books.total}
          subtitle={`${data.books.in_stock} in stock | ${data.books.out_of_stock} out`}
          icon={BookMarked}
          color="primary"
        />
        <DashboardCard
          title="Sales"
          value={data.sales.count}
          subtitle={`Sales volume: ${toCurrency(data.sales.total_amount)}`}
          icon={ShoppingCart}
          color="success"
        />
        <DashboardCard
          title="Employees"
          value={data.employees.total}
          subtitle={`${data.employees.active} active staff`}
          icon={Briefcase}
          color="info"
        />
        <DashboardCard
          title="Customers"
          value={data.customers.total}
          subtitle={`${data.customers.active} active readers`}
          icon={Users}
          color="warning"
        />
        <DashboardCard
          title="Lending"
          value={data.lending.total}
          subtitle={`${data.lending.not_returned} open | ${data.lending.returned} returned`}
          icon={Handshake}
          color="primary"
        />
        <DashboardCard
          title="Expenses"
          value={data.expenses.count}
          subtitle={`Total expenses: ${toCurrency(data.expenses.total_amount)}`}
          icon={Wallet}
          color="error"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">Operations Health</h3>
              <span className="text-xs text-text-secondary">Target 100%</span>
            </div>
            <HealthRow label="Books In Stock" value={booksInStockPercent} />
            <HealthRow label="Active Employees" value={activeEmployeesPercent} />
            <HealthRow label="Active Customers" value={activeCustomersPercent} />
            <HealthRow label="Returned Lendings" value={lendingReturnedPercent} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <h3 className="text-base font-semibold text-text-primary">Performance Mix</h3>
            <RingStat label="Open Lendings" value={data.lending.not_returned} total={data.lending.total} />
            <RingStat label="Out of Stock" value={data.books.out_of_stock} total={data.books.total} />
            <RingStat label="Net Margin" value={netAmount} total={totalSalesAmount || 1} currency />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-text-primary">Quick Insights</h3>
            <InsightRow label="Current Open Lendings" value={String(data.lending.not_returned)} />
            <InsightRow label="Books Out Of Stock" value={String(data.books.out_of_stock)} />
            <InsightRow
              label="Average Sale Value"
              value={toCurrency(data.sales.count ? totalSalesAmount / data.sales.count : 0)}
            />
            <InsightRow
              label="Average Expense Value"
              value={toCurrency(data.expenses.count ? totalExpensesAmount / data.expenses.count : 0)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-text-primary">Today Focus</h3>
            <FocusRow label="Stock Refill Needed" value={data.books.out_of_stock > 0 ? 'Yes' : 'No'} />
            <FocusRow label="Customer Engagement" value={`${activeCustomersPercent}% active`} />
            <FocusRow label="Staff Availability" value={`${activeEmployeesPercent}% active`} />
            <FocusRow label="Revenue Health" value={netAmount >= 0 ? 'Positive' : 'Negative'} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingCart;
  tone: 'success' | 'error';
}) {
  const toneClass = tone === 'success' ? 'bg-success-soft text-success' : 'bg-error-soft text-error';
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
          </div>
          <div className={`rounded-xl p-3 ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-border bg-card px-3 py-1 text-center">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <span className="ml-2 text-xs font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text-primary">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
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

function FocusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function RingStat({
  label,
  value,
  total,
  currency = false,
}: {
  label: string;
  value: number;
  total: number;
  currency?: boolean;
}) {
  const safeTotal = total || 1;
  const percent = Math.max(0, Math.min(100, Math.round((Number(value) / safeTotal) * 100)));
  const displayValue = currency ? toCurrency(value) : String(value);
  const gradient = `conic-gradient(#22c55e ${percent * 3.6}deg, #e5e7eb 0deg)`;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-3 py-3">
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-base font-semibold text-text-primary">{displayValue}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full" style={{ background: gradient }} aria-label={`${label} ${percent}%`} />
        <span className="text-sm font-semibold text-text-primary">{percent}%</span>
      </div>
    </div>
  );
}
