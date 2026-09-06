import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../../api/client';

const SessionContext = createContext(null);

/**
 * The whole "logged in" state. Auth is simulated: there is no password and no
 * token, so the session is just the user the backend echoed back, held in
 * memory. Reloading the page returns to the picker, by design.
 */
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (userId) => {
    const session = await api.post('/auth/login', { userId });
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside <SessionProvider>.');
  }
  return context;
}
