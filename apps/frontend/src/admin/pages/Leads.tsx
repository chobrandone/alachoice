import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Trash2, Check, Circle, X, Search } from 'lucide-react';
import { api, ApiError, type ApiMeta } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  leadStatus,
  leadSource,
  type LeadSource,
} from '@ala/types';

const STATUSES = leadStatus.options;
const SOURCES = leadSource.options;

const statusCls = (s: string) =>
  ({
    new: 'bg-sky-100 text-sky-700',
    contacted: 'bg-amber-100 text-amber-700',
    qualified: 'bg-violet-100 text-violet-700',
    proposal: 'bg-ala-navy/10 text-ala-navy',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100 text-red-700',
  })[s] ?? 'bg-ala-grey-200 text-ala-grey-600';

const selectCls =
  'rounded-input border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ala-navy';
const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

interface LeadRow {
  id: string; source: string; name: string; email?: string; phone?: string; country?: string;
  subject?: string; status: string; assigned_to?: string; value?: number; created_at: string;
  assignee?: { full_name?: string };
}
interface Assignee { id: string; full_name: string; }

export function Leads() {
  const qc = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', source: '', assignedTo: '' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<LeadRow | null>(null);

  const { data: assignees } = useQuery({
    queryKey: ['/admin/leads/assignees'],
    queryFn: () => api.get<Assignee[]>('/admin/leads/assignees', { auth: true }).then((r) => r.data),
  });

  const listKey = ['/admin/leads', { page, filters, search }];
  const { data, isLoading } = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      const qs = new URLSearchParams({ page: String(page), pageSize: '25' });
      if (filters.status) qs.set('status', filters.status);
      if (filters.source) qs.set('source', filters.source);
      if (filters.assignedTo) qs.set('assignedTo', filters.assignedTo);
      if (search) qs.set('search', search);
      const r = await api.get<LeadRow[]>(`/admin/leads?${qs}`, { auth: true });
      return { rows: r.data, meta: r.meta as ApiMeta };
    },
  });

  const setFilter = (p: Partial<typeof filters>) => { setFilters((f) => ({ ...f, ...p })); setPage(1); };
  const patch = async (id: string, body: Record<string, unknown>) => {
    try {
      await api.patch(`/admin/leads/${id}`, body, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/leads'] });
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Update failed');
    }
  };

  const rows = data?.rows ?? [];
  const meta = data?.meta;
  const pages = Math.max(1, Math.ceil((meta?.total ?? 0) / (meta?.pageSize ?? 25)));
  const assigneeName = (id?: string) => assignees?.find((a) => a.id === id)?.full_name ?? '';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ala-navy">Leads</h1>
          <p className="text-sm text-ala-grey-500">{meta?.total ?? 0} total · every inquiry, quote, application & registration</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New lead</Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-ala-grey-200 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">Status</span>
          <select className={cn(inputCls, 'w-36')} value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">Source</span>
          <select className={cn(inputCls, 'w-44')} value={filters.source} onChange={(e) => setFilter({ source: e.target.value })}>
            <option value="">All</option>
            {SOURCES.map((s) => <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">Assignee</span>
          <select className={cn(inputCls, 'w-40')} value={filters.assignedTo} onChange={(e) => setFilter({ assignedTo: e.target.value })}>
            <option value="">Anyone</option>
            {(assignees ?? []).map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
        </label>
        <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); }}>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ala-grey-500">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ala-grey-500" />
              <input className={cn(inputCls, 'w-48 pl-8')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Name, email, subject" />
            </div>
          </label>
          <Button type="submit" size="sm" variant="outline-navy">Go</Button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ala-grey-200 bg-ala-grey-50 text-xs uppercase tracking-wide text-ala-grey-500">
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Created</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Spinner className="h-6 w-6" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-ala-grey-500">No leads found.</td></tr>
              ) : rows.map((l) => (
                <tr key={l.id} className="border-b border-ala-grey-100 last:border-0 hover:bg-ala-grey-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ala-navy">{l.name}</p>
                    <p className="text-xs text-ala-grey-500">{l.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ala-grey-100 px-2 py-0.5 text-xs text-ala-grey-600">
                      {LEAD_SOURCE_LABELS[l.source as LeadSource] ?? l.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-ala-grey-500">{l.subject ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select className={cn(selectCls, statusCls(l.status))} value={l.status} onChange={(e) => patch(l.id, { status: e.target.value })}>
                      {STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select className="rounded-input border border-ala-grey-200 bg-white px-2 py-1 text-xs" value={l.assigned_to ?? ''} onChange={(e) => patch(l.id, { assigned_to: e.target.value || null })}>
                      <option value="">Unassigned</option>
                      {(assignees ?? []).map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-ala-grey-500">{formatDate(l.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setOpenId(l.id)} className="rounded p-1.5 text-ala-navy hover:bg-ala-navy/10" aria-label="View"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => setDeleting(l)} className="rounded p-1.5 text-ala-red hover:bg-ala-red/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {openId && <LeadDrawer id={openId} onClose={() => setOpenId(null)} assigneeName={assigneeName} />}
      {creating && <NewLeadDrawer onClose={() => setCreating(false)} />}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        message={`Delete lead "${deleting?.name}"? This removes its notes and tasks.`}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await api.delete(`/admin/leads/${deleting.id}`, { auth: true });
            qc.invalidateQueries({ queryKey: ['/admin/leads'] });
            toast('success', 'Deleted');
          } catch (e) { toast('error', e instanceof ApiError ? e.message : 'Delete failed'); }
          setDeleting(null);
        }}
      />
    </div>
  );
}

/* -------------------- Detail drawer (notes + tasks) -------------------- */
interface LeadDetail extends LeadRow {
  notes: { id: string; body: string; created_at: string; author?: { full_name?: string } }[];
  tasks: { id: string; title: string; due_at?: string; is_done: boolean }[];
}

function LeadDrawer({ id, onClose }: { id: string; onClose: () => void; assigneeName: (id?: string) => string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [note, setNote] = useState('');
  const [task, setTask] = useState('');
  const [due, setDue] = useState('');

  const key = ['/admin/leads', 'detail', id];
  const { data: lead, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => api.get<LeadDetail>(`/admin/leads/${id}`, { auth: true }).then((r) => r.data),
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ['/admin/leads'] }); };

  const addNote = async () => {
    if (!note.trim()) return;
    try { await api.post(`/admin/leads/${id}/notes`, { body: note.trim() }, { auth: true }); setNote(''); refresh(); }
    catch (e) { toast('error', e instanceof ApiError ? e.message : 'Failed'); }
  };
  const addTask = async () => {
    if (!task.trim()) return;
    try {
      await api.post(`/admin/leads/${id}/tasks`, { title: task.trim(), due_at: due ? new Date(due).toISOString() : null }, { auth: true });
      setTask(''); setDue(''); refresh();
    } catch (e) { toast('error', e instanceof ApiError ? e.message : 'Failed'); }
  };
  const toggleTask = async (tid: string, is_done: boolean) => {
    try { await api.patch(`/admin/lead-tasks/${tid}`, { is_done }, { auth: true }); refresh(); }
    catch (e) { toast('error', e instanceof ApiError ? e.message : 'Failed'); }
  };
  const delTask = async (tid: string) => {
    try { await api.delete(`/admin/lead-tasks/${tid}`, { auth: true }); refresh(); }
    catch (e) { toast('error', e instanceof ApiError ? e.message : 'Failed'); }
  };

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title={lead?.name ?? 'Lead'}>
      {isLoading || !lead ? (
        <div className="flex h-full items-center justify-center"><Spinner className="h-6 w-6 text-ala-navy" /></div>
      ) : (
        <div className="flex h-full flex-col overflow-y-auto px-6 py-5 text-sm">
          {/* Contact + source */}
          <div className="space-y-1.5">
            <p><span className="text-ala-grey-500">Source:</span> <span className="font-medium">{LEAD_SOURCE_LABELS[lead.source as LeadSource]}</span></p>
            {lead.email && <p><span className="text-ala-grey-500">Email:</span> <a href={`mailto:${lead.email}`} className="text-ala-navy hover:underline">{lead.email}</a></p>}
            {lead.phone && <p><span className="text-ala-grey-500">Phone:</span> {lead.phone}</p>}
            {lead.country && <p><span className="text-ala-grey-500">Country:</span> {lead.country}</p>}
            {lead.subject && <p className="rounded-btn bg-ala-grey-50 p-2 text-ala-grey-600">{lead.subject}</p>}
          </div>

          {/* Notes */}
          <div className="mt-6">
            <h3 className="mb-2 font-heading font-semibold text-ala-navy">Notes & activity</h3>
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} />
              <Button size="sm" onClick={addNote}>Add</Button>
            </div>
            <ul className="mt-3 space-y-2">
              {lead.notes.length === 0 && <li className="text-xs text-ala-grey-500">No notes yet.</li>}
              {lead.notes.map((n) => (
                <li key={n.id} className="rounded-btn border border-ala-grey-100 bg-white p-3">
                  <p className="text-ala-ink">{n.body}</p>
                  <p className="mt-1 text-xs text-ala-grey-400">{n.author?.full_name ?? 'Admin'} · {formatDate(n.created_at)}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Tasks */}
          <div className="mt-6">
            <h3 className="mb-2 font-heading font-semibold text-ala-navy">Follow-up tasks</h3>
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Task…" value={task} onChange={(e) => setTask(e.target.value)} />
              <input type="date" className={cn(inputCls, 'w-40')} value={due} onChange={(e) => setDue(e.target.value)} />
              <Button size="sm" onClick={addTask}>Add</Button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {lead.tasks.length === 0 && <li className="text-xs text-ala-grey-500">No tasks yet.</li>}
              {lead.tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 rounded-btn border border-ala-grey-100 px-3 py-2">
                  <button onClick={() => toggleTask(t.id, !t.is_done)} className={t.is_done ? 'text-emerald-600' : 'text-ala-grey-400'} aria-label="Toggle done">
                    {t.is_done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </button>
                  <span className={cn('flex-1', t.is_done && 'text-ala-grey-400 line-through')}>{t.title}</span>
                  {t.due_at && <span className="text-xs text-ala-grey-500">{formatDate(t.due_at)}</span>}
                  <button onClick={() => delTask(t.id)} className="text-ala-red" aria-label="Delete task"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* -------------------- New (manual) lead -------------------- */
function NewLeadDrawer({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', subject: '' });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return toast('error', 'Name is required');
    setBusy(true);
    try {
      await api.post('/admin/leads', {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        country: form.country.trim() || undefined,
        subject: form.subject.trim() || undefined,
      }, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/leads'] });
      toast('success', 'Lead created');
      onClose();
    } catch (e) { toast('error', e instanceof ApiError ? e.message : 'Failed'); }
    finally { setBusy(false); }
  };

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} title="New lead">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {[['name', 'Name *'], ['email', 'Email'], ['phone', 'Phone'], ['country', 'Country'], ['subject', 'Subject']].map(([k, label]) => (
            <label key={k} className="block">
              <span className="mb-1 block text-sm font-medium text-ala-navy">{label}</span>
              <input className={inputCls} value={(form as Record<string, string>)[k]} onChange={(e) => set(k, e.target.value)} />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-ala-grey-200 px-6 py-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Create lead'}</Button>
        </div>
      </div>
    </Drawer>
  );
}
