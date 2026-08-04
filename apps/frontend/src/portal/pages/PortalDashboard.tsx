import { Link } from 'react-router-dom';
import { FileText, CalendarClock, Clock, CheckCircle2, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePortalAuth } from '../PortalAuthContext';
import { useApplications, useAppointments } from '../portalApi';
import { StatusBadge } from '../StatusBadge';
import { APPLICATION_TYPE_LABELS, type ApplicationType } from '@ala/types';
import { formatDate } from '@/lib/format';

export function PortalDashboard() {
  const { client } = usePortalAuth();
  const { data: apps } = useApplications();
  const { data: appts } = useAppointments();

  const list = apps ?? [];
  const upcomingAppts = (appts ?? []).filter(
    (a) => ['requested', 'confirmed'].includes(a.status) && new Date(a.scheduled_at).getTime() > Date.now(),
  ).length;
  const stats = [
    { label: 'Applications', value: list.length, icon: FileText },
    { label: 'In review', value: list.filter((a) => a.status === 'in_review' || a.status === 'submitted').length, icon: Clock },
    { label: 'Approved', value: list.filter((a) => a.status === 'approved' || a.status === 'completed').length, icon: CheckCircle2 },
    { label: 'Upcoming appointments', value: upcomingAppts, icon: CalendarClock },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ala-navy">
        Welcome back, {client?.full_name?.split(' ')[0]} 👋
      </h1>
      <p className="mt-1 text-ala-grey-500">Here's an overview of your ALA journey.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-ala-grey-200 bg-white p-5">
            <s.icon className="h-6 w-6 text-ala-red" />
            <p className="mt-3 font-heading text-3xl font-bold text-ala-navy">{s.value}</p>
            <p className="text-sm text-ala-grey-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/portal/applications/new"><Plus className="h-4 w-4" /> New application</Link>
        </Button>
        <Button asChild variant="outline-navy">
          <Link to="/portal/documents"><Upload className="h-4 w-4" /> Upload document</Link>
        </Button>
        <Button asChild variant="outline-navy">
          <Link to="/portal/appointments"><CalendarClock className="h-4 w-4" /> Book appointment</Link>
        </Button>
      </div>

      <div className="mt-8 rounded-card border border-ala-grey-200 bg-white">
        <div className="flex items-center justify-between border-b border-ala-grey-200 px-5 py-3">
          <h2 className="font-heading font-semibold text-ala-navy">Recent applications</h2>
          <Link to="/portal/applications" className="text-sm font-medium text-ala-red hover:underline">
            View all
          </Link>
        </div>
        {list.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ala-grey-500">
            No applications yet.{' '}
            <Link to="/portal/applications/new" className="font-medium text-ala-red hover:underline">
              Start one
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-ala-grey-100">
            {list.slice(0, 5).map((a) => (
              <li key={a.id}>
                <Link to={`/portal/applications/${a.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-ala-grey-50">
                  <div>
                    <p className="font-medium text-ala-navy">{a.title}</p>
                    <p className="text-xs text-ala-grey-500">
                      {APPLICATION_TYPE_LABELS[a.type as ApplicationType] ?? a.type} · {a.ref} · {formatDate(a.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
