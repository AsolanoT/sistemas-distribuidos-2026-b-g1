import { accessories, peripherals } from '../../test-doubles/productsFixtures'
import type { Loadable } from './loadable'
import { countActiveCategories, toSummaryTiles } from './summary'

const ready = <T>(value: T): Loadable<T> => ({ status: 'ready', value })
const loading: Loadable<never> = { status: 'loading' }
const failed: Loadable<never> = { status: 'error' }

describe('countActiveCategories', () => {
  it('is loading while the categories load', () => {
    expect(countActiveCategories(loading)).toEqual({ status: 'loading' })
  })

  it('is an error when the categories failed', () => {
    expect(countActiveCategories(failed)).toEqual({ status: 'error' })
  })

  it('counts only the active categories', () => {
    expect(countActiveCategories(ready([peripherals, accessories]))).toEqual({ status: 'ready', value: 1 })
  })

  it('is zero when there are no categories', () => {
    expect(countActiveCategories(ready([]))).toEqual({ status: 'ready', value: 0 })
  })
})

describe('toSummaryTiles', () => {
  it('has the three tiles of the wireframe, in order, each with its own state', () => {
    const tiles = toSummaryTiles(ready(12), failed, ready([peripherals, accessories]))

    expect(tiles).toEqual([
      { id: 'activeProducts', label: 'Productos activos', state: { status: 'ready', value: 12 } },
      { id: 'outOfStock', label: 'Agotados', state: { status: 'error' } },
      { id: 'activeCategories', label: 'Categorías activas', state: { status: 'ready', value: 1 } },
    ])
  })

  it('keeps a tile loading while the others have their answer', () => {
    const tiles = toSummaryTiles(loading, ready(3), failed)

    expect(tiles.map((tile) => tile.state.status)).toEqual(['loading', 'ready', 'error'])
  })
})
