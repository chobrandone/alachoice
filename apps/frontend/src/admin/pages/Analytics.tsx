import { useQuery } from '@tanstack/react-query';
import { Users, Target, FileText, Ticket, CalendarClock, TrendingUp, ListTodo, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Skeleton';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '@ala/types';
import { AreaChart, Donut, BarList, toData, type Datum } from '../components/charts';

interface Analytics {
  totals: {
    leads: number; clients: number; applications: number; registrations: number;
    inquiries: number; quotes: number; subscribers: number; upcomingAppointments: number; openTasks: number;
  };
  conversionRate: number;
  leadsOverTime: { label: string; count: number }[];
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  topCountries: { label: string; value: number }[];
  applicationsByStatus: Record<string, number>;
  applicationsByType: Record<string, number>;
}

const relabel = (d: Datum[], map: Record<string, string>): Datum[] =>
  d.map((x) => ({ ...x, label: map[x.label] ?? x.label }));

const titleCase = (d: Datum[]): Datum[] =>
  d.map((x) => ({ ...x, label: x.label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));

export function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['/admin/dashboard/analytics'],
    queryFn: () => api.get<Analytics>('/admin/dashboard/analytics', { auth: true }).then((r) => r.data),
  });

  if (isLoading || !data) {
    return <div className="flex h-64 items-center justify-center"><Spinner className="h-8 w-8 text-ala-navy" /></div>;
  }

  const t = data.totals;
  const kpis = [
    { label: 'Total leads', value: t.leads, icon: Target },
    { label: 'Conversion rate', value: `${data.conversionRate}%`, icon: TrendingUp },
    { label: 'Clients', value: t.clients, icon: Users },
    { label: 'Applications', value: t.applications, icon: FileText },
    { label: 'Event registrations', value: t.registrations, icon: Ticket },
    { label: 'Upcoming appointments', value: t.upcomingAppointments, icon: CalendarClock },
    { label: 'Open follow-ups', value: t.openTasks, icon: ListTodo },
    { label: 'Subscribers', value: t.subscribers, icon: Mail },
  ];

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ala-navy">Analytics</h1>
      <p className="mb-6 text-sm text-ala-grey-500">A live overview of leads, clients, and pipeline performance.</p>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-card border border-ala-grey-200 bg-white p-5">
            <k.icon className="h-5 w-5 text-ala-red" strokeWidth={1.5} />
            <p className="mt-3 font-heading text-3xl font-bold text-ala-navy">{k.value}</p>
            <p className="text-sm text-ala-grey-500">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Leads over time */}
      <Card title="Leads over the last 8 weeks" className="mt-6">
        <AreaChart data={data.leadsOverTime.map((w) => ({ label: w.label, value: w.count }))} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Leads by source">
          <Donut data={relabel(toData(data.leadsBySource), LEAD_SOURCE_LABELS as Record<string, string>)} />
        </Card>
        <Card title="Pipeline by status">
          <BarList data={relabel(toData(data.leadsByStatus), LEAD_STATUS_LABELS as Record<string, string>)} />
        </Card>
        <Card title="Applications by type">
          <BarList data={titleCase(toData(data.applicationsByType))} />
        </Card>
        <Card title="Applications by status">
          <BarList data={titleCase(toData(data.applicationsByStatus))} />
        </Card>
      </div>

      <Card title="Top lead countries" className="mt-6">
        <BarList data={data.topCountries} unit="leads" />
      </Card>
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-ala-grey-200 bg-white p-6 ${className ?? ''}`}>
      <h2 className="mb-4 font-heading font-semibold text-ala-navy">{title}</h2>
      {children}
    </div>
  );
}
