import { Navigate, useLocation } from 'react-router-dom';
import { usePortalAuth } from './PortalAuthContext';
import { Spinner } from '@/components/ui/Skeleton';

export function RequireClient({ children }: { children: React.ReactNode }) {
  const { client, loading } = usePortalAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-ala-navy" />
      </div>
    );
  }
  if (!client) return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
