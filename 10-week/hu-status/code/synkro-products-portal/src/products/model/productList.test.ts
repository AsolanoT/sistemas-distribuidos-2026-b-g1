import { keyboard, mouse, peripherals, productsPage } from '../../test-doubles/productsFixtures'
import type { Loadable } from './loadable'
import type { ProductFilters } from './product'
import { hasActiveFilters, toListView } from './productList'

const ready = <T>(value: T): Loadable<T> => ({ status: 'ready', value })
const loading: Loadable<never> = { status: 'loading' }
const failed: Loadable<never> = { status: 'error' }
const noFilters: ProductFilters = { page: 1 }

describe('toListView', () => {
  it('is loading while the products are loading', () => {
    expect(toListView(loading, ready([peripherals]), noFilters)).toEqual({ status: 'loading' })
  })

  it('is an error when the products failed', () => {
    expect(toListView(failed, ready([peripherals]), noFilters)).toEqual({ status: 'error' })
  })

  it('is empty when the page has no products, keeping the page metadata', () => {
    const products = ready(productsPage([]))

    expect(toListView(products, ready([peripherals]), noFilters)).toEqual({
      status: 'empty',
      hasFilters: false,
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
  })

  it('is data with one row per product, in the order received', () => {
    const view = toListView(ready(productsPage([mouse, keyboard])), ready([peripherals]), noFilters)

    expect(view.status).toBe('data')
    if (view.status !== 'data') return
    expect(view.rows.map((row) => row.name)).toEqual(['Wireless mouse', 'Mechanical keyboard'])
    expect(view.rows[0]).toMatchObject({ price: 'COP 1.234,56', stock: 7, stockState: 'in-stock', category: 'Peripherals', active: true })
  })

  it('shows a category the loaded list does not know as "Categoría desconocida"', () => {
    const view = toListView(ready(productsPage([keyboard])), ready([peripherals]), noFilters)

    expect(view.status === 'data' && view.rows[0].category).toBe('Categoría desconocida')
  })

  it('shows the category as loading while the categories are still loading', () => {
    const view = toListView(ready(productsPage([mouse])), loading, noFilters)

    expect(view.status === 'data' && view.rows[0].category).toBe('Cargando…')
  })

  it('shows the category as unavailable when the categories failed, and still shows the products', () => {
    const view = toListView(ready(productsPage([mouse])), failed, noFilters)

    expect(view.status === 'data' && view.rows[0]).toMatchObject({ name: 'Wireless mouse', category: 'No disponible' })
  })
})

describe('toListView with filters', () => {
  it('tells an empty answer to filters apart from an empty catalogue', () => {
    const products = ready(productsPage([]))

    expect(toListView(products, ready([]), { page: 1, name: 'zzz' })).toMatchObject({ status: 'empty', hasFilters: true })
    expect(toListView(products, ready([]), { page: 1 })).toMatchObject({ status: 'empty', hasFilters: false })
  })
})

describe('hasActiveFilters', () => {
  it('is false when nothing is set, or the name is blank', () => {
    expect(hasActiveFilters({ page: 1 })).toBe(false)
    expect(hasActiveFilters({ page: 3, name: '   ', categoryId: '' })).toBe(false)
  })

  it.each([
    ['a name', { page: 1, name: 'mouse' }],
    ['a category', { page: 1, categoryId: 'c-1' }],
    ['Activos', { page: 1, active: true }],
    ['Inactivos', { page: 1, active: false }],
  ])('is true with %s', (_label, filters) => {
    expect(hasActiveFilters(filters)).toBe(true)
  })
})
