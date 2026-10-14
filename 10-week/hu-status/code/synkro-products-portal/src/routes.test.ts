import { StockAlertsPage } from './products/pages/StockAlertsPage'
import { ProductsPage } from './products/pages/ProductsPage'
import { StockLookupPage } from './products/pages/StockLookupPage'
import { resolveScreen } from './routes'

describe('resolveScreen', () => {
  it.each([
    ['/products', ProductsPage],
    ['/stock', StockLookupPage],
    ['/stock-alerts', StockAlertsPage],
  ])('serves the screen of %s', (path, screen) => {
    expect(resolveScreen(path)?.type).toBe(screen)
  })

  it.each([
    ['/products/', ProductsPage],
    ['/stock/', StockLookupPage],
    ['/stock-alerts/', StockAlertsPage],
  ])('serves the screen of %s with a trailing slash', (path, screen) => {
    expect(resolveScreen(path)?.type).toBe(screen)
  })

  it.each(['/', '/productsx', '/stockx', '/stock-alertsx', '/stock/alerts', '/products/1', '/stock-alerts/1', '/dashboard', '/stock//'])(
    'serves nothing for %s',
    (path) => {
      expect(resolveScreen(path)).toBeNull()
    },
  )

  it('does not tell /stock from /stock-alerts by their common prefix', () => {
    expect(resolveScreen('/stock')?.type).not.toBe(resolveScreen('/stock-alerts')?.type)
  })
})
