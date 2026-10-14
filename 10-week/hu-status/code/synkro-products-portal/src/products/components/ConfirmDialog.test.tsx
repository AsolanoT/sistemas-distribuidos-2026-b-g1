import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ConfirmDialog } from './ConfirmDialog'

interface Overrides {
  isPending?: boolean
  error?: { title: string; detail?: string } | null
  onCancel?: () => void
  onConfirm?: () => void
}

function dialog({ isPending = false, error = null, onCancel = () => {}, onConfirm = () => {} }: Overrides = {}) {
  return (
    <ConfirmDialog
      title={'¿Desactivar "Teclado"?'}
      message="El producto dejará de poder agregarse a nuevas ventas."
      cancelLabel="Cancelar"
      confirmLabel="Desactivar"
      pendingLabel="Desactivando…"
      isPending={isPending}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

// A page with something behind the dialog, and the control that opens it.
function Harness({ onConfirm = () => {} }: { onConfirm?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <main data-testid="page">
        <button onClick={() => setOpen(true)}>Abrir</button>
        <button>Otro control</button>
      </main>
      {open && dialog({ onCancel: () => setOpen(false), onConfirm })}
    </>
  )
}

describe('ConfirmDialog', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  describe('what it says', () => {
    it('is a modal dialog labelled by its title and described by its message', () => {
      render(dialog())

      const modal = screen.getByRole('dialog', { name: '¿Desactivar "Teclado"?' })
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAccessibleDescription('El producto dejará de poder agregarse a nuevas ventas.')
    })

    it('offers the two choices', () => {
      render(dialog())

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Desactivar' })).toBeEnabled()
    })

    it('shows no error until there is one', () => {
      render(dialog())

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('shows the error with its detail and stays open for a retry', () => {
      render(dialog({ error: { title: 'No se pudo desactivar el producto.', detail: 'Something broke' } }))

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('No se pudo desactivar el producto.')
      expect(alert).toHaveTextContent('Something broke')
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Desactivar' })).toBeEnabled()
    })

    it('shows an error without a detail', () => {
      render(dialog({ error: { title: 'El producto ya no existe' } }))

      expect(screen.getByRole('alert')).toHaveTextContent('El producto ya no existe')
    })
  })

  describe('choosing', () => {
    it('calls onConfirm when the user confirms', async () => {
      const onConfirm = vi.fn()
      render(dialog({ onConfirm }))

      await userEvent.click(screen.getByRole('button', { name: 'Desactivar' }))

      expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('calls onCancel when the user cancels', async () => {
      const onCancel = vi.fn()
      render(dialog({ onCancel }))

      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onCancel).toHaveBeenCalledOnce()
    })

    it('closes with Escape', async () => {
      const onCancel = vi.fn()
      render(dialog({ onCancel }))

      await userEvent.keyboard('{Escape}')

      expect(onCancel).toHaveBeenCalledOnce()
    })

    it('does not close with a click on the backdrop', async () => {
      const onCancel = vi.fn()
      render(dialog({ onCancel }))

      await userEvent.click(screen.getByTestId('confirm-backdrop'))

      expect(onCancel).not.toHaveBeenCalled()
    })
  })

  describe('while the request is pending', () => {
    it('disables both buttons and says it is working', () => {
      render(dialog({ isPending: true }))

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Desactivando…' })).toBeDisabled()
    })

    it('does not close with Escape', async () => {
      const onCancel = vi.fn()
      render(dialog({ isPending: true, onCancel }))

      await userEvent.keyboard('{Escape}')

      expect(onCancel).not.toHaveBeenCalled()
    })

    it('keeps the focus inside the dialog when the focused button becomes disabled', async () => {
      const { rerender } = render(dialog())
      await userEvent.click(screen.getByRole('button', { name: 'Desactivar' }))

      rerender(dialog({ isPending: true }))

      expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
      expect(document.activeElement).not.toBe(document.body)
    })

    it('puts the focus back on Cancelar when the request fails', () => {
      const { rerender } = render(dialog({ isPending: true }))

      rerender(dialog({ error: { title: 'No se pudo' } }))

      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    })
  })

  describe('focus', () => {
    it('starts on Cancelar, the safe choice', () => {
      render(dialog())

      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    })

    it('keeps Tab inside the dialog, wrapping from the last control to the first', async () => {
      render(dialog())

      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'Desactivar' })).toHaveFocus()

      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    })

    it('keeps Shift+Tab inside the dialog, wrapping from the first control to the last', async () => {
      render(dialog())

      await userEvent.tab({ shift: true })

      expect(screen.getByRole('button', { name: 'Desactivar' })).toHaveFocus()
    })

    it('goes back to the control that opened it, on cancel', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await user.click(screen.getByRole('button', { name: 'Abrir' }))

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
    })

    it('goes back to the control that opened it, on Escape', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await user.click(screen.getByRole('button', { name: 'Abrir' }))

      await user.keyboard('{Escape}')

      expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
    })
  })

  describe('the page behind', () => {
    it('cannot be reached or read while the dialog is open', async () => {
      const user = userEvent.setup()
      const { container } = render(<Harness />)

      await user.click(screen.getByRole('button', { name: 'Abrir' }))

      expect(container).toHaveAttribute('inert')
      expect(screen.getByRole('dialog').closest('[inert]')).toBeNull()
    })

    it('is restored when the dialog closes', async () => {
      const user = userEvent.setup()
      const { container } = render(<Harness />)
      await user.click(screen.getByRole('button', { name: 'Abrir' }))

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(container).not.toHaveAttribute('inert')
    })

    it('does not scroll while the dialog is open', () => {
      const { unmount } = render(dialog())

      expect(document.body.style.overflow).toBe('hidden')

      unmount()
      expect(document.body.style.overflow).toBe('')
    })

    it('gives back the scroll style the page had', () => {
      document.body.style.overflow = 'scroll'
      const { unmount } = render(dialog())

      unmount()

      expect(document.body.style.overflow).toBe('scroll')
    })
  })
})
