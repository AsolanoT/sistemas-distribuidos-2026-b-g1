import { createDateFormatter } from './dateFormat'

// ICU versions separate "a. m." with a plain, a no-break or a narrow no-break space.
const plain = (text: string) => text.replace(/[  ]/g, ' ')

describe('createDateFormatter', () => {
  it('writes the date and the time in Spanish (Colombia), in the time zone it is given', () => {
    const format = createDateFormatter('America/Bogota')

    expect(plain(format('2026-10-10T15:49:00Z'))).toBe('10/10/2026, 10:49 a. m.')
  })

  it('moves the same instant with the time zone, so tests are deterministic', () => {
    expect(plain(createDateFormatter('UTC')('2026-10-10T15:49:00Z'))).toBe('10/10/2026, 3:49 p. m.')
    expect(plain(createDateFormatter('Asia/Tokyo')('2026-10-10T15:49:00Z'))).toBe('11/10/2026, 12:49 a. m.')
  })

  it('uses the browser time zone when none is given', () => {
    expect(createDateFormatter()('2026-10-10T15:49:00Z')).toMatch(/2026/)
  })

  it.each(['', 'not a date'])('writes a dash for "%s"', (value) => {
    expect(createDateFormatter('UTC')(value)).toBe('—')
  })
})
