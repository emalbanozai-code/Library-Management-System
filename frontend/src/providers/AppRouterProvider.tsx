import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { AuthGuard } from "@/providers";
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/modules/auth/index";
import NotFoundPage from "@/pages/PageNotFounded";
import { MISLayout } from "@/components";
import { Dashboard } from "@/modules/dashboard";
import { GeneralSettings, SettingsOverview, SystemSettings, UserManagement } from "@settings/index";
import { UserProfile } from "@/modules/profile";
import {
  BookCategoriesListPage,
  BookCategoryFormPage,
  BookDetailPage,
  BookFormPage,
  BooksListPage,
} from "@/modules/books";
import {
  AddSalePage,
  CustomerPurchaseHistoryPage,
  SalesListPage,
} from "@/modules/sales";
import {
  CustomerDetailPage,
  CustomerFormPage,
  CustomersListPage,
} from "@/modules/customers";
import { EmployeeDetailPage, EmployeeFormPage, EmployeesListPage } from "@/modules/employees";
import { LendingDetailPage, LendingFormPage, LendingsListPage } from "@/modules/lending";
import { ExpenseDetailPage, ExpenseFormPage, ExpensesListPage } from "@/modules/expenses";
import { SystemReportPage } from "@/modules/reports";
import { UsersPage } from "@/modules/users";

function LegacyBookDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/books/${id}` : "/books"} replace />;
}

function LegacyBookEditRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/books/${id}/edit` : "/books"} replace />;
}

function LegacyCustomerDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/customers/${id}` : "/customers"} replace />;
}

function LegacyCustomerEditRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/customers/${id}/edit` : "/customers"} replace />;
}

function LegacyCustomerHistoryRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/sales/customers/${id}/purchase-history` : "/sales"} replace />;
}

function LegacySaleEditRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/sales/${id}/edit` : "/sales"} replace />;
}

function LegacyLendingDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/lending/${id}` : "/lending"} replace />;
}

function LegacyLendingEditRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/lending/${id}/edit` : "/lending"} replace />;
}

function LegacyExpenseDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/expenses/${id}` : "/expenses"} replace />;
}

function LegacyExpenseEditRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/expenses/${id}/edit` : "/expenses"} replace />;
}

function AppRouterProvider() {
  const router = createBrowserRouter([
    // Public Website Routes (CMS)
    {
      path: "/",
      element: (
        <AuthGuard>
          <MISLayout />
        </AuthGuard>
      ),
      errorElement: <NotFoundPage />,
      children: [
        // Dashboard
        { index: true, element: <Navigate to="/mis" replace /> },
        { path: "mis", element: <Dashboard /> },
        // Settings
        { path: "settings", element: <SettingsOverview /> },
        { path: "settings/general", element: <GeneralSettings /> },
        { path: "settings/system", element: <SystemSettings /> },
        { path: "settings/users", element: <UserManagement /> },

        // Profile
        { path: "profile", element: <UserProfile /> },
        { path: "users", element: <UsersPage /> },

        // Books
        { path: "books", element: <BooksListPage /> },
        { path: "books/new", element: <BookFormPage /> },
        { path: "books/:id", element: <BookDetailPage /> },
        { path: "books/:id/edit", element: <BookFormPage /> },
        { path: "books/categories", element: <BookCategoriesListPage /> },
        { path: "books/categories/new", element: <BookCategoryFormPage /> },
        { path: "books/categories/:id/edit", element: <BookCategoryFormPage /> },

        // Sales
        { path: "sales", element: <SalesListPage /> },
        { path: "sales/new", element: <AddSalePage /> },
        { path: "sales/:id/edit", element: <AddSalePage /> },
        {
          path: "sales/customers/:id/purchase-history",
          element: <CustomerPurchaseHistoryPage />,
        },

        // Customers
        { path: "customers", element: <CustomersListPage /> },
        { path: "customers/new", element: <CustomerFormPage /> },
        { path: "customers/:id", element: <CustomerDetailPage /> },
        { path: "customers/:id/edit", element: <CustomerFormPage /> },
        

        // Employess
        { path: "employees", element: <EmployeesListPage /> },
        { path: "employees/new", element: <EmployeeFormPage /> },
        { path: "employees/:id", element: <EmployeeDetailPage /> },
        { path: "employees/:id/edit", element: <EmployeeFormPage /> },

        // Lending
        { path: "lending", element: <LendingsListPage /> },
        { path: "lending/new", element: <LendingFormPage /> },
        { path: "lending/:id", element: <LendingDetailPage /> },
        { path: "lending/:id/edit", element: <LendingFormPage /> },

        // Expenses
        { path: "expenses", element: <ExpensesListPage /> },
        { path: "expenses/new", element: <ExpenseFormPage /> },
        { path: "expenses/:id", element: <ExpenseDetailPage /> },
        { path: "expenses/:id/edit", element: <ExpenseFormPage /> },

        // Reports
        { path: "reports", element: <SystemReportPage /> },

        // Legacy aliases
        { path: "mis/reports", element: <Navigate to="/reports" replace /> },
        { path: "mis/reports/students", element: <Navigate to="/reports" replace /> },
        { path: "mis/reports/attendance", element: <Navigate to="/reports" replace /> },
        { path: "mis/reports/financial", element: <Navigate to="/reports" replace /> },
        { path: "mis/settings", element: <Navigate to="/settings" replace /> },
        { path: "mis/settings/general", element: <Navigate to="/settings/general" replace /> },
        { path: "mis/settings/system", element: <Navigate to="/settings/system" replace /> },
        { path: "mis/settings/users", element: <Navigate to="/settings/users" replace /> },
        { path: "mis/profile", element: <Navigate to="/profile" replace /> },
        { path: "mis/users", element: <Navigate to="/users" replace /> },
        { path: "library/books", element: <Navigate to="/books" replace /> },
        { path: "library/books/new", element: <Navigate to="/books/new" replace /> },
        { path: "library/books/:id", element: <LegacyBookDetailRedirect /> },
        { path: "library/books/:id/edit", element: <LegacyBookEditRedirect /> },
        { path: "library/customers", element: <Navigate to="/customers" replace /> },
        { path: "library/customers/new", element: <Navigate to="/customers/new" replace /> },
        { path: "library/customers/:id", element: <LegacyCustomerDetailRedirect /> },
        { path: "library/customers/:id/edit", element: <LegacyCustomerEditRedirect /> },
        { path: "library/users", element: <Navigate to="/users" replace /> },
        { path: "library/sales", element: <Navigate to="/sales" replace /> },
        { path: "library/sales/new", element: <Navigate to="/sales/new" replace /> },
        { path: "library/sales/:id/edit", element: <LegacySaleEditRedirect /> },
        { path: "library/lending", element: <Navigate to="/lending" replace /> },
        { path: "library/lending/new", element: <Navigate to="/lending/new" replace /> },
        { path: "library/lending/:id", element: <LegacyLendingDetailRedirect /> },
        { path: "library/lending/:id/edit", element: <LegacyLendingEditRedirect /> },
        { path: "library/expenses", element: <Navigate to="/expenses" replace /> },
        { path: "library/expenses/new", element: <Navigate to="/expenses/new" replace /> },
        { path: "library/expenses/:id", element: <LegacyExpenseDetailRedirect /> },
        { path: "library/expenses/:id/edit", element: <LegacyExpenseEditRedirect /> },
        {
          path: "library/customers/:id/purchase-history",
          element: <LegacyCustomerHistoryRedirect />,
        },
      ],
    },

    // MIS Auth Routes (Public)
    {
      path: "/auth/login",
      element: <LoginPage />,
    },
    {
      path: "/auth/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/auth/reset-password",
      element: <ResetPasswordPage />,
    },
    {
      path: "/auth/verify-email/:token",
      element: <VerifyEmailPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouterProvider;
