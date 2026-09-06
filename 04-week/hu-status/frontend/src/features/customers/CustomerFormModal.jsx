import { useState } from 'react';
import { Alert, Button, Field, Modal } from '../../components/ui';
import { createCustomer, updateCustomer } from './api';

const EMPTY = { name: '', taxId: '', email: '', phone: '', address: '' };

/**
 * Create or edit a customer. Field-level messages come straight from the
 * backend's `fieldErrors`; anything else (a duplicate tax id, for instance)
 * is shown as a banner with the server's own wording.
 */
export default function CustomerFormModal({ customer, onClose, onSaved }) {
  const editing = Boolean(customer);
  const [form, setForm] = useState(
    customer
      ? {
          name: customer.name ?? '',
          taxId: customer.taxId ?? '',
          email: customer.email ?? '',
          phone: customer.phone ?? '',
          address: customer.address ?? '',
        }
      : EMPTY,
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    const payload = {
      name: form.name,
      taxId: form.taxId,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    };

    try {
      if (editing) {
        await updateCustomer(customer.id, payload);
      } else {
        await createCustomer(payload);
      }
      onSaved();
    } catch (caught) {
      if (caught.isValidation && caught.fieldErrors) {
        setFieldErrors(caught.fieldErrors);
      } else {
        setFormError(caught.message);
      }
      setSaving(false);
    }
  }

  return (
    <Modal
      title={editing ? 'Edit customer' : 'New customer'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create customer'}
          </Button>
        </>
      }
    >
      <form className="stack" onSubmit={handleSubmit}>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <Field label="Name" error={fieldErrors.name}>
          <input
            className={`input${fieldErrors.name ? ' has-error' : ''}`}
            value={form.name}
            onChange={set('name')}
            autoFocus
          />
        </Field>

        <Field
          label="Tax ID"
          hint="Must be unique among active customers."
          error={fieldErrors.taxId}
        >
          <input
            className={`input is-num${fieldErrors.taxId ? ' has-error' : ''}`}
            value={form.taxId}
            onChange={set('taxId')}
          />
        </Field>

        <Field label="Email" error={fieldErrors.email}>
          <input
            className={`input${fieldErrors.email ? ' has-error' : ''}`}
            type="email"
            value={form.email}
            onChange={set('email')}
          />
        </Field>

        <div className="grid-2">
          <Field label="Phone" error={fieldErrors.phone}>
            <input
              className={`input is-num${fieldErrors.phone ? ' has-error' : ''}`}
              value={form.phone}
              onChange={set('phone')}
            />
          </Field>

          <Field label="Address" error={fieldErrors.address}>
            <input
              className={`input${fieldErrors.address ? ' has-error' : ''}`}
              value={form.address}
              onChange={set('address')}
            />
          </Field>
        </div>

        {/* Lets Enter submit the form without a second visible button. */}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
