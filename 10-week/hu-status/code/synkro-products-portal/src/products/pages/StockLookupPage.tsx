import { useId } from 'react'
import { ProductFilterBar } from '../components/ProductFilterBar'
import { ProductListBody } from '../components/ProductListBody'
import { SummaryTiles } from '../components/SummaryTiles'
import { listCopy } from '../model/listCopy'
import type { ProductFilters } from '../model/product'
import { toListView } from '../model/productList'
import { stockCopy } from '../model/stockCopy'
import { toLookupTiles } from '../model/summary'
import { lookupColumns } from '../model/tableColumns'
import styles from './ProductsPage.module.css'
import { useCategories } from './useCategories'
import { useProductList } from './useProductList'
import { useSummary } from './useSummary'

// A salesperson only ever sees what can be sold.
const ACTIVE_PRODUCTS: ProductFilters = { page: 1, active: true }

const emptyCopy = { empty: stockCopy.empty, noMatch: stockCopy.noMatch }

// The read-only stock lookup (/stock). It is the catalogue's list without its
// actions, status or forms: the same hooks, filter bar and table, parametrized.
// A salesperson may not read stock alerts, so it never asks for them and tells
// only "En stock" from "Agotado".
export function StockLookupPage() {
  const products = useProductList(ACTIVE_PRODUCTS)
  const categories = useCategories()
  const summary = useSummary()
  const catalogueTitleId = useId()
  const view = toListView(products.state, categories.state, products.filters, { ignoreActive: true })
  const tiles = toLookupTiles(summary.activeProducts.state, summary.outOfStock.state)

  const retryBoth = () => {
    summary.activeProducts.retry()
    summary.outOfStock.retry()
  }

  return (
    <section>
      <div className={styles.header}>
        <h1 className={styles.title}>{stockCopy.title}</h1>
      </div>

      <SummaryTiles
        tiles={tiles}
        onRetry={{ sellable: summary.activeProducts.retry, inStock: retryBoth, outOfStock: summary.outOfStock.retry }}
      />

      <section aria-labelledby={catalogueTitleId} className={styles.catalogue}>
        <h2 id={catalogueTitleId} className={styles.catalogueTitle}>
          {listCopy.catalogue}
        </h2>
        <ProductFilterBar
          filters={products.filters}
          categories={categories.state}
          showStatus={false}
          activeCategoriesOnly
          onChange={products.updateFilters}
          onRetryCategories={categories.retry}
        />
        <ProductListBody
          view={view}
          columns={lookupColumns}
          emptyCopy={emptyCopy}
          tableLabel={stockCopy.tableRegion}
          onRetry={products.retry}
          onPageChange={products.goToPage}
          onRegister={undefined}
        />
      </section>
    </section>
  )
}
