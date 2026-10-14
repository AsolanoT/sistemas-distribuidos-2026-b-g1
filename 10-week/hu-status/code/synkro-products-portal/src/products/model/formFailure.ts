// A message for the whole form or dialog, shown as an alert: a title in Spanish
// and, when the service sent one, its own message as the detail.
export interface FormAlert {
  title: string
  detail?: string
}

// How a failed request is shown: next to the fields it names, and/or as one
// alert. The form keeps what the user typed in every case. `outdated` is set
// when the answer shows that what the screen holds is out of date (the product
// no longer exists, its stock changed), so the screen reloads its list.
export interface FormFailure<Field extends string = never> {
  fieldErrors: Partial<Record<Field, string>>
  alert: FormAlert | null
  outdated?: boolean
}

export type Result<Value, Field extends string = never> =
  | { ok: true; value: Value }
  | { ok: false; failure: FormFailure<Field> }
