import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { accessories, deferred, mouse, peripherals } from '../../test-doubles/productsFixtures'
import type { CategoryResponse } from '../model/category'
import { ProductRegistrationForm } from './ProductRegistrationForm'

type Props = ComponentProps<typeof ProductRegistrationForm>

const monitors: CategoryResponse = { categoryId: 'c-3', name: 'Monitors', active: true }

function renderForm(overrides: Partial<Props> = {}) {
  const props: Props = {
    categories: { status: 'ready', value: [peripherals, accessories, monitors] },
    onRetryCategories: vi.fn(),
    onRegistered: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
  render(<ProductRegistrationForm {...props} />)
  return { ...props, user: userEvent.setup() }
}

type User = ReturnType<typeof userEvent.setup>

async function fillValid(user: User, price = '12,5') {
  await user.type(screen.getByLabelText('Nombre'), 'Wireless mouse')
  await user.type(screen.getByLabelText('Precio'), price)
  await user.selectOptions(screen.getByLabelText('Categoría'), 'Peripherals')
}

const submitButton = () => screen.getByRole('button', { name: /Registrar producto|Registrando/ })

function idempotencyKeys() {
  return apiClient.request.mock.calls.map(([, options]) => options?.idempotencyKey)
}

describe('ProductRegistrationForm', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('the fields', () => {
    it('is a form named after its title, with one label per field', () => {
      renderForm()

      expect(screen.getByRole('form', { name: 'Nuevo producto' })).toBeInTheDocument()
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
      expect(screen.getByLabelText('Precio')).toBeInTheDocument()
      expect(screen.getByLabelText('Categoría')).toBeInTheDocument()
    })

    it('describes the name and price with their hints', () => {
      renderForm()

      expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription('Entre 1 y 150 caracteres.')
      expect(screen.getByLabelText('Precio')).toHaveAccessibleDescription(
        'En pesos, sin separador de miles. Ejemplo: 12500,50',
      )
    })

    it('puts the cursor in the name field when it opens', () => {
      renderForm()

      expect(screen.getByLabelText('Nombre')).toHaveFocus()
    })

    it('offers the decimal keyboard for the price', () => {
      renderForm()

      expect(screen.getByLabelText('Precio')).toHaveAttribute('inputmode', 'decimal')
    })

    it('offers only the active categories', () => {
      renderForm()

      const options = within(screen.getByLabelText('Categoría')).getAllByRole('option')

      expect(options.map((option) => option.textContent)).toEqual(['Elige una categoría', 'Peripherals', 'Monitors'])
    })

    it('has no stock field: a new product starts with stock 0', () => {
      renderForm()

      expect(screen.queryByLabelText(/stock/i)).not.toBeInTheDocument()
    })
  })

  describe('categories that are not ready', () => {
    it('shows a loading option in the category while they load', () => {
      renderForm({ categories: { status: 'loading' } })

      const select = screen.getByLabelText('Categoría')
      expect(select).toHaveValue('')
      expect(within(select).getByRole('option', { name: 'Cargando categorías…' })).toBeInTheDocument()
    })

    it('says on the category field that they failed to load, and offers a retry', async () => {
      const { onRetryCategories, user } = renderForm({ categories: { status: 'error' } })

      expect(screen.getByLabelText('Categoría')).toHaveAccessibleDescription(
        'No se pudieron cargar las categorías.',
      )
      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(onRetryCategories).toHaveBeenCalledOnce()
    })

    it('says so when there is no active category to choose', () => {
      renderForm({ categories: { status: 'ready', value: [accessories] } })

      expect(screen.getByLabelText('Categoría')).toHaveAccessibleDescription(
        'No hay categorías activas. Crea una antes de registrar productos.',
      )
    })

    it('does not send anything while the category cannot be chosen', async () => {
      const { user } = renderForm({ categories: { status: 'error' } })

      await user.type(screen.getByLabelText('Nombre'), 'Wireless mouse')
      await user.type(screen.getByLabelText('Precio'), '10')
      await user.click(submitButton())

      expect(apiClient.request).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Categoría')).toHaveFocus()
    })
  })

  describe('a submission that is not valid', () => {
    it('shows each error next to its field, linked with aria-describedby, and sends nothing', async () => {
      const { user } = renderForm()

      await user.click(submitButton())

      const name = screen.getByLabelText('Nombre')
      expect(name).toBeInvalid()
      expect(name).toHaveAccessibleDescription(expect.stringContaining('Escribe el nombre del producto.'))
      const price = screen.getByLabelText('Precio')
      expect(price).toBeInvalid()
      expect(price).toHaveAccessibleDescription(expect.stringContaining('Escribe el precio.'))
      const category = screen.getByLabelText('Categoría')
      expect(category).toBeInvalid()
      expect(category).toHaveAccessibleDescription(expect.stringContaining('Elige una categoría.'))
      expect(apiClient.request).not.toHaveBeenCalled()
    })

    it('keeps the hint in the description next to the error', async () => {
      const { user } = renderForm()

      await user.click(submitButton())

      expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription(
        'Entre 1 y 150 caracteres. Escribe el nombre del producto.',
      )
    })

    it('moves focus to the first invalid field', async () => {
      const { user } = renderForm()
      await user.type(screen.getByLabelText('Nombre'), 'Wireless mouse')

      await user.click(submitButton())

      expect(screen.getByLabelText('Precio')).toHaveFocus()
    })

    it('moves focus to the name when it is the first invalid field', async () => {
      const { user } = renderForm()
      await user.click(screen.getByLabelText('Precio'))

      await user.click(submitButton())

      expect(screen.getByLabelText('Nombre')).toHaveFocus()
    })

    it.each([
      ['0', 'El precio debe ser mayor que cero.'],
      ['abc', /Escribe solo números/],
      ['1.234', /sin separador de miles/],
    ])('rejects the price "%s" with a clear message and sends nothing', async (price, message) => {
      const { user } = renderForm()
      await fillValid(user, price)

      await user.click(submitButton())

      expect(screen.getByLabelText('Precio')).toHaveAccessibleDescription(expect.stringMatching(message))
      expect(apiClient.request).not.toHaveBeenCalled()
    })

    it('clears the error of a field as soon as the user edits it', async () => {
      const { user } = renderForm()
      await user.click(submitButton())

      await user.type(screen.getByLabelText('Nombre'), 'W')

      expect(screen.getByLabelText('Nombre')).toBeValid()
      expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription('Entre 1 y 150 caracteres.')
      expect(screen.getByLabelText('Precio')).toBeInvalid()
    })
  })

  describe('a valid submission', () => {
    it('sends the product with the price in minor units and an idempotency key', async () => {
      apiClient.request.mockResolvedValue(mouse)
      const { user } = renderForm()

      await fillValid(user, '12,5')
      await user.click(submitButton())

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products', {
        method: 'POST',
        body: { name: 'Wireless mouse', priceCents: 1250, categoryId: 'c-1' },
        idempotencyKey: expect.any(String),
      })
    })

    it('trims the name before sending it', async () => {
      apiClient.request.mockResolvedValue(mouse)
      const { user } = renderForm()
      await fillValid(user)
      await user.type(screen.getByLabelText('Nombre'), '   ')

      await user.click(submitButton())

      expect(apiClient.request.mock.lastCall?.[1]?.body).toMatchObject({ name: 'Wireless mouse' })
    })

    it('reports the registered product', async () => {
      apiClient.request.mockResolvedValue(mouse)
      const { user, onRegistered } = renderForm()
      await fillValid(user)

      await user.click(submitButton())

      expect(onRegistered).toHaveBeenCalledExactlyOnceWith(mouse)
    })

    it('disables the submit button while the request is pending, and sends one request for a double click', async () => {
      const answer = deferred<typeof mouse>()
      apiClient.request.mockReturnValue(answer.promise)
      const { user } = renderForm()
      await fillValid(user)

      await user.dblClick(submitButton())

      expect(submitButton()).toBeDisabled()
      expect(submitButton()).toHaveTextContent('Registrando…')
      expect(apiClient.request).toHaveBeenCalledOnce()
    })

    it('does not let the user cancel while the request is pending', async () => {
      apiClient.request.mockReturnValue(deferred<typeof mouse>().promise)
      const { user } = renderForm()
      await fillValid(user)

      await user.click(submitButton())

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    })
  })

  describe('a submission the service rejects', () => {
    it('shows the 400 messages next to the fields they name and focuses the first', async () => {
      apiClient.request.mockRejectedValue(
        hostError(400, {
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'priceCents', message: 'must be at least 1' },
            { field: 'categoryId', message: 'must be a UUID' },
          ],
        }),
      )
      const { user } = renderForm()
      await fillValid(user)

      await user.click(submitButton())

      expect(await screen.findByLabelText('Precio')).toHaveAccessibleDescription(
        expect.stringContaining('must be at least 1'),
      )
      expect(screen.getByLabelText('Categoría')).toHaveAccessibleDescription(
        expect.stringContaining('must be a UUID'),
      )
      expect(screen.getByLabelText('Precio')).toHaveFocus()
    })

    it('shows the 404 on the category field and focuses it', async () => {
      apiClient.request.mockRejectedValue(hostError(404, { error: 'NOT_FOUND', message: 'Resource not found' }))
      const { user } = renderForm()
      await fillValid(user)

      await user.click(submitButton())

      expect(await screen.findByLabelText('Categoría')).toHaveAccessibleDescription(
        'La categoría no existe o está inactiva. Elige otra.',
      )
      expect(screen.getByLabelText('Categoría')).toHaveFocus()
    })

    it.each([
      ['422', hostError(422, { error: 'BUSINESS_RULE_VIOLATION', message: 'The product breaks a rule' }), 'The product breaks a rule'],
      ['a lost connection', hostError(0, { error: 'NETWORK_ERROR', message: 'Network error' }), null],
    ])('shows an alert for the form on %s, keeps the data and lets the user retry', async (_label, error, detail) => {
      apiClient.request.mockRejectedValue(error)
      const { user } = renderForm()
      await fillValid(user)

      await user.click(submitButton())

      const alert = await screen.findByRole('alert')
      if (detail) expect(alert).toHaveTextContent(detail)
      expect(alert).toHaveFocus()
      expect(screen.getByLabelText('Nombre')).toHaveValue('Wireless mouse')
      expect(screen.getByLabelText('Precio')).toHaveValue('12,5')
      expect(screen.getByLabelText('Categoría')).toHaveValue('c-1')
      expect(submitButton()).toBeEnabled()
    })

    it('says the server could not be reached on status 0', async () => {
      apiClient.request.mockRejectedValue(hostError(0, { error: 'NETWORK_ERROR', message: 'Network error' }))
      const { user } = renderForm()
      await fillValid(user)

      await user.click(submitButton())

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.')
    })

    it('removes the alert when the user submits again', async () => {
      apiClient.request.mockRejectedValueOnce(hostError(422, { error: 'BUSINESS_RULE_VIOLATION', message: 'No' }))
      apiClient.request.mockReturnValue(deferred<typeof mouse>().promise)
      const { user } = renderForm()
      await fillValid(user)
      await user.click(submitButton())
      await screen.findByRole('alert')

      await user.click(submitButton())

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('repeats the same submission with the same key, and sends a new key once the data changes', async () => {
      apiClient.request.mockRejectedValue(hostError(0, { error: 'NETWORK_ERROR', message: 'Network error' }))
      const { user } = renderForm()
      await fillValid(user)

      await user.click(submitButton())
      await screen.findByRole('alert')
      await user.click(submitButton())
      await screen.findByRole('alert')
      await user.type(screen.getByLabelText('Precio'), '5')
      await user.click(submitButton())
      await screen.findByRole('alert')

      const [first, second, third] = idempotencyKeys()
      expect(second).toBe(first)
      expect(third).not.toBe(first)
    })
  })

  describe('cancelling', () => {
    it('asks the page to close the form', async () => {
      const { user, onCancel } = renderForm()

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onCancel).toHaveBeenCalledOnce()
    })
  })
})
