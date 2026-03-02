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
import { GeneralSettings, SettingsOverview, UserManagement } from "@settings/index";
import { UserProfile } from "@/modules/profile";
import { BookDetailPage, BookFormPage, BooksListPage } from "@/modules/books";
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
        { index: true, element: <Dashboard /> },
        // Settings
        { path: "settings", element: <SettingsOverview /> },
        { path: "settings/general", element: <GeneralSettings /> },
        { path: "settings/users", element: <UserManagement /> },

        // Profile
        { path: "profile", element: <UserProfile /> },

        // Books
        { path: "books", element: <BooksListPage /> },
        { path: "books/new", element: <BookFormPage /> },
        { path: "books/:id", element: <BookDetailPage /> },
        { path: "books/:id/edit", element: <BookFormPage /> },

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

        // Legacy aliases
        { path: "library/books", element: <Navigate to="/books" replace /> },
        { path: "library/books/new", element: <Navigate to="/books/new" replace /> },
        { path: "library/books/:id", element: <LegacyBookDetailRedirect /> },
        { path: "library/books/:id/edit", element: <LegacyBookEditRedirect /> },
        { path: "library/customers", element: <Navigate to="/customers" replace /> },
        { path: "library/customers/new", element: <Navigate to="/customers/new" replace /> },
        { path: "library/customers/:id", element: <LegacyCustomerDetailRedirect /> },
        { path: "library/customers/:id/edit", element: <LegacyCustomerEditRedirect /> },
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
