import { render, screen } from '@testing-library/react'
import App from './App'

// The host mounts this App under the browser's location, so each test sets it.
function atPath(path: string) {
  window.history.replaceState({}, '', path)
}

describe('App (the module the host mounts)', () => {
  afterEach(() => atPath('/'))

  it('renders the Products screen at /products', () => {
    atPath('/products')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Productos' })).toBeInTheDocument()
  })

  it('renders nothing for a route it does not serve', () => {
    atPath('/dashboard')

    const { container } = render(<App />)

    expect(container).toBeEmptyDOMElement()
  })
})
