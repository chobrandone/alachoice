import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { useAuth } from './AuthContext';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-[0.95rem] focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string })?.from ?? '/admin';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-gradient px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-soft-lg">
        <div className="mb-6 text-center">
          <span className="font-heading text-2xl font-bold text-ala-navy">
            ALA<span className="text-ala-red">.</span>
          </span>
          <p className="mt-1 text-sm text-ala-grey-500">Admin sign in</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Email</span>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Password</span>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="text-sm text-ala-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
