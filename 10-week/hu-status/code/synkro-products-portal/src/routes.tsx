import type { ComponentType, ReactElement } from 'react'
import { ProductsPage } from './products/pages/ProductsPage'
import { StockAlertsPage } from './products/pages/StockAlertsPage'
import { StockLookupPage } from './products/pages/StockLookupPage'

// The host mounts this App for the portal's routes and does not share a router
// with it. This table maps each path to its screen, read from the browser's
// location; an optional trailing slash is accepted and nothing else is.
const routes: { pattern: RegExp; Screen: ComponentType }[] = [
  { pattern: /^\/products\/?$/, Screen: ProductsPage },
  { pattern: /^\/stock\/?$/, Screen: StockLookupPage },
  { pattern: /^\/stock-alerts\/?$/, Screen: StockAlertsPage },
]

export function resolveScreen(pathname: string): ReactElement | null {
  const route = routes.find(({ pattern }) => pattern.test(pathname))
  return route ? <route.Screen /> : null
}
