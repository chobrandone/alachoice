import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { useApplications } from '../portalApi';
import { StatusBadge } from '../StatusBadge';
import { APPLICATION_TYPE_LABELS, type ApplicationType } from '@ala/types';
import { formatDate } from '@/lib/format';

export function PortalApplications() {
  const { data: apps, isLoading } = useApplications();
  const list = apps ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">Applications</h1>
        <Button asChild size="sm">
          <Link to="/portal/applications/new"><Plus className="h-4 w-4" /> New</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-ala-navy" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-card border border-dashed border-ala-grey-200 bg-white py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-ala-grey-300" />
          <p className="mt-3 text-ala-grey-500">You haven't started any applications yet.</p>
          <Button asChild className="mt-5">
            <Link to="/portal/applications/new">Start your first application</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
          <ul className="divide-y divide-ala-grey-100">
            {list.map((a) => (
              <li key={a.id}>
                <Link to={`/portal/applications/${a.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-ala-grey-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ala-navy">{a.title}</p>
                    <p className="text-xs text-ala-grey-500">
                      {APPLICATION_TYPE_LABELS[a.type as ApplicationType] ?? a.type} · {a.ref} · {formatDate(a.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    {a.status === 'draft' && (
                      <span className="hidden text-xs text-ala-grey-500 sm:inline">{a.progress}% complete</span>
                    )}
                    <StatusBadge status={a.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
