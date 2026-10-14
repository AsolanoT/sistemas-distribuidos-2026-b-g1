import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { deferred, peripherals } from '../../test-doubles/productsFixtures'
import type { CategoryResponse } from '../model/category'
import { CategoryCreateForm } from './CategoryCreateForm'
import { CategoryRenameForm } from './CategoryRenameForm'

const rejectWith = (status: number, error: string, message: string, details?: { field: string; message: string }[]) =>
  apiClient.request.mockRejectedValueOnce(hostError(status, { error, message, details }))
const duplicate = () =>
  rejectWith(422, 'BUSINESS_RULE_VIOLATION', 'An active category with this name already exists', [
    { field: 'name', message: 'already used by an active category' },
  ])

const name = () => screen.getByLabelText('Nombre')
const postRequests = () => apiClient.request.mock.calls.filter(([, options]) => options?.method === 'POST')
const putRequests = () => apiClient.request.mock.calls.filter(([, options]) => options?.method === 'PUT')

describe('category forms', () => {
  let nextKey: number

  beforeEach(() => {
    apiClient.request.mockReset()
    nextKey = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `key-${++nextKey}` as ReturnType<typeof crypto.randomUUID>)
  })

  afterEach(() => vi.restoreAllMocks())

  describe('CategoryCreateForm', () => {
    function renderForm() {
      const handlers = { onCreated: vi.fn(), onCancel: vi.fn() }
      const user = userEvent.setup()
      render(<CategoryCreateForm {...handlers} />)
      return { ...handlers, user }
    }
    const submit = () => screen.getByRole('button', { name: 'Crear categoría' })

    it('is a form titled "Nueva categoría" with the cursor in the name', () => {
      renderForm()

      expect(screen.getByRole('form', { name: 'Nueva categoría' })).toBeInTheDocument()
      expect(name()).toHaveFocus()
      expect(name()).toHaveValue('')
      expect(name()).toHaveAccessibleDescription('Entre 1 y 100 caracteres.')
    })

    it('posts the trimmed name with an idempotency key and hands the category to the page', async () => {
      apiClient.request.mockResolvedValue(peripherals)
      const { user, onCreated } = renderForm()

      await user.type(name(), '  Peripherals ')
      await user.click(submit())

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/categories', {
        method: 'POST',
        body: { name: 'Peripherals' },
        idempotencyKey: 'key-1',
      })
      expect(onCreated).toHaveBeenCalledExactlyOnceWith(peripherals)
    })

    it.each([
      ['', 'Escribe el nombre de la categoría.'],
      ['   ', 'Escribe el nombre de la categoría.'],
      ['a'.repeat(101), 'El nombre no puede superar los 100 caracteres.'],
    ])('sends nothing for the name "%s" and says why next to the field', async (typed, message) => {
      const { user } = renderForm()

      if (typed) await user.type(name(), typed)
      await user.click(submit())

      expect(name()).toHaveAccessibleDescription(expect.stringContaining(message))
      expect(name()).toHaveFocus()
      expect(apiClient.request).not.toHaveBeenCalled()
    })

    it('shows a duplicate name on the field and keeps what was typed', async () => {
      duplicate()
      const { user, onCreated } = renderForm()

      await user.type(name(), 'Peripherals')
      await user.click(submit())

      expect(await screen.findByLabelText('Nombre')).toHaveAccessibleDescription(
        expect.stringContaining('Ya existe una categoría activa con ese nombre.'),
      )
      expect(name()).toHaveValue('Peripherals')
      expect(name()).toHaveFocus()
      expect(onCreated).not.toHaveBeenCalled()
    })

    it('reuses the key when the same name is sent again after a dropped response', async () => {
      rejectWith(0, 'NETWORK_ERROR', 'Network error')
      apiClient.request.mockResolvedValueOnce(peripherals)
      const { user, onCreated } = renderForm()
      await user.type(name(), 'Peripherals')

      await user.click(submit())
      await screen.findByRole('alert')
      await user.click(submit())

      expect(postRequests().map(([, options]) => options?.idempotencyKey)).toEqual(['key-1', 'key-1'])
      expect(onCreated).toHaveBeenCalledOnce()
    })

    it('starts a new intent with a new key when the name changes', async () => {
      rejectWith(0, 'NETWORK_ERROR', 'Network error')
      apiClient.request.mockResolvedValueOnce(peripherals)
      const { user } = renderForm()
      await user.type(name(), 'Peripherals')
      await user.click(submit())
      await screen.findByRole('alert')

      await user.type(name(), ' 2')
      await user.click(submit())

      expect(postRequests().map(([, options]) => options?.idempotencyKey)).toEqual(['key-1', 'key-2'])
    })

    it('sends one request for a double click and says it is working', async () => {
      apiClient.request.mockReturnValue(deferred<CategoryResponse>().promise)
      const { user } = renderForm()
      await user.type(name(), 'Peripherals')

      await user.dblClick(submit())

      expect(postRequests()).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Creando…' })).toBeDisabled()
    })

    it('shows other failures as a form alert and allows a retry', async () => {
      rejectWith(500, 'INTERNAL_ERROR', 'Something broke')
      const { user } = renderForm()
      await user.type(name(), 'Peripherals')

      await user.click(submit())

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo crear la categoría.')
      expect(screen.getByRole('alert')).toHaveTextContent('Something broke')
      expect(submit()).toBeEnabled()
    })

    it('cancels without sending anything', async () => {
      const { user, onCancel } = renderForm()

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onCancel).toHaveBeenCalledOnce()
      expect(apiClient.request).not.toHaveBeenCalled()
    })
  })

  describe('CategoryRenameForm', () => {
    function renderForm() {
      const handlers = { onRenamed: vi.fn(), onOutdated: vi.fn(), onCancel: vi.fn() }
      const user = userEvent.setup()
      render(<CategoryRenameForm category={peripherals} {...handlers} />)
      return { ...handlers, user }
    }
    const submit = () => screen.getByRole('button', { name: 'Guardar nombre' })

    it('is a form titled "Renombrar categoría", prefilled with the current name', () => {
      renderForm()

      expect(screen.getByRole('form', { name: 'Renombrar categoría' })).toBeInTheDocument()
      expect(name()).toHaveValue('Peripherals')
      expect(name()).toHaveFocus()
    })

    it('puts the trimmed name with no idempotency key and hands the category to the page', async () => {
      const renamed = { ...peripherals, name: 'Periféricos' }
      apiClient.request.mockResolvedValue(renamed)
      const { user, onRenamed } = renderForm()

      await user.clear(name())
      await user.type(name(), ' Periféricos ')
      await user.click(submit())

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/categories/c-1', {
        method: 'PUT',
        body: { name: 'Periféricos' },
      })
      expect(onRenamed).toHaveBeenCalledExactlyOnceWith(renamed)
    })

    it('shows a duplicate name on the field', async () => {
      duplicate()
      const { user } = renderForm()

      await user.click(submit())

      expect(await screen.findByLabelText('Nombre')).toHaveAccessibleDescription(
        expect.stringContaining('Ya existe una categoría activa con ese nombre.'),
      )
    })

    it('says the category no longer exists on a 404, and tells the page', async () => {
      rejectWith(404, 'NOT_FOUND', 'Category not found')
      const { user, onOutdated, onRenamed } = renderForm()

      await user.click(submit())

      expect(await screen.findByRole('alert')).toHaveTextContent('La categoría ya no existe')
      expect(onOutdated).toHaveBeenCalledOnce()
      expect(onRenamed).not.toHaveBeenCalled()
    })

    it('sends one request for a double click', async () => {
      apiClient.request.mockReturnValue(deferred<CategoryResponse>().promise)
      const { user } = renderForm()

      await user.dblClick(submit())

      expect(putRequests()).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled()
    })

    it('cancels without sending anything', async () => {
      const { user, onCancel } = renderForm()

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onCancel).toHaveBeenCalledOnce()
      expect(apiClient.request).not.toHaveBeenCalled()
    })
  })
})
