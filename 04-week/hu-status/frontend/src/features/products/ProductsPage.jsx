import { useState } from 'react';
import { useResource } from '../../api/useResource';
import { formatMoney } from '../../api/format';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import {
  ActiveBadge,
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Stat,
  StockBadge,
  TableSkeleton,
} from '../../components/ui';
import ProductFormModal from './ProductFormModal';
import CategoryFormModal from './CategoryFormModal';
import { deactivateProduct, listCategories, listProducts } from './api';

async function loadCatalogue() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return { products, categories };
}

export default function ProductsPage() {
  const { data, error, loading, reload } = useResource(loadCatalogue);

  const [editingProduct, setEditingProduct] = useState(null); // product or 'new'
  const [addingCategory, setAddingCategory] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  const activeCategories = categories.filter((category) => category.active);

  const initialLoading = loading && !data;
  const activeProducts = products.filter((product) => product.active);
  const outOfStock = activeProducts.filter((product) => product.stock === 0);

  async function handleDeactivate(product) {
    if (!window.confirm(`Deactivate ${product.name}? It can no longer be sold.`)) return;
    setBusyId(product.id);
    setActionError(null);
    try {
      await deactivateProduct(product.id);
      await reload();
    } catch (caught) {
      setActionError(caught.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Catalogue, stock levels and categories."
        action={
          <Button
            variant="primary"
            onClick={() => setEditingProduct('new')}
            disabled={loading || Boolean(error)}
          >
            <Icon name="plus" className="nav-icon" />
            New product
          </Button>
        }
      />

      <div className="stack">
        {actionError ? <Alert tone="error">{actionError}</Alert> : null}

        {!initialLoading && !error ? (
          <div className="grid-3">
            <Stat label="Active products" value={activeProducts.length} />
            <Stat label="Out of stock" value={outOfStock.length} />
            <Stat label="Active categories" value={activeCategories.length} />
          </div>
        ) : null}

        <Card title="Catalogue" bodyless>
          {initialLoading ? <TableSkeleton /> : null}

          {!initialLoading && error ? (
            <div className="card-body stack">
              <Alert tone="error" title="Could not load the catalogue.">
                {error.message}
              </Alert>
              <div className="row-end">
                <Button onClick={reload}>Try again</Button>
              </div>
            </div>
          ) : null}

          {!initialLoading && !error && products.length === 0 ? (
            <EmptyState title="No products yet">
              Add a category first, then register your first product.
            </EmptyState>
          ) : null}

          {!initialLoading && !error && products.length > 0 ? (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="right">Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className={product.active ? '' : 'row-inactive'}>
                      <td className="cell-strong">{product.name}</td>
                      <td><Badge tone="muted">{product.categoryName}</Badge></td>
                      <td className="right"><span className="num">{formatMoney(product.price)}</span></td>
                      <td><StockBadge stock={product.stock} /></td>
                      <td><ActiveBadge active={product.active} /></td>
                      <td className="right">
                        <div className="row-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                            disabled={busyId === product.id}
                          >
                            <Icon name="edit" className="nav-icon" />
                            Edit
                          </Button>
                          {product.active ? (
                            <Button
                              variant="danger-ghost"
                              size="sm"
                              onClick={() => handleDeactivate(product)}
                              disabled={busyId === product.id}
                            >
                              <Icon name="power" className="nav-icon" />
                              {busyId === product.id ? 'Working…' : 'Deactivate'}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>

        <Card
          title="Categories"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddingCategory(true)}
              disabled={loading || Boolean(error)}
            >
              <Icon name="plus" className="nav-icon" />
              New category
            </Button>
          }
        >
          {initialLoading ? (
            <div className="skeleton-line" style={{ width: '60%' }} />
          ) : categories.length === 0 ? (
            <EmptyState title="No categories yet">
              Every product belongs to a category, so start here.
            </EmptyState>
          ) : (
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <Badge key={category.id} tone={category.active ? 'steel' : 'muted'}>
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {editingProduct ? (
        <ProductFormModal
          product={editingProduct === 'new' ? null : editingProduct}
          categories={activeCategories}
          onClose={() => setEditingProduct(null)}
          onSaved={async () => {
            setEditingProduct(null);
            await reload();
          }}
        />
      ) : null}

      {addingCategory ? (
        <CategoryFormModal
          onClose={() => setAddingCategory(false)}
          onSaved={async () => {
            setAddingCategory(false);
            await reload();
          }}
        />
      ) : null}
    </>
  );
}
