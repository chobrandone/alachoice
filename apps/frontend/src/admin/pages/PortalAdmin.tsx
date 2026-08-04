import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Eye } from 'lucide-react';
import { api, ApiError, type ApiMeta } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Drawer } from '../components/Drawer';
import { useToast } from '../components/Toast';
import {
  APPLICATION_TYPE_LABELS,
  applicationStatus,
  documentStatus,
  appointmentStatus,
  type Application,
  type ApplicationType,
} from '@ala/types';

const APP_STATUSES = applicationStatus.options;
const DOC_STATUSES = documentStatus.options;
const APPT_STATUSES = appointmentStatus.options;

const badgeCls = (s: string) =>
  ({
    draft: 'bg-ala-grey-200 text-ala-grey-600',
    submitted: 'bg-sky-100 text-sky-700',
    in_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-ala-navy/10 text-ala-navy',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
  })[s] ?? 'bg-ala-grey-200 text-ala-grey-600';

const selectCls = 'rounded-input border-0 px-2 py-1 text-xs font-medium capitalize focus:outline-none focus:ring-1 focus:ring-ala-navy';

type WithClient<T> = T & { client?: { full_name?: string; email?: string; country?: string } };

/* ============================ Applications ============================ */
export function AdminApplications() {
  const qc = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [active, setActive] = useState<WithClient<Application> | null>(null);
  const [notes, setNotes] = useState('');

  const key = ['/admin/applications', { page, status }];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const qs = new URLSearchParams({ page: String(page), pageSize: '25' });
      if (status) qs.set('status', status);
      const r = await api.get<WithClient<Application>[]>(`/admin/applications?${qs}`, { auth: true });
      return { rows: r.data, meta: r.meta as ApiMeta };
    },
  });

  const patch = async (id: string, body: Record<string, unknown>) => {
    try {
      await api.patch(`/admin/applications/${id}`, body, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/applications'] });
      toast('success', 'Updated');
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Update failed');
    }
  };

  const rows = data?.rows ?? [];
  const meta = data?.meta;
  const pages = Math.max(1, Math.ceil((meta?.total ?? 0) / (meta?.pageSize ?? 25)));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">Applications</h1>
        <select className="h-9 rounded-input border border-ala-grey-200 bg-white px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ala-grey-200 bg-ala-grey-50 text-xs uppercase tracking-wide text-ala-grey-500">
              <th className="px-4 py-3">Ref</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Client</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center"><Spinner className="h-6 w-6" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-ala-grey-500">No applications.</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id} className="border-b border-ala-grey-100 last:border-0 hover:bg-ala-grey-50/60">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-ala-navy">{a.ref}</td>
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3 text-ala-grey-500">{APPLICATION_TYPE_LABELS[a.type as ApplicationType] ?? a.type}</td>
                <td className="px-4 py-3 text-ala-grey-500">{a.client?.full_name ?? '—'}<br /><span className="text-xs">{a.client?.email}</span></td>
                <td className="px-4 py-3">
                  <select className={cn(selectCls, badgeCls(a.status))} value={a.status} onChange={(e) => patch(a.id, { status: e.target.value })}>
                    {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-ala-grey-500">{formatDate(a.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setActive(a); setNotes(a.notes ?? ''); }} className="rounded p-1.5 text-ala-navy hover:bg-ala-navy/10" aria-label="View">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-ala-grey-200 px-4 py-3 text-sm text-ala-grey-500">
            <span>Page {page} of {pages} · {meta?.total} total</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <Drawer open={!!active} onOpenChange={(o) => !o && setActive(null)} title={active?.title ?? 'Application'}>
        {active && (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
              <p className="font-mono text-xs text-ala-grey-500">{active.ref}</p>
              <dl className="space-y-1.5">
                {Object.entries(active.data ?? {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-ala-grey-100 py-1.5">
                    <dt className="capitalize text-ala-grey-500">{k.replace(/_/g, ' ')}</dt>
                    <dd className="text-right font-medium text-ala-navy">{String(v)}</dd>
                  </div>
                ))}
              </dl>
              {active.signature_url && (
                <div className="rounded-btn border border-ala-grey-100 bg-ala-grey-50 p-3">
                  <p className="text-xs font-medium text-ala-grey-500">
                    Signed by {active.signed_name}
                    {active.signed_at ? ` · ${new Date(active.signed_at).toLocaleString()}` : ''}
                  </p>
                  <img src={active.signature_url} alt="Signature" className="mt-1 h-20 rounded border border-ala-grey-200 bg-white" />
                </div>
              )}
              <label className="block">
                <span className="mb-1.5 block font-medium text-ala-navy">Advisor notes (visible to client)</span>
                <textarea className="h-28 w-full rounded-input border border-ala-grey-200 px-3 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-ala-grey-200 px-6 py-4">
              <Button variant="ghost" onClick={() => setActive(null)}>Close</Button>
              <Button onClick={async () => { await patch(active.id, { notes }); setActive(null); }}>Save notes</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ============================ Documents ============================ */
interface DocRow { id: string; file_url: string; file_name: string; doc_type?: string; status: string; created_at: string; client?: { full_name?: string; email?: string }; }

export function AdminClientDocuments() {
  const qc = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['/admin/client-documents', { page, status }],
    queryFn: async () => {
      const qs = new URLSearchParams({ page: String(page), pageSize: '25' });
      if (status) qs.set('status', status);
      const r = await api.get<DocRow[]>(`/admin/client-documents?${qs}`, { auth: true });
      return { rows: r.data, meta: r.meta as ApiMeta };
    },
  });

  const patch = async (id: string, body: Record<string, unknown>) => {
    try {
      await api.patch(`/admin/client-documents/${id}`, body, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/client-documents'] });
      toast('success', 'Updated');
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Update failed');
    }
  };

  const rows = data?.rows ?? [];
  const meta = data?.meta;
  const pages = Math.max(1, Math.ceil((meta?.total ?? 0) / (meta?.pageSize ?? 25)));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">Client Documents</h1>
        <select className="h-9 rounded-input border border-ala-grey-200 bg-white px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {DOC_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ala-grey-200 bg-ala-grey-50 text-xs uppercase tracking-wide text-ala-grey-500">
              <th className="px-4 py-3">File</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Uploaded</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center"><Spinner className="h-6 w-6" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-ala-grey-500">No documents.</td></tr>
            ) : rows.map((d) => (
              <tr key={d.id} className="border-b border-ala-grey-100 last:border-0 hover:bg-ala-grey-50/60">
                <td className="px-4 py-3 font-medium">{d.file_name}</td>
                <td className="px-4 py-3 text-ala-grey-500">{d.client?.full_name ?? '—'}</td>
                <td className="px-4 py-3 capitalize text-ala-grey-500">{(d.doc_type ?? 'other').replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <select className={cn(selectCls, badgeCls(d.status))} value={d.status} onChange={(e) => patch(d.id, { status: e.target.value })}>
                    {DOC_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-ala-grey-500">{formatDate(d.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-ala-navy hover:bg-ala-navy/10 inline-block" aria-label="Open">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-ala-grey-200 px-4 py-3 text-sm text-ala-grey-500">
            <span>Page {page} of {pages} · {meta?.total} total</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ Appointments ============================ */
interface ApptRow {
  id: string; scheduled_at: string; mode: string; status: string; meeting_link?: string; location?: string; notes?: string;
  client?: { full_name?: string; email?: string }; service?: { title_en?: string }; consultant?: { full_name?: string };
}

export function AdminAppointments() {
  const qc = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [active, setActive] = useState<ApptRow | null>(null);
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['/admin/appointments', { page, status }],
    queryFn: async () => {
      const qs = new URLSearchParams({ page: String(page), pageSize: '25' });
      if (status) qs.set('status', status);
      const r = await api.get<ApptRow[]>(`/admin/appointments?${qs}`, { auth: true });
      return { rows: r.data, meta: r.meta as ApiMeta };
    },
  });

  const patch = async (id: string, body: Record<string, unknown>) => {
    try {
      await api.patch(`/admin/appointments/${id}`, body, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/appointments'] });
      toast('success', 'Updated');
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Update failed');
    }
  };

  const rows = data?.rows ?? [];
  const meta = data?.meta;
  const pages = Math.max(1, Math.ceil((meta?.total ?? 0) / (meta?.pageSize ?? 25)));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">Appointments</h1>
        <select className="h-9 rounded-input border border-ala-grey-200 bg-white px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {APPT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ala-grey-200 bg-ala-grey-50 text-xs uppercase tracking-wide text-ala-grey-500">
              <th className="px-4 py-3">When</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Mode</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center"><Spinner className="h-6 w-6" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-ala-grey-500">No appointments.</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id} className="border-b border-ala-grey-100 last:border-0 hover:bg-ala-grey-50/60">
                <td className="px-4 py-3 font-medium">{new Date(a.scheduled_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-ala-grey-500">{a.client?.full_name ?? '—'}<br /><span className="text-xs">{a.client?.email}</span></td>
                <td className="px-4 py-3 text-ala-grey-500">{a.service?.title_en ?? 'Consultation'}</td>
                <td className="px-4 py-3 capitalize text-ala-grey-500">{a.mode}</td>
                <td className="px-4 py-3">
                  <select className={cn(selectCls, badgeCls(a.status))} value={a.status} onChange={(e) => patch(a.id, { status: e.target.value })}>
                    {APPT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setActive(a); setLink(a.meeting_link ?? ''); setLocation(a.location ?? ''); }} className="rounded p-1.5 text-ala-navy hover:bg-ala-navy/10" aria-label="Edit">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-ala-grey-200 px-4 py-3 text-sm text-ala-grey-500">
            <span>Page {page} of {pages} · {meta?.total} total</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <Drawer open={!!active} onOpenChange={(o) => !o && setActive(null)} title="Appointment">
        {active && (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
              <p className="text-ala-grey-500">{new Date(active.scheduled_at).toLocaleString()} · {active.client?.full_name}</p>
              {active.notes && <p className="rounded-btn bg-ala-grey-50 p-3 text-ala-grey-600">Client note: {active.notes}</p>}
              <label className="block">
                <span className="mb-1.5 block font-medium text-ala-navy">Meeting link (online)</span>
                <input className="h-10 w-full rounded-input border border-ala-grey-200 px-3" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet…" />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-medium text-ala-navy">Location (in-person)</span>
                <input className="h-10 w-full rounded-input border border-ala-grey-200 px-3" value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-ala-grey-200 px-6 py-4">
              <Button variant="ghost" onClick={() => setActive(null)}>Close</Button>
              <Button onClick={async () => { await patch(active.id, { meeting_link: link || null, location: location || null }); setActive(null); }}>Save</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ============================ Clients ============================ */
interface ClientRow { id: string; full_name: string; email: string; phone?: string; country?: string; created_at: string; }

export function AdminClients() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['/admin/clients', { page, q }],
    queryFn: async () => {
      const qs = new URLSearchParams({ page: String(page), pageSize: '25' });
      if (q) qs.set('search', q);
      const r = await api.get<ClientRow[]>(`/admin/clients?${qs}`, { auth: true });
      return { rows: r.data, meta: r.meta as ApiMeta };
    },
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta;
  const pages = Math.max(1, Math.ceil((meta?.total ?? 0) / (meta?.pageSize ?? 25)));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">Clients</h1>
        <form onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1); }} className="flex gap-2">
          <input className="h-9 rounded-input border border-ala-grey-200 bg-white px-3 text-sm" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button size="sm" variant="outline-navy" type="submit">Search</Button>
        </form>
      </div>
      <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ala-grey-200 bg-ala-grey-50 text-xs uppercase tracking-wide text-ala-grey-500">
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center"><Spinner className="h-6 w-6" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-ala-grey-500">No clients yet.</td></tr>
            ) : rows.map((c) => (
              <tr key={c.id} className="border-b border-ala-grey-100 last:border-0 hover:bg-ala-grey-50/60">
                <td className="px-4 py-3 font-medium">{c.full_name}</td>
                <td className="px-4 py-3"><a href={`mailto:${c.email}`} className="text-ala-navy hover:underline">{c.email}</a></td>
                <td className="px-4 py-3 text-ala-grey-500">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-ala-grey-500">{c.country ?? '—'}</td>
                <td className="px-4 py-3 text-ala-grey-500">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-ala-grey-200 px-4 py-3 text-sm text-ala-grey-500">
            <span>Page {page} of {pages} · {meta?.total} total</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
