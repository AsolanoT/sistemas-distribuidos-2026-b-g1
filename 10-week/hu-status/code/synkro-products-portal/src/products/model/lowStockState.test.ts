import { stockStateOf } from './stockState'

describe('stockStateOf with open alerts', () => {
  it('is low when the product has an open alert and stock above zero', () => {
    expect(stockStateOf(3, true)).toBe('low-stock')
  })

  it('is out of stock at zero, even with an open alert', () => {
    expect(stockStateOf(0, true)).toBe('out-of-stock')
  })

  it('is in stock above zero with no open alert', () => {
    expect(stockStateOf(3, false)).toBe('in-stock')
  })

  it('is in stock when nobody says anything about alerts', () => {
    expect(stockStateOf(3)).toBe('in-stock')
  })

  it('is out of stock at zero without an alert', () => {
    expect(stockStateOf(0, false)).toBe('out-of-stock')
  })
})
