import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { ToastProvider } from './components/Toast';
import { Login } from './auth/Login';
import { AdminLayout } from './layout/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { ResourceModule } from './components/ResourceModule';
import { resourceConfigs } from './config/resources';
import { Inquiries, Quotes, Newsletter } from './pages/Submissions';
import { Registrations } from './pages/Registrations';
import { AdminApplications, AdminClientDocuments, AdminAppointments, AdminClients } from './pages/PortalAdmin';
import { Leads } from './pages/Leads';
import { Analytics } from './pages/Analytics';
import { MediaLibrary } from './pages/MediaLibrary';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';
import { AuditLog } from './pages/AuditLog';

const R = (key: keyof typeof resourceConfigs) => <ResourceModule config={resourceConfigs[key]} />;

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="leads" element={<Leads />} />
            <Route path="hero-slides" element={R('hero-slides')} />
            <Route path="pages" element={R('pages')} />
            <Route path="services" element={R('services')} />
            <Route path="events" element={R('events')} />
            <Route path="attendees" element={<Registrations />} />
            <Route path="countries" element={R('countries')} />
            <Route path="news" element={R('news')} />
            <Route path="testimonials" element={R('testimonials')} />
            <Route path="announcements" element={R('announcements')} />
            <Route path="popups" element={R('popups')} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="client-documents" element={<AdminClientDocuments />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="availability-slots" element={R('availability-slots')} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="team" element={R('team')} />
            <Route path="partners" element={R('partners')} />
            <Route path="statistics" element={R('statistics')} />
            <Route path="methodology" element={R('methodology')} />
            <Route path="timeline" element={R('timeline')} />
            <Route path="faqs" element={R('faqs')} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="quote-requests" element={<Quotes />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="users"
              element={
                <RequireAuth superOnly>
                  <Users />
                </RequireAuth>
              }
            />
            <Route path="audit-logs" element={<AuditLog />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
