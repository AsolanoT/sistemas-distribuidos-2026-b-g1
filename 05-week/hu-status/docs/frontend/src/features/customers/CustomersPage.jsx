import { useState } from 'react';
import { useResource } from '../../api/useResource';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import {
  ActiveBadge,
  Alert,
  Button,
  Card,
  EmptyState,
  TableSkeleton,
} from '../../components/ui';
import CustomerFormModal from './CustomerFormModal';
import { deactivateCustomer, listCustomers } from './api';

export default function CustomersPage() {
  const { data: customers, error, loading, reload } = useResource(listCustomers);

  const initialLoading = loading && !customers;

  const [editing, setEditing] = useState(null); // customer object, or "new"
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function handleDeactivate(customer) {
    if (!window.confirm(`Deactivate ${customer.name}? Past sales keep pointing at them.`)) {
      return;
    }
    setBusyId(customer.id);
    setActionError(null);
    try {
      await deactivateCustomer(customer.id);
      await reload();
    } catch (caught) {
      setActionError(caught.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Deactivating never deletes — past sales keep resolving."
        action={
          <Button variant="primary" onClick={() => setEditing('new')}>
            <Icon name="plus" className="nav-icon" />
            New customer
          </Button>
        }
      />

      <div className="stack">
        {actionError ? <Alert tone="error">{actionError}</Alert> : null}

        <Card bodyless>
          {initialLoading ? <TableSkeleton /> : null}

          {!initialLoading && error ? (
            <div className="card-body stack">
              <Alert tone="error" title="Could not load customers.">
                {error.message}
              </Alert>
              <div className="row-end">
                <Button onClick={reload}>Try again</Button>
              </div>
            </div>
          ) : null}

          {!initialLoading && !error && customers?.length === 0 ? (
            <EmptyState title="No customers yet">
              Create the first one to start registering sales.
            </EmptyState>
          ) : null}

          {!initialLoading && !error && customers?.length > 0 ? (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Document</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className={customer.active ? '' : 'row-inactive'}>
                      <td>
                        <div className="cell-strong">{customer.name}</div>
                        {customer.address ? (
                          <div className="cell-muted">{customer.address}</div>
                        ) : null}
                      </td>
                      <td><span className="num">{customer.identityDocument}</span></td>
                      <td>{customer.email ?? '—'}</td>
                      <td>{customer.phone ? <span className="num">{customer.phone}</span> : '—'}</td>
                      <td><ActiveBadge active={customer.active} /></td>
                      <td className="right">
                        <div className="row-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(customer)}
                            disabled={busyId === customer.id}
                          >
                            <Icon name="edit" className="nav-icon" />
                            Edit
                          </Button>
                          {customer.active ? (
                            <Button
                              variant="danger-ghost"
                              size="sm"
                              onClick={() => handleDeactivate(customer)}
                              disabled={busyId === customer.id}
                            >
                              <Icon name="power" className="nav-icon" />
                              {busyId === customer.id ? 'Working…' : 'Deactivate'}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </div>

      {editing ? (
        <CustomerFormModal
          customer={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
          }}
        />
      ) : null}
    </>
  );
}
