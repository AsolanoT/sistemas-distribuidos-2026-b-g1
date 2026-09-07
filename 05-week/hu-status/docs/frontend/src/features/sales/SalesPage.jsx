import { useState } from 'react';
import { useResource } from '../../api/useResource';
import { formatDateTime, formatMoney } from '../../api/format';
import PageHeader from '../../components/PageHeader';
import { Alert, Button, Card, EmptyState, TableSkeleton } from '../../components/ui';
import { listActiveCustomers } from '../customers/api';
import { listActiveProducts } from '../products/api';
import NewSaleCard from './NewSaleCard';
import SaleDetailModal from './SaleDetailModal';
import { listSales } from './api';

async function loadSalesScreen() {
  const [sales, customers, products] = await Promise.all([
    listSales(),
    listActiveCustomers(),
    listActiveProducts(),
  ]);
  return { sales, customers, products };
}

export default function SalesPage() {
  const { data, error, loading, reload } = useResource(loadSalesScreen);
  const [detailId, setDetailId] = useState(null);

  const sales = data?.sales ?? [];
  const customers = data?.customers ?? [];
  const products = data?.products ?? [];

  // Only the very first load takes over the screen. Refreshing after a sale
  // must not unmount the form, or the confirmation the person just earned
  // would be thrown away with it.
  const initialLoading = loading && !data;

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="Register a sale and review what has been sold."
      />

      {initialLoading ? (
        <Card><TableSkeleton /></Card>
      ) : error ? (
        <Card>
          <div className="stack">
            <Alert tone="error" title="Could not load the sales screen.">
              {error.message}
            </Alert>
            <div className="row-end">
              <Button onClick={reload}>Try again</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="stack">
          {customers.length === 0 || products.length === 0 ? (
            <Alert tone="info">
              {customers.length === 0
                ? 'There are no active customers yet — create one before registering a sale.'
                : 'There are no active products yet — add one before registering a sale.'}
            </Alert>
          ) : null}

          <NewSaleCard customers={customers} products={products} onRegistered={reload} />

          <Card title="History" bodyless>
            {sales.length === 0 ? (
              <EmptyState title="No sales registered yet">
                The first sale you register will show up here.
              </EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th className="right">Lines</th>
                      <th className="right">Total</th>
                      <th className="right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td><span className="num">{formatDateTime(sale.date)}</span></td>
                        <td className="cell-strong">{sale.customerName}</td>
                        <td className="right"><span className="num">{sale.items.length}</span></td>
                        <td className="right"><span className="num">{formatMoney(sale.total)}</span></td>
                        <td className="right">
                          <Button variant="ghost" size="sm" onClick={() => setDetailId(sale.id)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {detailId ? (
        <SaleDetailModal saleId={detailId} onClose={() => setDetailId(null)} />
      ) : null}
    </>
  );
}
