import { useState } from 'react';
import logo from '../../assets/logo.png';
import { api } from '../../api/client';
import { useResource } from '../../api/useResource';
import { initials } from '../../api/format';
import { Alert, Badge, Button, Card, EmptyState, TableSkeleton } from '../../components/ui';
import { useSession } from './SessionContext';
import { ROLE_LABELS } from './roles';

const loadUsers = () => api.get('/auth/users');

export default function LoginScreen() {
  const { login } = useSession();
  const { data: users, error, loading, reload } = useResource(loadUsers);

  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const selected = users?.find((user) => user.id === selectedId) ?? null;

  async function handleContinue() {
    if (!selected) return;
    setSubmitting(true);
    setLoginError(null);
    try {
      await login(selected.id);
    } catch (caught) {
      setLoginError(caught.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-head">
          <img src={logo} alt="Synkro Tech" className="brand-mark" />
          <h1>Synkro Tech</h1>
          <p>Pick the user you want to work as.</p>
        </div>

        <Card
          title="Available users"
          action={
            <Button variant="ghost" size="sm" onClick={reload} disabled={loading}>
              Refresh
            </Button>
          }
        >
          {loading ? <TableSkeleton rows={3} /> : null}

          {!loading && error ? (
            <div className="stack">
              <Alert tone="error" title="Could not load users.">
                {error.message}
              </Alert>
              <div className="row-end">
                <Button onClick={reload}>Try again</Button>
              </div>
            </div>
          ) : null}

          {!loading && !error && users?.length === 0 ? (
            <EmptyState title="No users available">
              The backend returned an empty list, so there is nobody to sign in as.
            </EmptyState>
          ) : null}

          {!loading && !error && users?.length > 0 ? (
            <div className="stack">
              <div className="user-list">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`user-option${user.id === selectedId ? ' is-selected' : ''}`}
                    onClick={() => setSelectedId(user.id)}
                    aria-pressed={user.id === selectedId}
                  >
                    <span className="avatar">{initials(user.name)}</span>
                    <span className="spacer">
                      <div className="name">{user.name}</div>
                    </span>
                    <Badge tone="steel">{ROLE_LABELS[user.role] ?? user.role}</Badge>
                  </button>
                ))}
              </div>

              {loginError ? <Alert tone="error">{loginError}</Alert> : null}

              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={!selected || submitting}
              >
                {submitting
                  ? 'Signing in…'
                  : selected
                    ? `Continue as ${selected.name}`
                    : 'Select a user to continue'}
              </Button>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
