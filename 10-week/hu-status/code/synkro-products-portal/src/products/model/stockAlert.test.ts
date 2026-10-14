import { alertStatusParam, toAlertRow, type StockAlertResponse } from './stockAlert'

const open: StockAlertResponse = {
  alertId: 'a-1',
  productId: 'p-1',
  status: 'OPEN',
  stockAtOpening: 3,
  openedAt: '2026-10-10T15:49:00Z',
}

const resolved: StockAlertResponse = { ...open, alertId: 'a-2', status: 'RESOLVED', stockAtOpening: 5, resolvedAt: '2026-10-11T08:05:00Z' }

describe('alertStatusParam', () => {
  it.each([
    ['open', 'OPEN'],
    ['resolved', 'RESOLVED'],
    ['all', undefined],
  ] as const)('maps the %s filter to the status %s', (filter, status) => {
    expect(alertStatusParam(filter)).toBe(status)
  })
})

describe('toAlertRow', () => {
  const format = (iso: string) => `<${iso}>`

  it('keeps the product id and the stock at opening, and formats the opening date', () => {
    expect(toAlertRow(open, format)).toEqual({
      alertId: 'a-1',
      productId: 'p-1',
      stockAtOpening: 3,
      status: 'open',
      openedAt: '<2026-10-10T15:49:00Z>',
      resolvedAt: null,
    })
  })

  it('formats the resolution date of a resolved alert', () => {
    expect(toAlertRow(resolved, format)).toMatchObject({ status: 'resolved', resolvedAt: '<2026-10-11T08:05:00Z>' })
  })

  it('has no resolution date for an open alert, even if the service sent one', () => {
    expect(toAlertRow({ ...open, resolvedAt: '2026-10-11T08:05:00Z' }, format).resolvedAt).toBeNull()
  })
})
