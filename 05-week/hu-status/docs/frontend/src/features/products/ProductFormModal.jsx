import { useState } from 'react';
import { Alert, Button, Field, Modal } from '../../components/ui';
import { createProduct, updateProduct } from './api';

export default function ProductFormModal({ product, categories, onClose, onSaved }) {
  const editing = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product?.price != null ? String(product.price) : '',
    stock: product?.stock != null ? String(product.stock) : '',
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
  });
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
      // Empty strings would serialise as null and read as "required"; sending
      // the raw number lets the backend's own rules produce the message.
      price: form.price === '' ? null : Number(form.price),
      stock: form.stock === '' ? null : Number(form.stock),
      categoryId: form.categoryId || null,
    };

    try {
      if (editing) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
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
      title={editing ? 'Edit product' : 'New product'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form className="stack" onSubmit={handleSubmit}>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        {categories.length === 0 ? (
          <Alert tone="info">
            There are no active categories yet. Create one first — every product needs a category.
          </Alert>
        ) : null}

        <Field label="Name" error={fieldErrors.name}>
          <input
            className={`input${fieldErrors.name ? ' has-error' : ''}`}
            value={form.name}
            onChange={set('name')}
            autoFocus
          />
        </Field>

        <div className="grid-2">
          <Field label="Price" hint="Must be greater than 0." error={fieldErrors.price}>
            <input
              className={`input is-num${fieldErrors.price ? ' has-error' : ''}`}
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set('price')}
            />
          </Field>

          <Field label="Stock" hint="Units on hand, never negative." error={fieldErrors.stock}>
            <input
              className={`input is-num${fieldErrors.stock ? ' has-error' : ''}`}
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={set('stock')}
            />
          </Field>
        </div>

        <Field label="Category" error={fieldErrors.categoryId}>
          <select
            className={`select${fieldErrors.categoryId ? ' has-error' : ''}`}
            value={form.categoryId}
            onChange={set('categoryId')}
          >
            <option value="">Select a category…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
