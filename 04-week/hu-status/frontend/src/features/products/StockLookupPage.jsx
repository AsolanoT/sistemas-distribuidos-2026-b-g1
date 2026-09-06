import { useMemo, useState } from 'react';
import { useResource } from '../../api/useResource';
import { formatMoney } from '../../api/format';
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
import { listActiveProducts } from './api';

/**
 * AC3: a salesperson may check what is on the shelf, but never change it —
 * this screen is deliberately read-only, no create/edit/deactivate anywhere.
 */
export default function StockLookupPage() {
  const { data: products, error, loading, reload } = useResource(listActiveProducts);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const list = products ?? [];
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.categoryName.toLowerCase().includes(term),
    );
  }, [products, query]);

  const initialLoading = loading && !products;
  const available = (products ?? []).filter((product) => product.stock > 0).length;
  const depleted = (products ?? []).filter((product) => product.stock === 0).length;

  return (
    <>
      <PageHeader
        title="Stock lookup"
        subtitle="Read-only view of what is currently sellable."
      />

      <div className="stack">
        {!initialLoading && !error ? (
          <div className="grid-3">
            <Stat label="Sellable products" value={products?.length ?? 0} />
            <Stat label="In stock" value={available} />
            <Stat label="Out of stock" value={depleted} />
          </div>
        ) : null}

        <Card
          title="Catalogue"
          action={
            <input
              className="input"
              style={{ width: 240 }}
              placeholder="Search by name or category…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          }
          bodyless
        >
          {initialLoading ? <TableSkeleton /> : null}

          {!initialLoading && error ? (
            <div className="card-body stack">
              <Alert tone="error" title="Could not load stock.">
                {error.message}
              </Alert>
              <div className="row-end">
                <Button onClick={reload}>Try again</Button>
              </div>
            </div>
          ) : null}

          {!initialLoading && !error && filtered.length === 0 ? (
            <EmptyState title="Nothing matches">
              {query ? 'Try a different search term.' : 'There are no sellable products yet.'}
            </EmptyState>
          ) : null}

          {!initialLoading && !error && filtered.length > 0 ? (
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
                  {filtered.map((product) => (
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
          ) : null}
        </Card>
      </div>
    </>
  );
}
