import { useResource } from '../../api/useResource';
import { formatDateTime, formatMoney } from '../../api/format';
import PageHeader from '../../components/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Stat,
  StockBadge,
  TableSkeleton,
} from '../../components/ui';
import { listCustomers } from '../customers/api';
import { listProducts } from '../products/api';
import { listSales } from '../sales/api';

async function loadSummary() {
  const [customers, products, sales] = await Promise.all([
    listCustomers(),
    listProducts(),
    listSales(),
  ]);
  return { customers, products, sales };
}

export default function SummaryPage() {
  const { data, error, loading, reload } = useResource(loadSummary);

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Summary" subtitle="Where the business stands right now." />
        <Card><TableSkeleton /></Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Summary" subtitle="Where the business stands right now." />
        <Card>
          <div className="stack">
            <Alert tone="error" title="Could not load the summary.">
              {error.message}
            </Alert>
            <div className="row-end">
              <Button onClick={reload}>Try again</Button>
            </div>
          </div>
        </Card>
      </>
    );
  }

  const activeCustomers = data.customers.filter((customer) => customer.active);
  const activeProducts = data.products.filter((product) => product.active);
  const outOfStock = activeProducts.filter((product) => product.stock === 0);
  const revenue = data.sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const recentSales = data.sales.slice(0, 5);
  const lowStock = [...activeProducts].sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <>
      <PageHeader title="Summary" subtitle="Where the business stands right now." />

      <div className="stack">
        <div className="grid-3">
          <Stat label="Active customers" value={activeCustomers.length} />
          <Stat label="Active products" value={activeProducts.length} />
          <Stat label="Out of stock" value={outOfStock.length} />
        </div>

        <div className="grid-2">
          <Stat label="Sales registered" value={data.sales.length} />
          <Stat label="Total revenue" value={formatMoney(revenue)} />
        </div>

        <Card title="Recent sales" bodyless>
          {recentSales.length === 0 ? (
            <EmptyState title="No sales yet">
              Register one from the Sales module to see it here.
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
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td><span className="num">{formatDateTime(sale.date)}</span></td>
                      <td className="cell-strong">{sale.customerName}</td>
                      <td className="right"><span className="num">{sale.items.length}</span></td>
                      <td className="right"><span className="num">{formatMoney(sale.total)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Lowest stock" bodyless>
          {lowStock.length === 0 ? (
            <EmptyState title="No active products" />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="right">Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => (
                    <tr key={product.id}>
                      <td className="cell-strong">{product.name}</td>
                      <td><Badge tone="muted">{product.categoryName}</Badge></td>
                      <td className="right"><span className="num">{formatMoney(product.price)}</span></td>
                      <td><StockBadge stock={product.stock} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
