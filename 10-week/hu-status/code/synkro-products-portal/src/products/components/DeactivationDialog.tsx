import { useState } from 'react'
import type { FormAlert, Result } from '../model/formFailure'
import { managementCopy } from '../model/managementCopy'
import { useSingleFlight } from '../pages/useSingleFlight'
import { ConfirmDialog } from './ConfirmDialog'

interface DeactivationDialogProps {
  title: string
  message: string
  // Sends the deactivation. Its failure is what the dialog shows.
  request: () => Promise<Result<unknown>>
  onDeactivated: () => void
  // The answer shows the page's list is out of date: it reloads it. The dialog
  // stays open with the message, and the user closes it.
  onOutdated: () => void
  onCancel: () => void
}

const noData = undefined

// The confirmation every deactivation goes through (design-system.md: a
// destructive action needs a modal). It sends the request when the user confirms,
// stays open with the reason when it fails so the user can retry, and sends one
// request however many times the confirm button is clicked.
export function DeactivationDialog({
  title,
  message,
  request,
  onDeactivated,
  onOutdated,
  onCancel,
}: DeactivationDialogProps) {
  const [error, setError] = useState<FormAlert | null>(null)
  const { isPending, submit } = useSingleFlight(request)
  const { deactivate } = managementCopy

  async function confirm() {
    setError(null)
    const outcome = await submit(noData)

    if (outcome.status === 'done') {
      onDeactivated()
    } else if (outcome.status === 'failed') {
      setError(outcome.failure.alert)
      if (outcome.failure.outdated) onOutdated()
    }
  }

  return (
    <ConfirmDialog
      title={title}
      message={message}
      cancelLabel={deactivate.cancel}
      confirmLabel={deactivate.confirm}
      pendingLabel={deactivate.confirming}
      isPending={isPending}
      error={error}
      onCancel={onCancel}
      onConfirm={confirm}
    />
  )
}
