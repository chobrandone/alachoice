import { useMemo, useState } from 'react';
import { Video, MapPin, Check, X } from 'lucide-react';
import { Spinner } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { ApiError } from '@/lib/api';
import { useServices } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { useOpenSlots, useAppointments, useBookAppointment, useCancelAppointment } from '../portalApi';
import { StatusBadge } from '../StatusBadge';
import type { AppointmentMode } from '@ala/types';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function PortalAppointments() {
  const localized = useLocalized();
  const { data: services } = useServices();
  const { data: slots, isLoading: slotsLoading } = useOpenSlots();
  const { data: appts, isLoading: apptsLoading } = useAppointments();
  const book = useBookAppointment();
  const cancel = useCancelAppointment();

  const [mode, setMode] = useState<AppointmentMode>('online');
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);

  // Only slots compatible with the chosen mode.
  const openSlots = useMemo(
    () => (slots ?? []).filter((s) => s.mode === 'both' || s.mode === mode),
    [slots, mode],
  );

  // Group slots by day.
  const grouped = useMemo(() => {
    const map = new Map<string, typeof openSlots>();
    for (const s of openSlots) {
      const day = fmtDay(s.starts_at);
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return [...map.entries()];
  }, [openSlots]);

  const onBook = async (slotId: string) => {
    setError('');
    setBooked(false);
    try {
      await book.mutateAsync({
        slot_id: slotId,
        service_id: serviceId || undefined,
        mode,
        notes: notes.trim() || undefined,
      });
      setBooked(true);
      setNotes('');
      setTimeout(() => setBooked(false), 4000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Booking failed');
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ala-navy">Appointments</h1>
      <p className="mt-1 text-ala-grey-500">Book a consultation and track your meetings.</p>

      {/* Booking */}
      <div className="mt-6 rounded-card border border-ala-grey-200 bg-white p-5">
        <h2 className="font-heading font-semibold text-ala-navy">Book a consultation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Service (optional)</span>
            <select className={inputCls} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">General consultation</option>
              {(services ?? []).map((s) => (
                <option key={s.id} value={s.id}>{localized(s, 'title')}</option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Meeting type</span>
            <div className="flex gap-2">
              {(['online', 'physical'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-input border px-3 py-2.5 text-sm font-medium capitalize',
                    mode === m ? 'border-ala-navy bg-ala-navy/5 text-ala-navy' : 'border-ala-grey-200 text-ala-grey-500',
                  )}
                >
                  {m === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />} {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ala-navy">Notes (optional)</span>
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What would you like to discuss?" />
        </label>

        {booked && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Appointment requested — we'll confirm by email.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-ala-red">{error}</p>}

        {/* Slots */}
        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-ala-navy">Choose a time</p>
          {slotsLoading ? (
            <div className="flex justify-center py-8"><Spinner className="h-5 w-5 text-ala-navy" /></div>
          ) : grouped.length === 0 ? (
            <p className="rounded-input border border-dashed border-ala-grey-200 py-6 text-center text-sm text-ala-grey-500">
              No open slots right now. Please check back soon.
            </p>
          ) : (
            <div className="space-y-4">
              {grouped.map(([day, daySlots]) => (
                <div key={day}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ala-grey-500">{day}</p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        disabled={book.isPending}
                        onClick={() => onBook(s.id)}
                        className="rounded-btn border border-ala-grey-200 px-3 py-2 text-sm font-medium text-ala-navy hover:border-ala-navy hover:bg-ala-navy hover:text-white disabled:opacity-50"
                        title={s.consultant?.full_name ? `With ${s.consultant.full_name}` : undefined}
                      >
                        {fmtTime(s.starts_at)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Your appointments */}
      <div className="mt-8">
        <h2 className="mb-3 font-heading font-semibold text-ala-navy">Your appointments</h2>
        <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
          {apptsLoading ? (
            <div className="flex justify-center py-12"><Spinner className="h-6 w-6 text-ala-navy" /></div>
          ) : (appts ?? []).length === 0 ? (
            <p className="py-12 text-center text-sm text-ala-grey-500">No appointments yet.</p>
          ) : (
            <ul className="divide-y divide-ala-grey-100">
              {(appts ?? []).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ala-navy/10 text-ala-navy">
                      {a.mode === 'online' ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                    </span>
                    <div>
                      <p className="font-medium text-ala-navy">
                        {fmtDay(a.scheduled_at)} · {fmtTime(a.scheduled_at)}
                      </p>
                      <p className="text-xs text-ala-grey-500">
                        {a.service?.title_en ?? 'Consultation'} · {a.mode}
                        {a.consultant?.full_name ? ` · ${a.consultant.full_name}` : ''}
                      </p>
                      {a.status === 'confirmed' && a.meeting_link && (
                        <a href={a.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-ala-red hover:underline">
                          Join meeting →
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    {['requested', 'confirmed'].includes(a.status) && (
                      <button onClick={() => cancel.mutate(a.id)} className="rounded p-1.5 text-ala-red hover:bg-ala-red/10" aria-label="Cancel">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
