import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore } from '@/lib/api';
import type { SessionUser, LoginInput } from '@ala/types';

interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt?: number;
  user: SessionUser;
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (creds: LoginInput) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount if a token is present.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<SessionUser>('/auth/me', { auth: true })
      .then((r) => setUser(r.data))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds: LoginInput) => {
    const { data } = await api.post<LoginResponse>('/auth/login', creds);
    tokenStore.set(data.token);
    setUser(data.user);
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
