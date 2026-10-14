import { stockStateOf } from './stockState'

describe('stockStateOf', () => {
  it('is out of stock when there are no units', () => {
    expect(stockStateOf(0)).toBe('out-of-stock')
  })

  it.each([1, 7, 1_000])('is in stock with %i units', (stock) => {
    expect(stockStateOf(stock)).toBe('in-stock')
  })
})
