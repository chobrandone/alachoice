import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Mail, Search, X } from 'lucide-react';
import { api, ApiError, type ApiMeta } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import type { EventRegistration, EventRow, RegistrationStatus } from '@ala/types';

const STATUSES: RegistrationStatus[] = ['pending', 'confirmed', 'waitlisted', 'attended', 'cancelled'];

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  waitlisted: 'bg-sky-100 text-sky-700',
  attended: 'bg-ala-navy/10 text-ala-navy',
  cancelled: 'bg-ala-grey-200 text-ala-grey-500',
};

interface Filters {
  eventId: string;
  status: string;
  country: string;
  from: string;
  to: string;
  search: string;
}

const emptyFilters: Filters = { eventId: '', status: '', country: '', from: '', to: '', search: '' };

const inputCls =
  'h-9 rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

/** Build the querystring for the list endpoint from the active filters. */
function toQuery(f: Filters, page: number): string {
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('pageSize', '25');
  if (f.eventId) q.set('eventId', f.eventId);
  if (f.status) q.set('status', f.status);
  if (f.country) q.set('country', f.country);
  if (f.search) q.set('search', f.search);
  if (f.from) q.set('from', new Date(f.from + 'T00:00:00').toISOString());
  if (f.to) q.set('to', new Date(f.to + 'T23:59:59').toISOString());
  return q.toString();
}

export function Registrations() {
  const qc = useQueryClient();
  const toast = useToast();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<EventRegistration | null>(null);
  const [exporting, setExporting] = useState(false);

  const setFilter = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
    setSelected(new Set());
  };

  // Events for the filter dropdown.
  const eventsQ = useQuery({
    queryKey: ['/admin/events', 'all-for-filter'],
    queryFn: () => api.get<EventRow[]>('/admin/events?pageSize=200', { auth: true }).then((r) => r.data),
  });

  const listKey = ['/admin/registrations', filters, page];
  const list = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      const r = await api.get<EventRegistration[]>(
        `/admin/registrations?${toQuery(filters, page)}`,
        { auth: true },
      );
      return { data: r.data, meta: r.meta as ApiMeta };
    },
  });

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta;
  const pages = Math.max(1, Math.ceil((meta?.total ?? 0) / (meta?.pageSize ?? 25)));

  const eventName = useMemo(() => {
    const map = new Map((eventsQ.data ?? []).map((e) => [e.id, e.title_en]));
    return (id: string) => map.get(id) ?? '—';
  }, [eventsQ.data]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const setStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/registrations/${id}`, { status }, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/registrations'] });
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Update failed');
    }
  };

  const del = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/admin/registrations/${deleting.id}`, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/registrations'] });
      toast('success', 'Registration deleted');
      setDeleting(null);
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Delete failed');
    }
  };

  const doExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const body: Record<string, unknown> = { format };
      if (selected.size > 0) {
        body.ids = [...selected];
        if (filters.eventId) body.eventId = filters.eventId;
      } else {
        if (filters.eventId) body.eventId = filters.eventId;
        if (filters.status) body.status = filters.status;
        if (filters.country) body.country = filters.country;
        if (filters.search) body.search = filters.search;
        if (filters.from) body.from = new Date(filters.from + 'T00:00:00').toISOString();
        if (filters.to) body.to = new Date(filters.to + 'T23:59:59').toISOString();
      }
      const { data } = await api.post<Blob>('/admin/registrations/export', body, {
        auth: true,
        raw: true,
      });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendees.${format === 'xlsx' ? 'xlsx' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ala-navy">Attendees</h1>
          <p className="text-sm text-ala-grey-500">
            {meta?.total ?? 0} registration{(meta?.total ?? 0) === 1 ? '' : 's'}
            {selected.size > 0 && ` · ${selected.size} selected`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline-navy" disabled={exporting} onClick={() => doExport('xlsx')}>
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button size="sm" variant="outline-navy" disabled={exporting} onClick={() => doExport('csv')}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button size="sm" variant="outline-navy" disabled={exporting} onClick={() => doExport('pdf')}>
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-ala-grey-200 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">Event</span>
          <select className={cn(inputCls, 'w-52')} value={filters.eventId} onChange={(e) => setFilter({ eventId: e.target.value })}>
            <option value="">All events</option>
            {(eventsQ.data ?? []).map((e) => (
              <option key={e.id} value={e.id}>{e.title_en}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">Status</span>
          <select className={cn(inputCls, 'w-36')} value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">Country</span>
          <input className={cn(inputCls, 'w-36')} value={filters.country} onChange={(e) => setFilter({ country: e.target.value })} placeholder="e.g. Cameroon" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">From</span>
          <input type="date" className={inputCls} value={filters.from} onChange={(e) => setFilter({ from: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ala-grey-500">To</span>
          <input type="date" className={inputCls} value={filters.to} onChange={(e) => setFilter({ to: e.target.value })} />
        </label>
        <form
          className="flex flex-col gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter({ search: searchInput.trim() });
          }}
        >
          <span className="text-xs font-medium text-ala-grey-500">Search</span>
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ala-grey-500" />
              <input
                className={cn(inputCls, 'w-48 pl-8')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, email, ref…"
              />
            </div>
            <Button type="submit" size="sm" variant="outline-navy">Go</Button>
          </div>
        </form>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setFilters(emptyFilters);
              setSearchInput('');
              setPage(1);
              setSelected(new Set());
            }}
            className="flex items-center gap-1 text-sm text-ala-grey-500 hover:text-ala-red"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ala-grey-200 bg-ala-grey-50 text-xs uppercase tracking-wide text-ala-grey-500">
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" className="h-4 w-4 accent-ala-navy" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
                <th className="px-4 py-3 font-semibold">Ref</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Country</th>
                {!filters.eventId && <th className="px-4 py-3 font-semibold">Event</th>}
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center"><Spinner className="h-6 w-6" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-ala-grey-500">No registrations found.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-ala-grey-200 last:border-0 hover:bg-ala-grey-50/60">
                    <td className="px-3 py-3">
                      <input type="checkbox" className="h-4 w-4 accent-ala-navy" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} aria-label="Select row" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ala-navy">{r.registration_ref}</td>
                    <td className="px-4 py-3 font-medium text-ala-ink">{r.full_name}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${r.email}`} className="flex items-center gap-1 text-ala-navy hover:underline">
                        <Mail className="h-3.5 w-3.5" /> {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ala-grey-500">{r.country ?? '—'}</td>
                    {!filters.eventId && <td className="px-4 py-3 text-ala-grey-500">{eventName(r.event_id)}</td>}
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => setStatus(r.id, e.target.value)}
                        className={cn('rounded-full border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ala-navy', STATUS_STYLES[r.status])}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-ala-grey-500">{formatDate(String(r.created_at))}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" aria-label="Delete" onClick={() => setDeleting(r)} className="rounded p-1.5 text-ala-red hover:bg-ala-red/10">
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        message={`Permanently delete the registration for ${deleting?.full_name}?`}
        onConfirm={del}
      />
    </div>
  );
}
