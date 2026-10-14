import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { accessories, categoriesPage, mouse, peripherals, productsPage } from '../../test-doubles/productsFixtures'
import type { Page } from '../model/page'
import type { ProductResponse } from '../model/product'
import { ProductsPage } from './ProductsPage'

const CATEGORIES_PATH = '/api/v1/products/categories'
const PRODUCTS_PATH = '/api/v1/products'

const webcam: ProductResponse = { ...mouse, productId: 'p-9', name: 'USB webcam', priceCents: 8_990_000, stock: 0 }

interface ServiceOptions {
  // How a POST that is not a replay is answered, after the product was created.
  answer?: () => Promise<void>
  pages?: number
}

// The products service as the page sees it: the catalogue it lists, and what a
// POST answers. It is idempotent like the real one: a key it has seen answers
// the same product again and creates nothing. A created product joins the
// catalogue, so the reloaded list shows it.
function serviceThatCreates({ answer = () => Promise.resolve(), pages = 1 }: ServiceOptions = {}) {
  const catalogue: ProductResponse[] = [mouse]
  const created = new Map<string, ProductResponse>()

  apiClient.request.mockImplementation((path: string, options) => {
    if (path === CATEGORIES_PATH) return Promise.resolve(categoriesPage([peripherals, accessories]))
    if (options?.method === 'POST') {
      const key = options.idempotencyKey ?? ''
      const replay = created.get(key)
      if (replay) return Promise.resolve(replay)

      created.set(key, webcam)
      catalogue.unshift(webcam)
      return answer().then(() => webcam)
    }
    if (options?.query?.limit === 1) {
      const matching = options.query.stockAtMost === 0 ? catalogue.filter((product) => product.stock === 0) : catalogue
      return Promise.resolve({ data: [], meta: { page: 1, limit: 1, total: matching.length, totalPages: matching.length } })
    }
    const page = Number(options?.query?.page ?? 1)
    const body: Page<ProductResponse> = productsPage(catalogue)
    return Promise.resolve({ ...body, meta: { ...body.meta, page, totalPages: pages } })
  })
}

// The list requests; the summary tiles ask for a single row (limit 1).
const productRequests = () =>
  apiClient.request.mock.calls.filter(([path, options]) => path === PRODUCTS_PATH && !options?.method && options?.query?.limit !== 1)
const createRequests = () => apiClient.request.mock.calls.filter(([, options]) => options?.method === 'POST')
const openAction = () => screen.getByRole('button', { name: 'Nuevo producto' })
// The filters have a Nombre and a Categoría of their own, so the form's fields are found inside it.
const registrationForm = () => within(screen.getByRole('form', { name: 'Nuevo producto' }))

async function openForm(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('row', { name: /Wireless mouse/ })
  await user.click(openAction())
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(registrationForm().getByLabelText('Nombre'), 'USB webcam')
  await user.type(registrationForm().getByLabelText('Precio'), '89900')
  await user.selectOptions(registrationForm().getByLabelText('Categoría'), 'Peripherals')
  await user.click(screen.getByRole('button', { name: 'Registrar producto' }))
}

describe('ProductsPage: registering a product', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('opening and closing the form', () => {
    it('offers "Nuevo producto" and shows no form until it is used', async () => {
      serviceThatCreates()

      render(<ProductsPage />)

      expect(openAction()).toBeInTheDocument()
      expect(screen.queryByRole('form', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    })

    it('opens the form inside the page, with the cursor in its first field', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)

      await openForm(user)

      expect(screen.getByRole('form', { name: 'Nuevo producto' })).toBeInTheDocument()
      expect(registrationForm().getByLabelText('Nombre')).toHaveFocus()
      expect(screen.getByRole('heading', { name: 'Productos' })).toBeInTheDocument()
    })

    it('keeps one primary action in view: the opening action steps aside while the form is open', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)

      await openForm(user)

      expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    })

    it('reuses the categories the list already loaded', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)

      await openForm(user)

      const categoryRequests = apiClient.request.mock.calls.filter(([path]) => path === CATEGORIES_PATH)
      expect(categoryRequests).toHaveLength(1)
      expect(within(registrationForm().getByLabelText('Categoría')).getByRole('option', { name: 'Peripherals' })).toBeInTheDocument()
    })

    it('closes with Cancelar and gives focus back to the action that opened it', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.queryByRole('form', { name: 'Nuevo producto' })).not.toBeInTheDocument()
      expect(openAction()).toHaveFocus()
    })

    it('starts empty when it is opened again', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)
      await user.type(registrationForm().getByLabelText('Nombre'), 'Half typed')
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      await user.click(openAction())

      expect(registrationForm().getByLabelText('Nombre')).toHaveValue('')
    })
  })

  describe('a product that is registered', () => {
    it('closes the form and lists the product once it is created', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)

      await fillAndSubmit(user)

      expect(await screen.findByRole('row', { name: /USB webcam/ })).toBeInTheDocument()
      expect(screen.queryByRole('form', { name: 'Nuevo producto' })).not.toBeInTheDocument()
      expect(createRequests()).toHaveLength(1)
    })

    it('succeeds on the 200 replay after a lost answer, without creating the product twice', async () => {
      const user = userEvent.setup()
      let answers = 0
      serviceThatCreates({
        answer: () => (++answers === 1 ? Promise.reject(hostError(0, { error: 'NETWORK_ERROR', message: 'Network error' })) : Promise.resolve()),
      })
      render(<ProductsPage />)
      await openForm(user)
      await fillAndSubmit(user)
      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.')

      await user.click(screen.getByRole('button', { name: 'Registrar producto' }))

      expect(await screen.findByText('Producto registrado')).toBeInTheDocument()
      const [first, second] = createRequests()
      expect(second[1]?.idempotencyKey).toBe(first[1]?.idempotencyKey)
      expect(screen.getAllByRole('row', { name: /USB webcam/ })).toHaveLength(1)
    })

    it('shows the new product with stock 0', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)

      await fillAndSubmit(user)

      const row = await screen.findByRole('row', { name: /USB webcam/ })
      const stockCell = within(row).getAllByRole('cell')[3]
      expect(within(stockCell).getByText('0')).toBeInTheDocument()
      expect(within(stockCell).getByText('Agotado')).toBeInTheDocument()
    })

    it('posts the product the user typed, with the price in minor units', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)

      await fillAndSubmit(user)

      await waitFor(() => expect(createRequests()).toHaveLength(1))
      expect(createRequests()[0]).toEqual([
        PRODUCTS_PATH,
        {
          method: 'POST',
          body: { name: 'USB webcam', priceCents: 8_990_000, categoryId: 'c-1' },
          idempotencyKey: expect.any(String),
        },
      ])
    })

    it('reloads the list: a second products request follows the creation', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)
      expect(productRequests()).toHaveLength(1)

      await fillAndSubmit(user)

      await screen.findByRole('row', { name: /USB webcam/ })
      expect(productRequests()).toHaveLength(2)
    })

    it('reloads the two product tiles: one more active product, and one more out of stock', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)
      await waitFor(() => expect(screen.getByRole('listitem', { name: 'Productos activos' })).toHaveTextContent('1'))
      expect(screen.getByRole('listitem', { name: 'Agotados' })).toHaveTextContent('0')

      await fillAndSubmit(user)

      await waitFor(() => expect(screen.getByRole('listitem', { name: 'Productos activos' })).toHaveTextContent('2'))
      expect(screen.getByRole('listitem', { name: 'Agotados' })).toHaveTextContent('1')
    })

    it('reloads from the first page, where the newest product is, keeping the filters', async () => {
      const user = userEvent.setup()
      serviceThatCreates({ pages: 3 })
      render(<ProductsPage />)
      await screen.findByText('Página 1 de 3')
      await user.click(screen.getByRole('button', { name: 'Siguiente' }))
      await screen.findByText('Página 2 de 3')
      await user.click(openAction())

      await fillAndSubmit(user)

      await screen.findByText('Página 1 de 3')
      expect(productRequests().at(-1)?.[1]?.query).toMatchObject({ page: 1 })
    })

    it('announces "Producto registrado" in a polite live region', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)

      await fillAndSubmit(user)

      const announcement = await screen.findByText('Producto registrado')
      expect(announcement).toHaveAttribute('aria-live', 'polite')
    })

    it('has the live region in the page before anything is announced, so the announcement is read', async () => {
      serviceThatCreates()

      const { container } = render(<ProductsPage />)

      expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement()
    })

    it('gives focus back to the "Nuevo producto" action', async () => {
      const user = userEvent.setup()
      serviceThatCreates()
      render(<ProductsPage />)
      await openForm(user)

      await fillAndSubmit(user)

      await screen.findByRole('row', { name: /USB webcam/ })
      expect(openAction()).toHaveFocus()
    })

    it('stops announcing after 4 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        serviceThatCreates()
        render(<ProductsPage />)
        await openForm(user)
        await fillAndSubmit(user)
        await screen.findByText('Producto registrado')

        await vi.advanceTimersByTimeAsync(4_000)

        await waitFor(() => expect(screen.queryByText('Producto registrado')).not.toBeInTheDocument())
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('a product that is not registered', () => {
    it('keeps the form open and the list as it was, with no announcement', async () => {
      const user = userEvent.setup()
      serviceThatCreates({
        answer: () =>
          Promise.reject(hostError(422, { error: 'BUSINESS_RULE_VIOLATION', message: 'The product breaks a rule' })),
      })
      render(<ProductsPage />)
      await openForm(user)

      await fillAndSubmit(user)

      expect(await screen.findByRole('alert')).toHaveTextContent('The product breaks a rule')
      expect(screen.getByRole('form', { name: 'Nuevo producto' })).toBeInTheDocument()
      expect(registrationForm().getByLabelText('Nombre')).toHaveValue('USB webcam')
      expect(productRequests()).toHaveLength(1)
      expect(screen.queryByText('Producto registrado')).not.toBeInTheDocument()
    })
  })
})
