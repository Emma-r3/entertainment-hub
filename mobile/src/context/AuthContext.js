import { createContext, useContext, useEffect, useState } from 'react';
import { api, loadToken, saveToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await loadToken();
        if (t) {
          const d = await api('/auth/me');
          setUser(d.user);
        }
      } catch {
        await saveToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    await saveToken(d.token);
    setUser(d.user);
  }

  async function register(name, email, password) {
    const d = await api('/auth/register', { method: 'POST', body: { name, email, password } });
    await saveToken(d.token);
    setUser(d.user);
  }

  async function logout() {
    await saveToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);