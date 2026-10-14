import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { deferred } from '../../test-doubles/productsFixtures'
import type { FormFailure, Result } from '../model/formFailure'
import { DeactivationDialog } from './DeactivationDialog'

const gone: FormFailure = { fieldErrors: {}, alert: { title: 'El producto ya no existe' }, outdated: true }
const broke: FormFailure = {
  fieldErrors: {},
  alert: { title: 'No se pudo desactivar el producto.', detail: 'Something broke' },
}

function renderDialog(request: () => Promise<Result<unknown>>) {
  const handlers = { onDeactivated: vi.fn(), onOutdated: vi.fn(), onCancel: vi.fn() }
  const user = userEvent.setup()
  render(
    <DeactivationDialog
      title={'¿Desactivar "Teclado"?'}
      message="El producto dejará de poder agregarse a nuevas ventas."
      request={request}
      {...handlers}
    />,
  )
  return { ...handlers, user }
}

const confirm = () => screen.getByRole('button', { name: 'Desactivar' })

describe('DeactivationDialog', () => {
  it('asks with the title and the message it is given, and offers Cancelar and Desactivar', () => {
    renderDialog(() => Promise.resolve({ ok: true, value: {} }))

    expect(screen.getByRole('dialog', { name: '¿Desactivar "Teclado"?' })).toHaveAccessibleDescription(
      'El producto dejará de poder agregarse a nuevas ventas.',
    )
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    expect(confirm()).toBeEnabled()
  })

  it('sends nothing until the user confirms', () => {
    const request = vi.fn()
    renderDialog(request)

    expect(request).not.toHaveBeenCalled()
  })

  it('tells the page when it was deactivated', async () => {
    const { user, onDeactivated } = renderDialog(() => Promise.resolve({ ok: true, value: {} }))

    await user.click(confirm())

    await waitFor(() => expect(onDeactivated).toHaveBeenCalledOnce())
  })

  it('disables both buttons while pending and sends one request for a double click', async () => {
    const answer = deferred<Result<unknown>>()
    const request = vi.fn(() => answer.promise)
    const { user } = renderDialog(request)

    await user.dblClick(confirm())

    expect(request).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Desactivando…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('stays open with the message when it fails, and allows a retry', async () => {
    const request = vi
      .fn<() => Promise<Result<unknown>>>()
      .mockResolvedValueOnce({ ok: false, failure: broke })
      .mockResolvedValueOnce({ ok: true, value: {} })
    const { user, onDeactivated, onCancel } = renderDialog(request)

    await user.click(confirm())

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo desactivar el producto.')
    expect(screen.getByRole('alert')).toHaveTextContent('Something broke')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onCancel).not.toHaveBeenCalled()

    await user.click(confirm())

    await waitFor(() => expect(onDeactivated).toHaveBeenCalledOnce())
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('shows the message and tells the page when the service says it no longer exists', async () => {
    const { user, onOutdated, onDeactivated } = renderDialog(() => Promise.resolve({ ok: false, failure: gone }))

    await user.click(confirm())

    expect(await screen.findByRole('alert')).toHaveTextContent('El producto ya no existe')
    expect(onOutdated).toHaveBeenCalledOnce()
    expect(onDeactivated).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes with Cancelar and with Escape, and sends nothing', async () => {
    const request = vi.fn()
    const { user, onCancel } = renderDialog(request)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledTimes(2)
    expect(request).not.toHaveBeenCalled()
  })

  it('clears an earlier error while the next attempt is in flight', async () => {
    const answer = deferred<Result<unknown>>()
    const request = vi
      .fn<() => Promise<Result<unknown>>>()
      .mockResolvedValueOnce({ ok: false, failure: broke })
      .mockReturnValueOnce(answer.promise)
    const { user } = renderDialog(request)
    await user.click(confirm())
    await screen.findByRole('alert')

    await user.click(confirm())

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
