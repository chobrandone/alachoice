import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { Spinner } from '@/components/ui/Skeleton';
import { useAuth } from './AuthContext';

/** Gate for the admin tree. Redirects to /admin/login when unauthenticated. */
export function RequireAuth({ children, superOnly }: { children: ReactNode; superOnly?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ala-navy">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (superOnly && user.role !== 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
