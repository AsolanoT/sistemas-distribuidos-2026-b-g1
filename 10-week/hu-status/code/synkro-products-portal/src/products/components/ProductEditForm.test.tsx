import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { accessories, deferred, mouse, peripherals } from '../../test-doubles/productsFixtures'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import type { ProductResponse } from '../model/product'
import { ProductEditForm } from './ProductEditForm'

const monitors: CategoryResponse = { categoryId: 'c-3', name: 'Monitors', active: true }
const ready = (...categories: CategoryResponse[]): Loadable<CategoryResponse[]> => ({ status: 'ready', value: categories })

interface Overrides {
  product?: ProductResponse
  categories?: Loadable<CategoryResponse[]>
}

function renderForm({ product = mouse, categories = ready(peripherals, monitors, accessories) }: Overrides = {}) {
  const handlers = {
    onRetryCategories: vi.fn(),
    onUpdated: vi.fn(),
    onOutdated: vi.fn(),
    onCancel: vi.fn(),
  }
  const user = userEvent.setup()
  render(<ProductEditForm product={product} categories={categories} {...handlers} />)
  return { ...handlers, user }
}

const save = () => screen.getByRole('button', { name: 'Guardar cambios' })
const putRequests = () => apiClient.request.mock.calls.filter(([, options]) => options?.method === 'PUT')
const rejectWith = (status: number, error: string, message: string, details?: { field: string; message: string }[]) =>
  apiClient.request.mockRejectedValueOnce(hostError(status, { error, message, details }))

describe('ProductEditForm', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('opening', () => {
    it('is a form titled "Editar producto"', () => {
      renderForm()

      expect(screen.getByRole('form', { name: 'Editar producto' })).toBeInTheDocument()
    })

    it('opens with the data of the product', () => {
      renderForm()

      expect(screen.getByLabelText('Nombre')).toHaveValue('Wireless mouse')
      expect(screen.getByLabelText('Precio')).toHaveValue('1234,56')
      expect(screen.getByLabelText('Categoría')).toHaveValue('c-1')
    })

    it.each([
      [1_250_050, '12500,50'],
      [700, '7'],
      [7, '0,07'],
    ])('shows %i minor units as the price text "%s"', (priceCents, text) => {
      renderForm({ product: { ...mouse, priceCents } })

      expect(screen.getByLabelText('Precio')).toHaveValue(text)
    })

    it('puts the cursor in the first field', () => {
      renderForm()

      expect(screen.getByLabelText('Nombre')).toHaveFocus()
    })

    it('offers only active categories', () => {
      renderForm()

      const options = [...screen.getByLabelText('Categoría').querySelectorAll('option')].map((option) => option.textContent)
      expect(options).toEqual(['Elige una categoría', 'Peripherals', 'Monitors'])
    })

    it('starts the category empty, and says why, when the current one is inactive', () => {
      renderForm({ product: { ...mouse, categoryId: accessories.categoryId } })

      const category = screen.getByLabelText('Categoría')
      expect(category).toHaveValue('')
      expect(category).toHaveAccessibleDescription('La categoría actual está inactiva. Elige una categoría activa.')
    })

    it('starts the category empty when the current one is not in the list at all', () => {
      renderForm({ product: { ...mouse, categoryId: 'c-404' } })

      expect(screen.getByLabelText('Categoría')).toHaveValue('')
    })

    it('does not say the category is inactive while the categories are still loading', () => {
      renderForm({ categories: { status: 'loading' } })

      expect(screen.getByLabelText('Categoría')).not.toHaveAccessibleDescription(/inactiva/)
    })

    it('requires choosing an active category before saving when the current one is inactive', async () => {
      const { user } = renderForm({ product: { ...mouse, categoryId: accessories.categoryId } })

      await user.click(save())

      expect(screen.getByLabelText('Categoría')).toHaveAccessibleDescription(
        expect.stringContaining('Elige una categoría.'),
      )
      expect(apiClient.request).not.toHaveBeenCalled()
    })

    it('stops saying the category is inactive once another one is chosen', async () => {
      const { user } = renderForm({ product: { ...mouse, categoryId: accessories.categoryId } })

      await user.selectOptions(screen.getByLabelText('Categoría'), 'Monitors')

      expect(screen.getByLabelText('Categoría')).not.toHaveAccessibleDescription(/inactiva/)
    })

    it('says the categories failed to load, and offers a retry', async () => {
      const { user, onRetryCategories } = renderForm({ categories: { status: 'error' } })

      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(onRetryCategories).toHaveBeenCalledOnce()
    })
  })

  describe('saving', () => {
    it('puts name, price in minor units and category, with no idempotency key and no stock', async () => {
      apiClient.request.mockResolvedValue({ ...mouse, name: 'Wireless mouse 2' })
      const { user } = renderForm()

      await user.clear(screen.getByLabelText('Nombre'))
      await user.type(screen.getByLabelText('Nombre'), '  Wireless mouse 2  ')
      await user.clear(screen.getByLabelText('Precio'))
      await user.type(screen.getByLabelText('Precio'), '999,5')
      await user.selectOptions(screen.getByLabelText('Categoría'), 'Monitors')
      await user.click(save())

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/p-1', {
        method: 'PUT',
        body: { name: 'Wireless mouse 2', priceCents: 99_950, categoryId: 'c-3' },
      })
    })

    it('hands the updated product to the page', async () => {
      const updated = { ...mouse, name: 'Wireless mouse 2' }
      apiClient.request.mockResolvedValue(updated)
      const { user, onUpdated } = renderForm()

      await user.click(save())

      expect(onUpdated).toHaveBeenCalledExactlyOnceWith(updated)
    })

    it('sends nothing, and shows each error next to its field, when the data is invalid', async () => {
      const { user } = renderForm()

      await user.clear(screen.getByLabelText('Nombre'))
      await user.clear(screen.getByLabelText('Precio'))
      await user.click(save())

      expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription(expect.stringContaining('Escribe el nombre'))
      expect(screen.getByLabelText('Precio')).toHaveAccessibleDescription(expect.stringContaining('Escribe el precio'))
      expect(screen.getByLabelText('Nombre')).toHaveFocus()
      expect(apiClient.request).not.toHaveBeenCalled()
    })

    it('says it is saving and blocks a second request while one is in flight', async () => {
      const answer = deferred<ProductResponse>()
      apiClient.request.mockReturnValue(answer.promise)
      const { user } = renderForm()

      await user.dblClick(save())

      expect(putRequests()).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    })
  })

  describe('when saving fails', () => {
    it('shows each 400 detail next to its field and focuses the first invalid one', async () => {
      rejectWith(400, 'VALIDATION_ERROR', 'Invalid', [
        { field: 'priceCents', message: 'must be positive' },
        { field: 'name', message: 'too long' },
      ])
      const { user } = renderForm()

      await user.click(save())

      expect(await screen.findByLabelText('Nombre')).toHaveAccessibleDescription(expect.stringContaining('too long'))
      expect(screen.getByLabelText('Precio')).toHaveAccessibleDescription(expect.stringContaining('must be positive'))
      expect(screen.getByLabelText('Nombre')).toHaveFocus()
    })

    it('keeps what the user typed', async () => {
      rejectWith(500, 'INTERNAL_ERROR', 'Something broke')
      const { user } = renderForm()
      await user.clear(screen.getByLabelText('Nombre'))
      await user.type(screen.getByLabelText('Nombre'), 'Changed')

      await user.click(save())

      await screen.findByRole('alert')
      expect(screen.getByLabelText('Nombre')).toHaveValue('Changed')
    })

    it('blames the category field on a 404 that is about the category', async () => {
      rejectWith(404, 'NOT_FOUND', 'Category not found or not active')
      const { user, onOutdated } = renderForm()

      await user.click(save())

      expect(await screen.findByLabelText('Categoría')).toHaveAccessibleDescription(
        'La categoría no existe o está inactiva. Elige otra.',
      )
      expect(screen.getByLabelText('Categoría')).toHaveFocus()
      expect(onOutdated).not.toHaveBeenCalled()
    })

    it('says the product no longer exists on a 404 that is about the product, and tells the page', async () => {
      rejectWith(404, 'NOT_FOUND', 'Product not found')
      const { user, onOutdated, onUpdated } = renderForm()

      await user.click(save())

      expect(await screen.findByRole('alert')).toHaveTextContent('El producto ya no existe')
      expect(onOutdated).toHaveBeenCalledOnce()
      expect(onUpdated).not.toHaveBeenCalled()
      expect(screen.getByRole('form', { name: 'Editar producto' })).toBeInTheDocument()
    })

    it.each([
      [403, 'FORBIDDEN', 'Role is not authorized', 'No tienes permiso para realizar esta acción.'],
      [500, 'INTERNAL_ERROR', 'Something broke', 'No se pudo actualizar el producto.'],
      [0, 'NETWORK_ERROR', 'Network error', 'No se pudo conectar con el servidor'],
    ])('shows a form alert on a %i and allows a retry with the same data', async (status, error, message, shown) => {
      rejectWith(status, error, message)
      apiClient.request.mockResolvedValueOnce(mouse)
      const { user, onUpdated } = renderForm()

      await user.click(save())
      expect(await screen.findByRole('alert')).toHaveTextContent(shown)
      expect(screen.getByRole('alert')).toHaveFocus()

      await user.click(save())

      expect(putRequests()).toHaveLength(2)
      expect(putRequests()[1][1]).toEqual(putRequests()[0][1])
      expect(onUpdated).toHaveBeenCalledOnce()
    })
  })

  describe('cancelling', () => {
    it('tells the page and sends nothing', async () => {
      const { user, onCancel } = renderForm()

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onCancel).toHaveBeenCalledOnce()
      expect(apiClient.request).not.toHaveBeenCalled()
    })
  })
})
