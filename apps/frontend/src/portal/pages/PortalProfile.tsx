import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { usePortalAuth } from '../PortalAuthContext';
import { useUpdateProfile } from '../portalApi';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy disabled:bg-ala-grey-50 disabled:text-ala-grey-500';

export function PortalProfile() {
  const { client, setClient } = usePortalAuth();
  const update = useUpdateProfile();
  const [full_name, setFullName] = useState(client?.full_name ?? '');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [country, setCountry] = useState(client?.country ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const updated = await update.mutateAsync({
        full_name: full_name.trim(),
        phone: phone.trim() || null,
        country: country.trim() || null,
      });
      setClient(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-bold text-ala-navy">Profile</h1>
      <p className="mt-1 text-ala-grey-500">Keep your details up to date.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-card border border-ala-grey-200 bg-white p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ala-navy">Full name</span>
          <input className={inputCls} value={full_name} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ala-navy">Email</span>
          <input className={inputCls} value={client?.email ?? ''} disabled />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Phone</span>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Country</span>
            <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
        </div>
        {error && <p className="text-sm text-ala-red">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
