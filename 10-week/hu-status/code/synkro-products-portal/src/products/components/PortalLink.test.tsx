import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PortalLink } from './PortalLink'

describe('PortalLink', () => {
  afterEach(() => window.history.replaceState({}, '', '/'))

  it('is a real link, so it can be opened in a new tab and read by assistive technology', () => {
    render(<PortalLink href="/products?name=Teclado">Teclado</PortalLink>)

    expect(screen.getByRole('link', { name: 'Teclado' })).toHaveAttribute('href', '/products?name=Teclado')
  })

  it('navigates without a document load on a plain left click', async () => {
    const popstate = vi.fn()
    window.addEventListener('popstate', popstate)
    render(<PortalLink href="/products?name=Teclado">Teclado</PortalLink>)

    await userEvent.click(screen.getByRole('link', { name: 'Teclado' }))

    window.removeEventListener('popstate', popstate)
    expect(window.location.pathname + window.location.search).toBe('/products?name=Teclado')
    expect(popstate).toHaveBeenCalledOnce()
  })

  it('prevents the browser default on a plain left click', () => {
    render(<PortalLink href="/stock">Existencias</PortalLink>)

    const notPrevented = fireEvent.click(screen.getByRole('link'), { button: 0 })

    expect(notPrevented).toBe(false)
  })

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
  ])('leaves a click with %s to the browser', (_key, modifier) => {
    render(<PortalLink href="/stock">Existencias</PortalLink>)

    const notPrevented = fireEvent.click(screen.getByRole('link'), { button: 0, ...modifier })

    expect(notPrevented).toBe(true)
    expect(window.location.pathname).toBe('/')
  })

  it('leaves a middle click to the browser', () => {
    render(<PortalLink href="/stock">Existencias</PortalLink>)

    const notPrevented = fireEvent.click(screen.getByRole('link'), { button: 1 })

    expect(notPrevented).toBe(true)
    expect(window.location.pathname).toBe('/')
  })

  it('leaves a click alone when a handler already prevented it', () => {
    render(
      <PortalLink href="/stock" onClick={(event) => event.preventDefault()}>
        Existencias
      </PortalLink>,
    )

    fireEvent.click(screen.getByRole('link'), { button: 0 })

    expect(window.location.pathname).toBe('/')
  })
})
