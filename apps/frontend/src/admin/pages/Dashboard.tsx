import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Inbox, CalendarDays, Briefcase, Mail, FileSignature } from 'lucide-react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';

interface DashboardData {
  counts: {
    newInquiries: number;
    upcomingEvents: number;
    publishedServices: number;
    subscribers: number;
    pendingQuotes: number;
  };
  recentInquiries: {
    id: string;
    name: string;
    email: string;
    message: string;
    status: string;
    created_at: string;
  }[];
}

const cards = [
  { key: 'newInquiries', label: 'New Inquiries', icon: Inbox, to: '/admin/inquiries' },
  { key: 'pendingQuotes', label: 'Pending Quotes', icon: FileSignature, to: '/admin/quote-requests' },
  { key: 'upcomingEvents', label: 'Upcoming Events', icon: CalendarDays, to: '/admin/events' },
  { key: 'publishedServices', label: 'Published Services', icon: Briefcase, to: '/admin/services' },
  { key: 'subscribers', label: 'Subscribers', icon: Mail, to: '/admin/newsletter' },
] as const;

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/admin/dashboard'],
    queryFn: () => api.get<DashboardData>('/admin/dashboard', { auth: true }).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-ala-navy" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-ala-navy">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.key}
            to={c.to}
            className="rounded-card border border-ala-grey-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <c.icon className="h-6 w-6 text-ala-red" strokeWidth={1.5} />
            <p className="mt-3 font-heading text-3xl font-bold text-ala-navy">
              {data?.counts[c.key] ?? 0}
            </p>
            <p className="text-sm text-ala-grey-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-card border border-ala-grey-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-ala-navy">Recent Inquiries</h2>
          <Link to="/admin/inquiries" className="text-sm font-medium text-ala-red hover:underline">
            View all
          </Link>
        </div>
        {data?.recentInquiries.length ? (
          <ul className="divide-y divide-ala-grey-200">
            {data.recentInquiries.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ala-navy">{i.name}</p>
                  <p className="truncate text-sm text-ala-grey-500">{i.message}</p>
                </div>
                <span className="shrink-0 text-xs text-ala-grey-500">
                  {formatDate(i.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-ala-grey-500">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
