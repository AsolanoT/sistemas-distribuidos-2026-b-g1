import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { deferred, mouse } from '../../test-doubles/productsFixtures'
import type { ProductResponse } from '../model/product'
import type { StockAdjustmentResponse } from '../model/stockAdjustmentResponse'
import { StockAdjustmentForm } from './StockAdjustmentForm'

// Wireless mouse, stock 7.
const adjustment: StockAdjustmentResponse = {
  adjustmentId: 'a-1',
  productId: 'p-1',
  delta: 5,
  reason: 'Reposición',
  adjustedBy: 'u-1',
  adjustedAt: '2026-10-10T10:00:00Z',
  currentStock: 12,
}

function renderForm(product: ProductResponse = mouse) {
  const handlers = { onAdjusted: vi.fn(), onOutdated: vi.fn(), onCancel: vi.fn() }
  const user = userEvent.setup()
  const view = render(<StockAdjustmentForm product={product} {...handlers} />)
  return { ...handlers, user, ...view }
}

const submit = () => screen.getByRole('button', { name: 'Ajustar stock' })
const quantity = () => screen.getByLabelText('Cantidad a ajustar')
const reason = () => screen.getByLabelText('Motivo')
const postRequests = () => apiClient.request.mock.calls.filter(([, options]) => options?.method === 'POST')
const keysSent = () => postRequests().map(([, options]) => options?.idempotencyKey)
const rejectWith = (status: number, error: string, message: string, details?: { field: string; message: string }[]) =>
  apiClient.request.mockRejectedValueOnce(hostError(status, { error, message, details }))

describe('StockAdjustmentForm', () => {
  let nextKey: number

  beforeEach(() => {
    apiClient.request.mockReset()
    nextKey = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `key-${++nextKey}` as ReturnType<typeof crypto.randomUUID>)
  })

  afterEach(() => vi.restoreAllMocks())

  describe('what it shows', () => {
    it('is a form titled "Ajustar stock"', () => {
      renderForm()

      expect(screen.getByRole('form', { name: 'Ajustar stock' })).toBeInTheDocument()
    })

    it('shows the product name and its current stock as read-only text', () => {
      renderForm()

      expect(screen.getByText('Producto')).toBeInTheDocument()
      expect(screen.getByText('Wireless mouse')).toBeInTheDocument()
      expect(screen.getByText('Stock actual')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('Wireless mouse').closest('input')).toBeNull()
    })

    it('has the quantity and the reason, with the cursor in the quantity', () => {
      renderForm()

      expect(quantity()).toHaveFocus()
      expect(reason()).toBeInTheDocument()
    })

    it('shows nothing about the resulting stock until there is a valid quantity', () => {
      renderForm()

      expect(screen.queryByText(/Quedará en/)).not.toBeInTheDocument()
    })
  })

  describe('as the user types', () => {
    it.each([
      ['5', 'Quedará en: 12'],
      ['+5', 'Quedará en: 12'],
      ['-3', 'Quedará en: 4'],
      ['-7', 'Quedará en: 0'],
    ])('shows the resulting stock for "%s"', async (text, shown) => {
      const { user } = renderForm()

      await user.type(quantity(), text)

      expect(screen.getByText(shown)).toBeInTheDocument()
    })

    it('announces the resulting stock politely', async () => {
      const { user } = renderForm()

      await user.type(quantity(), '5')

      expect(screen.getByText('Quedará en: 12')).toHaveAttribute('role', 'status')
    })

    it('says at once that a negative quantity larger than the stock cannot be taken, and sends nothing', async () => {
      const { user } = renderForm()

      await user.type(quantity(), '-8')

      expect(quantity()).toBeInvalid()
      expect(quantity()).toHaveAccessibleDescription(
        expect.stringContaining('No puedes descontar más unidades de las que hay en stock.'),
      )
      expect(screen.queryByText(/Quedará en/)).not.toBeInTheDocument()

      await user.type(reason(), 'Daño')
      await user.click(submit())
      expect(apiClient.request).not.toHaveBeenCalled()
    })

    it.each([
      ['0', 'La cantidad no puede ser 0.'],
      ['1.5', 'Escribe un número entero'],
      ['abc', 'Escribe un número entero'],
    ])('says at once what is wrong with "%s"', async (text, message) => {
      const { user } = renderForm()

      await user.type(quantity(), text)

      expect(quantity()).toHaveAccessibleDescription(expect.stringContaining(message))
    })

    it('stays quiet about an empty quantity until the user submits', () => {
      renderForm()

      expect(quantity()).toBeValid()
    })

    it('clears the error once the quantity is fixed', async () => {
      const { user } = renderForm()
      await user.type(quantity(), '-8')

      await user.clear(quantity())
      await user.type(quantity(), '-2')

      expect(quantity()).toBeValid()
      expect(screen.getByText('Quedará en: 5')).toBeInTheDocument()
    })
  })

  describe('submitting', () => {
    it('posts the delta and the trimmed reason with an idempotency key', async () => {
      apiClient.request.mockResolvedValue(adjustment)
      const { user } = renderForm()

      await user.type(quantity(), '+5')
      await user.type(reason(), '  Reposición  ')
      await user.click(submit())

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/p-1/stock-adjustments', {
        method: 'POST',
        body: { delta: 5, reason: 'Reposición' },
        idempotencyKey: 'key-1',
      })
    })

    it('hands the adjustment to the page on success', async () => {
      apiClient.request.mockResolvedValue(adjustment)
      const { user, onAdjusted } = renderForm()

      await user.type(quantity(), '5')
      await user.type(reason(), 'Reposición')
      await user.click(submit())

      expect(onAdjusted).toHaveBeenCalledExactlyOnceWith(adjustment)
    })

    it('shows the error next to each field that is empty or invalid, and sends nothing', async () => {
      const { user } = renderForm()

      await user.click(submit())

      expect(quantity()).toHaveAccessibleDescription(expect.stringContaining('Escribe la cantidad a ajustar.'))
      expect(reason()).toHaveAccessibleDescription(expect.stringContaining('Escribe el motivo del ajuste.'))
      expect(quantity()).toHaveFocus()
      expect(apiClient.request).not.toHaveBeenCalled()
    })

    it('blocks a second request while one is in flight, and says it is working', async () => {
      const answer = deferred<StockAdjustmentResponse>()
      apiClient.request.mockReturnValue(answer.promise)
      const { user } = renderForm()
      await user.type(quantity(), '5')
      await user.type(reason(), 'Reposición')

      await user.dblClick(submit())

      expect(postRequests()).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Ajustando…' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    })
  })

  describe('one key per intent', () => {
    it('reuses the key when the same data is sent again after a dropped response', async () => {
      rejectWith(0, 'NETWORK_ERROR', 'Network error')
      apiClient.request.mockResolvedValueOnce(adjustment)
      const { user, onAdjusted } = renderForm()
      await user.type(quantity(), '5')
      await user.type(reason(), 'Reposición')

      await user.click(submit())
      await screen.findByRole('alert')
      await user.click(submit())

      expect(keysSent()).toEqual(['key-1', 'key-1'])
      expect(onAdjusted).toHaveBeenCalledOnce()
    })

    it('treats "+5" and "5" as the same data', async () => {
      rejectWith(0, 'NETWORK_ERROR', 'Network error')
      apiClient.request.mockResolvedValueOnce(adjustment)
      const { user } = renderForm()
      await user.type(quantity(), '5')
      await user.type(reason(), 'Reposición')
      await user.click(submit())
      await screen.findByRole('alert')

      await user.clear(quantity())
      await user.type(quantity(), '+5')
      await user.click(submit())

      expect(keysSent()).toEqual(['key-1', 'key-1'])
    })

    it('treats a reason that differs only in surrounding spaces as the same data', async () => {
      rejectWith(0, 'NETWORK_ERROR', 'Network error')
      apiClient.request.mockResolvedValueOnce(adjustment)
      const { user } = renderForm()
      await user.type(quantity(), '5')
      await user.type(reason(), 'Reposición')
      await user.click(submit())
      await screen.findByRole('alert')

      await user.type(reason(), '  ')
      await user.click(submit())

      expect(keysSent()).toEqual(['key-1', 'key-1'])
    })

    it.each([
      ['quantity', async (user: ReturnType<typeof userEvent.setup>) => user.type(quantity(), '0')],
      ['reason', async (user: ReturnType<typeof userEvent.setup>) => user.type(reason(), ' y más')],
    ])('starts a new intent with a new key when the %s changes', async (_field, change) => {
      rejectWith(0, 'NETWORK_ERROR', 'Network error')
      apiClient.request.mockResolvedValueOnce({ ...adjustment, delta: 50 })
      const { user } = renderForm()
      await user.type(quantity(), '5')
      await user.type(reason(), 'Reposición')
      await user.click(submit())
      await screen.findByRole('alert')

      await change(user)
      await user.click(submit())

      expect(keysSent()).toEqual(['key-1', 'key-2'])
    })

    it('accepts the idempotent replay as a success, like the first answer', async () => {
      apiClient.request.mockResolvedValue(adjustment)
      const { user, onAdjusted } = renderForm()
      await user.type(quantity(), '5')
      await user.type(reason(), 'Reposición')

      await user.click(submit())

      expect(onAdjusted).toHaveBeenCalledOnce()
    })
  })

  describe('when the service refuses', () => {
    async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
      await user.type(quantity(), '-3')
      await user.type(reason(), 'Daño')
      await user.click(submit())
    }

    it('shows a 422 on the quantity field: the stock changed meanwhile', async () => {
      rejectWith(422, 'BUSINESS_RULE_VIOLATION', 'The adjustment would take stock below 0', [
        { field: 'delta', message: 'exceeds the current stock' },
      ])
      const { user, onOutdated } = renderForm()

      await fillAndSubmit(user)

      expect(await screen.findByLabelText('Cantidad a ajustar')).toHaveAccessibleDescription(
        expect.stringContaining('El stock cambió'),
      )
      expect(quantity()).toHaveFocus()
      expect(onOutdated).toHaveBeenCalledOnce()
    })

    it('keeps what the user typed and clears the server error when the quantity is edited', async () => {
      rejectWith(422, 'BUSINESS_RULE_VIOLATION', 'Below 0', [{ field: 'delta', message: 'exceeds' }])
      const { user } = renderForm()
      await fillAndSubmit(user)
      await screen.findByLabelText('Cantidad a ajustar')

      expect(quantity()).toHaveValue('-3')
      expect(reason()).toHaveValue('Daño')

      await user.type(quantity(), '0')
      expect(quantity()).not.toHaveAccessibleDescription(/El stock cambió/)
    })

    it('shows each 400 detail on its own field', async () => {
      rejectWith(400, 'VALIDATION_ERROR', 'Invalid', [{ field: 'reason', message: 'too long' }])
      const { user } = renderForm()

      await fillAndSubmit(user)

      expect(await screen.findByLabelText('Motivo')).toHaveAccessibleDescription(expect.stringContaining('too long'))
    })

    it('says the product no longer exists on a 404, and tells the page', async () => {
      rejectWith(404, 'NOT_FOUND', 'Product not found')
      const { user, onOutdated, onAdjusted } = renderForm()

      await fillAndSubmit(user)

      expect(await screen.findByRole('alert')).toHaveTextContent('El producto ya no existe')
      expect(onOutdated).toHaveBeenCalledOnce()
      expect(onAdjusted).not.toHaveBeenCalled()
    })

    it.each([
      [403, 'FORBIDDEN', 'Role is not authorized', 'No tienes permiso para realizar esta acción.'],
      [500, 'INTERNAL_ERROR', 'Something broke', 'No se pudo ajustar el stock.'],
    ])('shows a form alert on a %i and keeps the data', async (status, error, message, shown) => {
      rejectWith(status, error, message)
      const { user } = renderForm()

      await fillAndSubmit(user)

      expect(await screen.findByRole('alert')).toHaveTextContent(shown)
      expect(quantity()).toHaveValue('-3')
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

  describe('when the stock of the product changes under the form', () => {
    it('shows the new current stock and recomputes the result', async () => {
      const { user, rerender, onAdjusted, onOutdated, onCancel } = renderForm()
      await user.type(quantity(), '-3')

      rerender(
        <StockAdjustmentForm
          product={{ ...mouse, stock: 2 }}
          onAdjusted={onAdjusted}
          onOutdated={onOutdated}
          onCancel={onCancel}
        />,
      )

      expect(screen.getByText('2')).toBeInTheDocument()
      expect(quantity()).toBeInvalid()
    })
  })
})
