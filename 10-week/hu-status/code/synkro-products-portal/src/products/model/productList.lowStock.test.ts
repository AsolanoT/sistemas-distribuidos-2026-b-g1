import { accessories, mouse, peripherals, productsPage } from '../../test-doubles/productsFixtures'
import { toListView } from './productList'

const categories = { status: 'ready' as const, value: [peripherals, accessories] }
const products = (stock: number) => ({ status: 'ready' as const, value: productsPage([{ ...mouse, stock }]) })

function stateOf(stock: number, lowStockIds?: ReadonlySet<string>) {
  const view = toListView(products(stock), categories, { page: 1 }, { lowStockIds })
  if (view.status !== 'data') throw new Error('expected data')
  return view.rows[0].stockState
}

describe('toListView: low stock', () => {
  it('marks a product with an open alert and stock above zero as low', () => {
    expect(stateOf(3, new Set([mouse.productId]))).toBe('low-stock')
  })

  it('keeps stock zero as sold out, even with an open alert', () => {
    expect(stateOf(0, new Set([mouse.productId]))).toBe('out-of-stock')
  })

  it('keeps a product without an open alert in stock', () => {
    expect(stateOf(3, new Set(['someone-else']))).toBe('in-stock')
  })

  it('says only in stock or sold out when there are no alerts to go by', () => {
    expect(stateOf(3)).toBe('in-stock')
    expect(stateOf(0)).toBe('out-of-stock')
  })

  it('does not change anything else about the row', () => {
    const view = toListView(products(3), categories, { page: 1 }, { lowStockIds: new Set([mouse.productId]) })
    expect(view.status === 'data' && view.rows[0]).toMatchObject({ name: 'Wireless mouse', stock: 3, active: true })
  })
})
