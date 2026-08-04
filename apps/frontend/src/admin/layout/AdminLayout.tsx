import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Target,
  Images,
  FileText,
  Briefcase,
  CalendarDays,
  Globe2,
  Newspaper,
  MessageSquareQuote,
  Megaphone,
  MousePointerClick,
  FolderKanban,
  FileCheck2,
  CalendarClock,
  CalendarRange,
  Contact,
  Users2,
  Building2,
  BarChart3,
  ListOrdered,
  HelpCircle,
  Inbox,
  FileSignature,
  Mail,
  Ticket,
  ImageIcon,
  Settings,
  UserCog,
  ScrollText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  superOnly?: boolean;
}
interface NavGroup {
  heading: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
      { to: '/admin/leads', label: 'Leads (CRM)', icon: Target },
    ],
  },
  {
    heading: 'Content',
    items: [
      { to: '/admin/hero-slides', label: 'Hero Slides', icon: Images },
      { to: '/admin/pages', label: 'Pages', icon: FileText },
      { to: '/admin/services', label: 'Services', icon: Briefcase },
      { to: '/admin/events', label: 'Events', icon: CalendarDays },
      { to: '/admin/countries', label: 'Countries', icon: Globe2 },
      { to: '/admin/news', label: 'News', icon: Newspaper },
      { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { to: '/admin/team', label: 'Team', icon: Users2 },
      { to: '/admin/partners', label: 'Partners', icon: Building2 },
      { to: '/admin/statistics', label: 'Statistics', icon: BarChart3 },
      { to: '/admin/methodology', label: 'Methodology', icon: ListOrdered },
      { to: '/admin/timeline', label: 'Timeline', icon: ListOrdered },
      { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    ],
  },
  {
    heading: 'Marketing',
    items: [
      { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
      { to: '/admin/popups', label: 'Popups', icon: MousePointerClick },
    ],
  },
  {
    heading: 'Client Portal',
    items: [
      { to: '/admin/applications', label: 'Applications', icon: FolderKanban },
      { to: '/admin/client-documents', label: 'Documents', icon: FileCheck2 },
      { to: '/admin/appointments', label: 'Appointments', icon: CalendarClock },
      { to: '/admin/availability-slots', label: 'Availability', icon: CalendarRange },
      { to: '/admin/clients', label: 'Clients', icon: Contact },
    ],
  },
  {
    heading: 'Submissions',
    items: [
      { to: '/admin/attendees', label: 'Attendees', icon: Ticket },
      { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
      { to: '/admin/quote-requests', label: 'Quote Requests', icon: FileSignature },
      { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    ],
  },
  {
    heading: 'System',
    items: [
      { to: '/admin/media', label: 'Media Library', icon: ImageIcon },
      { to: '/admin/settings', label: 'Site Settings', icon: Settings },
      { to: '/admin/users', label: 'Users', icon: UserCog, superOnly: true },
      { to: '/admin/audit-logs', label: 'Audit Log', icon: ScrollText },
    ],
  },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ala-grey-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ala-navy text-white transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="font-heading text-xl font-bold">
            ALA<span className="text-ala-red">.</span>
            <span className="ml-2 text-xs font-normal text-white/50">Admin</span>
          </span>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white/40">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items
                  .filter((i) => !i.superOnly || user?.role === 'super_admin')
                  .map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/admin'}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-btn px-3 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-white/10 font-medium text-white'
                              : 'text-white/70 hover:bg-white/5 hover:text-white',
                          )
                        }
                      >
                        <item.icon className="h-4 w-4" strokeWidth={1.5} />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ala-grey-200 bg-white px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6 text-ala-navy" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-ala-navy">{user?.full_name}</p>
              <p className="text-xs text-ala-grey-500">{user?.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-sm text-ala-grey-500 hover:bg-ala-grey-50 hover:text-ala-red"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
