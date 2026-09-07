import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginScreen from './features/auth/LoginScreen';
import { SessionProvider, useSession } from './features/auth/SessionContext';
import { canAccess, defaultPathFor } from './features/auth/roles';
import CustomersPage from './features/customers/CustomersPage';
import ProductsPage from './features/products/ProductsPage';
import StockLookupPage from './features/products/StockLookupPage';
import SalesPage from './features/sales/SalesPage';
import SummaryPage from './features/dashboard/SummaryPage';

/** Signed-in shell: sidebar plus whichever module is routed. */
function AppShell() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * Route guard. The nav only offers what the role may see (AC2–AC4); this stops
 * a hand-typed URL from getting around that, sending the user to their own
 * landing module instead.
 */
function RequireModule({ path, children }) {
  const { user } = useSession();
  if (!canAccess(user.role, path)) {
    return <Navigate to={defaultPathFor(user.role)} replace />;
  }
  return children;
}

function Router() {
  const { user } = useSession();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/summary"
          element={
            <RequireModule path="/summary">
              <SummaryPage />
            </RequireModule>
          }
        />
        <Route
          path="/customers"
          element={
            <RequireModule path="/customers">
              <CustomersPage />
            </RequireModule>
          }
        />
        <Route
          path="/products"
          element={
            <RequireModule path="/products">
              <ProductsPage />
            </RequireModule>
          }
        />
        <Route
          path="/stock"
          element={
            <RequireModule path="/stock">
              <StockLookupPage />
            </RequireModule>
          }
        />
        <Route
          path="/sales"
          element={
            <RequireModule path="/sales">
              <SalesPage />
            </RequireModule>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={defaultPathFor(user.role)} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </SessionProvider>
  );
}
