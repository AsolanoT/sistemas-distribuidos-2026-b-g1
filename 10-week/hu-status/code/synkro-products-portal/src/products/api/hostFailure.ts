import type { FormFailure } from '../model/formFailure'
import { managementCopy } from '../model/managementCopy'
import { registrationCopy } from '../model/registrationCopy'

// The error the host's client rejects with. The portal cannot import the host's
// class, so it recognizes the error by its shape.
export interface HostError {
  status: number
  body: { message?: unknown; details?: unknown }
}

export interface FieldDetail {
  field: string
  message: string
}

export interface FailureRules<Field extends string> {
  // The Spanish title of the alert for a failure nothing else explains.
  title: string
  // Which form field each request property belongs to; a detail about any other
  // property goes to the alert.
  fieldOfProperty?: Record<string, Field>
  // How a status is shown when it means something specific to this request.
  byStatus?: Record<number, (error: HostError) => FormFailure<Field>>
}

// Turns whatever a request rejected with into what the form shows. Status 0 is
// "the server could not be reached"; a 400 puts its details next to the fields
// they name; any other status is the rule's own, or a Spanish title with the
// service's message as the detail.
export function toFormFailure<Field extends string>(error: unknown, rules: FailureRules<Field>): FormFailure<Field> {
  if (!isHostError(error)) return alertOnly(rules.title)
  if (error.status === 0) return alertOnly(registrationCopy.offline)

  const specific = rules.byStatus?.[error.status]
  if (specific) return specific(error)
  if (error.status === 400) return fromValidationDetails(error, rules)
  return alertOnly(rules.title, messageOf(error))
}

export function alertOnly<Field extends string>(title: string, detail?: string): FormFailure<Field> {
  return { fieldErrors: {}, alert: detail === undefined ? { title } : { title, detail } }
}

// The service names a missing permission in English; the user gets it in Spanish.
export function forbidden<Field extends string>(): FormFailure<Field> {
  return alertOnly(managementCopy.forbidden)
}

export function isHostError(error: unknown): error is HostError {
  if (typeof error !== 'object' || error === null) return false
  const { status, body } = error as Partial<HostError>
  return typeof status === 'number' && typeof body === 'object' && body !== null
}

export function messageOf({ body }: HostError): string | undefined {
  return typeof body.message === 'string' && body.message !== '' ? body.message : undefined
}

export function detailsOf({ body }: HostError): FieldDetail[] {
  if (!Array.isArray(body.details)) return []
  return body.details.filter(
    (detail): detail is FieldDetail => typeof detail?.field === 'string' && typeof detail?.message === 'string',
  )
}

function fromValidationDetails<Field extends string>(error: HostError, rules: FailureRules<Field>): FormFailure<Field> {
  const details = detailsOf(error)
  if (details.length === 0) return alertOnly(rules.title, messageOf(error))

  const fieldErrors: Partial<Record<Field, string>> = {}
  const unmatched: string[] = []

  for (const { field, message } of details) {
    const formField = rules.fieldOfProperty?.[field]
    if (formField === undefined) unmatched.push(message)
    else fieldErrors[formField] ??= message
  }

  const alert = unmatched.length > 0 ? { title: rules.title, detail: unmatched.join(' ') } : null
  return { fieldErrors, alert }
}
