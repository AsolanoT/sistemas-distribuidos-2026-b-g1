import { navigateTo } from './navigation'

describe('navigateTo', () => {
  afterEach(() => window.history.replaceState({}, '', '/'))

  it('pushes the URL with the History API, without reloading the document', () => {
    const before = window.history.length

    navigateTo('/products?name=Teclado')

    expect(window.location.pathname + window.location.search).toBe('/products?name=Teclado')
    expect(window.history.length).toBe(before + 1)
  })

  it('dispatches popstate so a history-based router re-renders', () => {
    const listener = vi.fn()
    window.addEventListener('popstate', listener)

    navigateTo('/stock')

    window.removeEventListener('popstate', listener)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('has already changed the location when popstate is dispatched', () => {
    let seen = ''
    const listener = () => {
      seen = window.location.pathname
    }
    window.addEventListener('popstate', listener)

    navigateTo('/stock-alerts')

    window.removeEventListener('popstate', listener)
    expect(seen).toBe('/stock-alerts')
  })

  it('does not push the same location twice in a row', () => {
    navigateTo('/stock')
    const length = window.history.length

    navigateTo('/stock')

    expect(window.history.length).toBe(length)
  })
})
