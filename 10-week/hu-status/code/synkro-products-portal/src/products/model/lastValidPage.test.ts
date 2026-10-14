import { lastValidPage } from './page'

describe('lastValidPage', () => {
  it.each([
    [1, 1, 1],
    [2, 3, 2],
    [3, 3, 3],
  ])('keeps page %i of %i', (page, totalPages, expected) => {
    expect(lastValidPage(page, totalPages)).toBe(expected)
  })

  it.each([
    [2, 1, 1],
    [5, 3, 3],
  ])('goes from the empty page %i back to the last one, %i-based total %i', (page, totalPages, expected) => {
    expect(lastValidPage(page, totalPages)).toBe(expected)
  })

  it('stays where it is when there are no pages at all, so an empty catalogue is not chased', () => {
    expect(lastValidPage(1, 0)).toBe(1)
    expect(lastValidPage(3, 0)).toBe(3)
  })
})
