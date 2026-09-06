import { useMemo, useState } from 'react';
import { formatMoney } from '../../api/format';
import Icon from '../../components/Icon';
import { Alert, Button, Card, Field } from '../../components/ui';
import { createSale } from './api';

const emptyLine = () => ({ key: crypto.randomUUID(), productId: '', quantity: '1' });

export default function NewSaleCard({ customers, products, onRegistered }) {
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [rejection, setRejection] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  /**
   * A preview only. The authoritative total is the one the backend returns,
   * because it prices each line at the product's price at the moment of sale.
   */
  const previewTotal = lines.reduce((sum, line) => {
    const product = productsById.get(line.productId);
    const quantity = Number(line.quantity);
    if (!product || !Number.isFinite(quantity)) return sum;
    return sum + Number(product.price) * quantity;
  }, 0);

  function updateLine(key, patch) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function resetForm() {
    setCustomerId('');
    setLines([emptyLine()]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setRejection(null);
    setFieldErrors({});
    setConfirmation(null);

    const payload = {
      customerId: customerId || null,
      items: lines.map((line) => ({
        productId: line.productId || null,
        quantity: line.quantity === '' ? null : Number(line.quantity),
      })),
    };

    try {
      const sale = await createSale(payload);
      setConfirmation(sale);
      resetForm();
      await onRegistered();
    } catch (caught) {
      // AC8: the backend's own wording is what the person needs to read.
      if (caught.isValidation && caught.fieldErrors) {
        setFieldErrors(caught.fieldErrors);
        setRejection('Check the highlighted fields and try again.');
      } else {
        setRejection(caught.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="New sale">
      <form className="stack" onSubmit={handleSubmit}>
        {rejection ? (
          <Alert tone="error" title="Sale not registered.">
            {rejection}
          </Alert>
        ) : null}

        {confirmation ? (
          <Alert tone="success" title="Sale registered.">
            {confirmation.customerName} — total{' '}
            <span className="num">{formatMoney(confirmation.total)}</span> across{' '}
            <span className="num">{confirmation.items.length}</span>{' '}
            {confirmation.items.length === 1 ? 'line' : 'lines'}.
          </Alert>
        ) : null}

        <Field label="Customer" error={fieldErrors.customerId}>
          <select
            className={`select${fieldErrors.customerId ? ' has-error' : ''}`}
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            <option value="">Select a customer…</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} — {customer.taxId}
              </option>
            ))}
          </select>
        </Field>

        <div className="stack">
          <div className="row">
            <span className="field-label">Items</span>
            <span className="spacer" />
            <Button variant="ghost" size="sm" onClick={() => setLines((prev) => [...prev, emptyLine()])}>
              <Icon name="plus" className="nav-icon" />
              Add line
            </Button>
          </div>

          {fieldErrors.items ? <span className="field-error">{fieldErrors.items}</span> : null}

          {lines.map((line, index) => {
            const product = productsById.get(line.productId);
            const quantity = Number(line.quantity);
            const overStock =
              product && Number.isFinite(quantity) && quantity > product.stock;

            return (
              <div key={line.key} className="line-grid">
                <Field label={index === 0 ? 'Product' : ''} error={fieldErrors[`items[${index}].productId`]}>
                  <select
                    className={`select${fieldErrors[`items[${index}].productId`] ? ' has-error' : ''}`}
                    value={line.productId}
                    onChange={(event) => updateLine(line.key, { productId: event.target.value })}
                  >
                    <option value="">Select a product…</option>
                    {products.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} ({option.stock} in stock)
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={index === 0 ? 'Quantity' : ''}
                  error={fieldErrors[`items[${index}].quantity`]}
                >
                  <input
                    className={`input is-num${
                      fieldErrors[`items[${index}].quantity`] || overStock ? ' has-error' : ''
                    }`}
                    type="number"
                    min="1"
                    step="1"
                    value={line.quantity}
                    onChange={(event) => updateLine(line.key, { quantity: event.target.value })}
                  />
                </Field>

                <Field label={index === 0 ? 'Subtotal' : ''}>
                  <div className="num" style={{ padding: '8px 0' }}>
                    {product && Number.isFinite(quantity)
                      ? formatMoney(Number(product.price) * quantity)
                      : '—'}
                  </div>
                </Field>

                <Button
                  variant="danger-ghost"
                  onClick={() => setLines((prev) => prev.filter((item) => item.key !== line.key))}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  <Icon name="trash" className="nav-icon" />
                </Button>

                {overStock ? (
                  <div style={{ gridColumn: '1 / -1', marginTop: -4 }}>
                    <span className="field-error">
                      Only {product.stock} in stock — the server will reject this line.
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="line-total">
          <span className="label">Estimated total</span>
          <span className="value">{formatMoney(previewTotal)}</span>
        </div>

        <div className="row-end">
          <Button variant="secondary" onClick={resetForm} disabled={submitting}>
            Clear
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Registering…' : 'Register sale'}
          </Button>
        </div>

        <button type="submit" hidden />
      </form>
    </Card>
  );
}
