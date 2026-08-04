import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderOpen, CalendarClock, UserCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePortalAuth } from './PortalAuthContext';

const NAV = [
  { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portal/applications', label: 'Applications', icon: FileText },
  { to: '/portal/documents', label: 'Documents', icon: FolderOpen },
  { to: '/portal/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/portal/profile', label: 'Profile', icon: UserCircle },
];

export function PortalLayout() {
  const { client, logout } = usePortalAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ala-grey-50">
      <header className="border-b border-ala-grey-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-heading text-lg font-bold text-ala-navy">
            ALA<span className="text-ala-red">.</span>
            <span className="ml-2 text-xs font-normal text-ala-grey-500">Client Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ala-grey-500 sm:inline">{client?.full_name}</span>
            <button
              onClick={() => {
                logout();
                navigate('/portal/login', { replace: true });
              }}
              className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-sm text-ala-grey-500 hover:bg-ala-grey-50 hover:text-ala-red"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container grid gap-8 py-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2.5 rounded-btn px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-ala-navy text-white' : 'text-ala-grey-500 hover:bg-white hover:text-ala-navy',
                )
              }
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
