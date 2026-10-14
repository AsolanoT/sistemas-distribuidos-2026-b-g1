import { parsePrice, type PriceError } from './price'

const MAX_SAFE = Number.MAX_SAFE_INTEGER // 9007199254740991 minor units

describe('parsePrice', () => {
  describe('accepts digits with at most one decimal separator and one or two decimals', () => {
    it.each([
      ['0.07', 7],
      ['0,07', 7],
      ['12,5', 1250],
      ['12.5', 1250],
      ['1234', 123_400],
      ['1234.56', 123_456],
      ['1234,56', 123_456],
      ['0.1', 10],
      ['10.00', 1000],
      ['007', 700],
      ['  45 ', 4500],
      ['1', 100],
      ['0.01', 1],
    ])('reads "%s" as %i minor units', (text, minorUnits) => {
      expect(parsePrice(text)).toEqual({ ok: true, priceCents: minorUnits })
    })

    it('accepts the largest amount whose minor units are still a safe integer', () => {
      expect(parsePrice('90071992547409.91')).toEqual({ ok: true, priceCents: MAX_SAFE })
    })
  })

  describe('rejects with a reason and nothing to send', () => {
    it.each<[string, string, PriceError]>([
      ['empty', '', 'empty'],
      ['only spaces', '   ', 'empty'],
      ['zero', '0', 'zero'],
      ['zero with decimals', '0.00', 'zero'],
      ['zero with a comma', '0,0', 'zero'],
      ['a negative number', '-1', 'invalid'],
      ['a negative decimal', '-0.5', 'invalid'],
      ['letters', 'abc', 'invalid'],
      ['digits mixed with letters', '12a', 'invalid'],
      ['a currency symbol', '$100', 'invalid'],
      ['no digits before the separator', '.5', 'invalid'],
      ['a trailing separator', '12.', 'invalid'],
      ['two separators', '1,234.56', 'invalid'],
      ['an exponent', '1e3', 'invalid'],
      ['three decimals, ambiguous with a thousands separator', '1.234', 'tooManyDecimals'],
      ['three decimals with a comma', '1,234', 'tooManyDecimals'],
      ['many decimals', '0.0001', 'tooManyDecimals'],
      ['one minor unit above the safe integer limit', '90071992547409.92', 'tooLarge'],
      ['a huge amount', '99999999999999999999', 'tooLarge'],
    ])('rejects %s ("%s") as %s', (_label, text, error) => {
      expect(parsePrice(text)).toEqual({ ok: false, error })
    })
  })

  it('never goes through a float: a value a float cannot hold keeps its exact digits', () => {
    // 0.07 * 100 is 7.000000000000001 in floating point.
    expect(parsePrice('0.07')).toEqual({ ok: true, priceCents: 7 })
    expect(parsePrice('1.15')).toEqual({ ok: true, priceCents: 115 })
    expect(parsePrice('4.35')).toEqual({ ok: true, priceCents: 435 })
  })
})
