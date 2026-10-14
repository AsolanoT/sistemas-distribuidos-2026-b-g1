import type { Loadable } from './loadable'
import { toLookupTiles } from './summary'

const ready = (value: number): Loadable<number> => ({ status: 'ready', value })
const loading: Loadable<number> = { status: 'loading' }
const error: Loadable<number> = { status: 'error' }

describe('toLookupTiles', () => {
  it('has the three tiles of the wireframe, in order, with their labels', () => {
    const tiles = toLookupTiles(ready(10), ready(3))

    expect(tiles.map((tile) => [tile.id, tile.label])).toEqual([
      ['sellable', 'Productos vendibles'],
      ['inStock', 'En stock'],
      ['outOfStock', 'Agotados'],
    ])
  })

  it('counts the active products as sellable, and the sold out ones as Agotados', () => {
    const [sellable, , outOfStock] = toLookupTiles(ready(10), ready(3))

    expect(sellable.state).toEqual(ready(10))
    expect(outOfStock.state).toEqual(ready(3))
  })

  it('derives En stock as the active products minus the sold out ones', () => {
    expect(toLookupTiles(ready(10), ready(3))[1].state).toEqual(ready(7))
  })

  it('never goes below zero', () => {
    expect(toLookupTiles(ready(2), ready(5))[1].state).toEqual(ready(0))
  })

  it('shows En stock as loading while either count loads', () => {
    expect(toLookupTiles(loading, ready(3))[1].state).toEqual(loading)
    expect(toLookupTiles(ready(10), loading)[1].state).toEqual(loading)
  })

  it('fails En stock when either count fails, and only the tiles that need that count', () => {
    const [sellable, inStock, outOfStock] = toLookupTiles(ready(10), error)

    expect(sellable.state).toEqual(ready(10))
    expect(inStock.state).toEqual(error)
    expect(outOfStock.state).toEqual(error)
  })

  it('keeps Agotados when only the active count fails', () => {
    const [sellable, inStock, outOfStock] = toLookupTiles(error, ready(3))

    expect(sellable.state).toEqual(error)
    expect(inStock.state).toEqual(error)
    expect(outOfStock.state).toEqual(ready(3))
  })

  it('prefers the error over loading when one count failed and the other still loads', () => {
    expect(toLookupTiles(error, loading)[1].state).toEqual(error)
  })
})
