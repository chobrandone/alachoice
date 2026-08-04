import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, portalTokenStore } from '@/lib/api';
import type { SessionClient, ClientLoginInput, ClientRegisterInput } from '@ala/types';

interface PortalSession {
  token: string;
  refreshToken: string;
  expiresAt?: number;
  client: SessionClient;
}

interface PortalAuthState {
  client: SessionClient | null;
  loading: boolean;
  login: (creds: ClientLoginInput) => Promise<void>;
  register: (input: ClientRegisterInput) => Promise<void>;
  logout: () => void;
  setClient: (c: SessionClient) => void;
}

const Ctx = createContext<PortalAuthState | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SessionClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = portalTokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<SessionClient>('/portal/auth/me', { portalAuth: true })
      .then((r) => setClient(r.data))
      .catch(() => portalTokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds: ClientLoginInput) => {
    const { data } = await api.post<PortalSession>('/portal/auth/login', creds);
    portalTokenStore.set(data.token);
    setClient(data.client);
  };

  const register = async (input: ClientRegisterInput) => {
    const { data } = await api.post<PortalSession>('/portal/auth/register', input);
    portalTokenStore.set(data.token);
    setClient(data.client);
  };

  const logout = () => {
    portalTokenStore.clear();
    setClient(null);
  };

  return (
    <Ctx.Provider value={{ client, loading, login, register, logout, setClient }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return ctx;
}
