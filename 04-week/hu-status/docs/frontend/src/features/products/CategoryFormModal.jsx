import { useState } from 'react';
import { Alert, Button, Field, Modal } from '../../components/ui';
import { createCategory } from './api';

export default function CategoryFormModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    try {
      await createCategory({ name });
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
      title="New category"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Create category'}
          </Button>
        </>
      }
    >
      <form className="stack" onSubmit={handleSubmit}>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <Field
          label="Name"
          hint="Must be unique among active categories."
          error={fieldErrors.name}
        >
          <input
            className={`input${fieldErrors.name ? ' has-error' : ''}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </Field>

        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
