import { formatPriceText } from './priceText'
import { parsePrice } from './price'

describe('formatPriceText', () => {
  it.each([
    [1_250_050, '12500,50'],
    [700, '7'],
    [7, '0,07'],
    [100, '1'],
    [710, '7,10'],
    [99, '0,99'],
    [1, '0,01'],
    [45_990_000, '459900'],
  ])('writes %i minor units as "%s"', (priceCents, text) => {
    expect(formatPriceText(priceCents)).toBe(text)
  })

  it('stays exact at the largest safe integer, where floats would round', () => {
    expect(formatPriceText(Number.MAX_SAFE_INTEGER)).toBe('90071992547409,91')
  })

  it.each([1_250_050, 700, 7, 99, 100, 123_456, 8_990_000, Number.MAX_SAFE_INTEGER])(
    'round-trips %i through parsePrice',
    (priceCents) => {
      expect(parsePrice(formatPriceText(priceCents))).toEqual({ ok: true, priceCents })
    },
  )

  it.each([Number.NaN, -5, 1.5, Number.MAX_SAFE_INTEGER + 2])('writes nothing for %s', (value) => {
    expect(formatPriceText(value)).toBe('')
  })
})
