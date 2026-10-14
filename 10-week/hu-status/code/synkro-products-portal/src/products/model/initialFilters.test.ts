import { initialNameFilter } from './initialFilters'

describe('initialNameFilter', () => {
  it.each([
    ['?name=Teclado', 'Teclado'],
    ['?name=Teclado%20mec%C3%A1nico', 'Teclado mecánico'],
    ['?name=Mouse+inal%C3%A1mbrico', 'Mouse inalámbrico'],
    ['?other=1&name=Teclado', 'Teclado'],
    ['?name=%20%20Teclado%20%20', 'Teclado'],
  ])('reads "%s" as "%s"', (search, name) => {
    expect(initialNameFilter(search)).toBe(name)
  })

  it.each(['', '?', '?name=', '?name=%20%20', '?other=1'])('ignores "%s"', (search) => {
    expect(initialNameFilter(search)).toBeUndefined()
  })

  it('takes the first name when it is repeated', () => {
    expect(initialNameFilter('?name=A&name=B')).toBe('A')
  })
})
