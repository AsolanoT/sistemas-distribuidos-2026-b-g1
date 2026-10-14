import { listCopy } from './listCopy'

export interface TableColumn {
  id: string
  header: string
  // Numbers to scan and compare: right-aligned, mono, tabular.
  numeric: boolean
  // Right-aligned without being a number: the actions.
  alignEnd?: boolean
  // Its cells hold a badge, so the skeleton draws a badge-sized placeholder.
  badge?: boolean
}

const product: TableColumn = { id: 'product', header: listCopy.columns.product, numeric: false }
const category: TableColumn = { id: 'category', header: listCopy.columns.category, numeric: false, badge: true }
const price: TableColumn = { id: 'price', header: listCopy.columns.price, numeric: true }
const stock: TableColumn = { id: 'stock', header: listCopy.columns.stock, numeric: true }
const status: TableColumn = { id: 'status', header: listCopy.columns.status, numeric: false, badge: true }
const actions: TableColumn = { id: 'actions', header: listCopy.columns.actions, numeric: false, alignEnd: true }

// The catalogue's columns, in the wireframe's order. The table and its skeleton are
// both built from a list like this, so they always have the same shape. The last
// column holds the row actions.
export const tableColumns: TableColumn[] = [product, category, price, stock, status, actions]

// The stock lookup is the same table without the status and the actions.
export const lookupColumns: TableColumn[] = [product, category, price, stock]
