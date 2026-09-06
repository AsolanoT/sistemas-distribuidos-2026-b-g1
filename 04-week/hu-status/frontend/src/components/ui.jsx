import { useEffect } from 'react';
import Icon from './Icon';

export function Button({ variant = 'secondary', size, children, ...rest }) {
  const classes = ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : ''].filter(Boolean);
  return (
    <button type="button" className={classes.join(' ')} {...rest}>
      {children}
    </button>
  );
}

export function Badge({ tone = 'muted', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/** Mono wrapper for every numeric value — the signature of the design. */
export function Num({ children, className = '' }) {
  return <span className={`num ${className}`.trim()}>{children}</span>;
}

export function Alert({ tone = 'info', title, children }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={tone === 'error' ? 'alert' : tone === 'success' ? 'check' : 'alert'} className="nav-icon" />
      <div>
        {title ? <strong>{title}</strong> : null}
        {title ? ' ' : null}
        {children}
      </div>
    </div>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
      {!error && hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export function Card({ title, action, children, bodyless = false }) {
  return (
    <section className="card">
      {title || action ? (
        <header className="card-head">
          <h2>{title}</h2>
          {action}
        </header>
      ) : null}
      {bodyless ? children : <div className="card-body">{children}</div>}
    </section>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="card-body stack" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${90 - i * 8}%` }} />
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            <Icon name="close" className="nav-icon" />
          </Button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </div>
    </div>
  );
}

/** Green while there are units left, red at zero — the in-stock / out-of-stock state. */
export function StockBadge({ stock }) {
  return (
    <Badge tone={stock > 0 ? 'success' : 'error'}>
      <span className="num">{stock}</span>
      {stock > 0 ? ' in stock' : ' out of stock'}
    </Badge>
  );
}

export function ActiveBadge({ active }) {
  return <Badge tone={active ? 'steel' : 'muted'}>{active ? 'Active' : 'Inactive'}</Badge>;
}
