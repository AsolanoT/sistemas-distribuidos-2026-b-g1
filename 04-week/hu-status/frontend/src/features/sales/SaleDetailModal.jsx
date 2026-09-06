import { useCallback } from 'react';
import { useResource } from '../../api/useResource';
import { formatDateTime, formatMoney } from '../../api/format';
import { Alert, Button, Modal, TableSkeleton } from '../../components/ui';
import { getSale } from './api';

export default function SaleDetailModal({ saleId, onClose }) {
  const loader = useCallback(() => getSale(saleId), [saleId]);
  const { data: sale, error, loading } = useResource(loader);

  return (
    <Modal
      title="Sale detail"
      onClose={onClose}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      {loading ? <TableSkeleton rows={3} /> : null}

      {!loading && error ? (
        <Alert tone="error" title="Could not load the sale.">
          {error.message}
        </Alert>
      ) : null}

      {!loading && !error && sale ? (
        <div className="stack">
          <div className="grid-2">
            <div>
              <div className="stat-label">Customer</div>
              <div className="cell-strong">{sale.customerName}</div>
            </div>
            <div>
              <div className="stat-label">Date</div>
              <div className="num">{formatDateTime(sale.date)}</div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="right">Qty</th>
                  <th className="right">Unit price</th>
                  <th className="right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="cell-strong">{item.productName}</td>
                    <td className="right"><span className="num">{item.quantity}</span></td>
                    <td className="right"><span className="num">{formatMoney(item.unitPrice)}</span></td>
                    <td className="right"><span className="num">{formatMoney(item.subtotal)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="line-total">
            <span className="label">Total</span>
            <span className="value">{formatMoney(sale.total)}</span>
          </div>

          <span className="field-hint">
            Unit prices are frozen at the moment of the sale, so later catalogue
            changes never rewrite this record.
          </span>
        </div>
      ) : null}
    </Modal>
  );
}
