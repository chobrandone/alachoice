import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { usePortalAuth } from '../PortalAuthContext';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-[0.95rem] text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-gradient px-4 py-12">
      <div className="w-full max-w-md rounded-card bg-white p-8 shadow-soft-lg">
        <Link to="/" className="font-heading text-2xl font-bold text-ala-navy">
          ALA<span className="text-ala-red">.</span>
        </Link>
        <h1 className="mt-6 font-heading text-2xl font-bold text-ala-navy">{title}</h1>
        <p className="mt-1 text-sm text-ala-grey-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ala-navy">{label}</span>
      {children}
    </label>
  );
}

export function PortalLogin() {
  const { login } = usePortalAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login({ email, password });
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Welcome back" subtitle="Sign in to your ALA client portal.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email">
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && <p className="text-sm text-ala-red">{error}</p>}
        <Button type="submit" disabled={busy} size="lg" className="w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ala-grey-500">
        New to ALA?{' '}
        <Link to="/portal/register" className="font-semibold text-ala-red hover:underline">
          Create an account
        </Link>
      </p>
    </Shell>
  );
}

export function PortalRegister() {
  const { register } = usePortalAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', country: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true);
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        country: form.country.trim() || undefined,
      });
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Create your account" subtitle="Start applications, upload documents, and track progress.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name">
          <input className={inputCls} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
        </Field>
        <Field label="Email">
          <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </Field>
        <Field label="Password">
          <input type="password" className={inputCls} value={form.password} onChange={(e) => set('password', e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Country">
            <input className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)} />
          </Field>
        </div>
        {error && <p className="text-sm text-ala-red">{error}</p>}
        <Button type="submit" disabled={busy} size="lg" className="w-full">
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ala-grey-500">
        Already have an account?{' '}
        <Link to="/portal/login" className="font-semibold text-ala-red hover:underline">
          Sign in
        </Link>
      </p>
    </Shell>
  );
}
