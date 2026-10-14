import { formatMinorUnits } from './money'

describe('formatMinorUnits', () => {
  it.each([
    [0, 'COP 0,00'],
    [1, 'COP 0,01'],
    [99, 'COP 0,99'],
    [100, 'COP 1,00'],
    [5_000, 'COP 50,00'],
    [123_456, 'COP 1.234,56'],
    [123_456_789_012, 'COP 1.234.567.890,12'],
    [Number.MAX_SAFE_INTEGER, 'COP 90.071.992.547.409,91'],
  ])('formats %i minor units as %s', (minorUnits, expected) => {
    expect(formatMinorUnits(minorUnits)).toBe(expected)
  })

  it('rejects a fractional amount of minor units', () => {
    expect(() => formatMinorUnits(1.5)).toThrow(RangeError)
  })

  it('rejects a negative amount', () => {
    expect(() => formatMinorUnits(-1)).toThrow(RangeError)
  })
})
