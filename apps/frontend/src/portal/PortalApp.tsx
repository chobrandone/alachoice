import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalAuthProvider } from './PortalAuthContext';
import { RequireClient } from './RequireClient';
import { PortalLayout } from './PortalLayout';
import { PortalLogin, PortalRegister } from './pages/PortalAuth';
import { PortalDashboard } from './pages/PortalDashboard';
import { PortalApplications } from './pages/PortalApplications';
import { PortalApplicationForm } from './pages/PortalApplicationForm';
import { PortalDocuments } from './pages/PortalDocuments';
import { PortalAppointments } from './pages/PortalAppointments';
import { PortalProfile } from './pages/PortalProfile';

export default function PortalApp() {
  return (
    <PortalAuthProvider>
      <Routes>
        <Route path="login" element={<PortalLogin />} />
        <Route path="register" element={<PortalRegister />} />
        <Route
          element={
            <RequireClient>
              <PortalLayout />
            </RequireClient>
          }
        >
          <Route index element={<PortalDashboard />} />
          <Route path="applications" element={<PortalApplications />} />
          <Route path="applications/new" element={<PortalApplicationForm />} />
          <Route path="applications/:id" element={<PortalApplicationForm />} />
          <Route path="documents" element={<PortalDocuments />} />
          <Route path="appointments" element={<PortalAppointments />} />
          <Route path="profile" element={<PortalProfile />} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Route>
      </Routes>
    </PortalAuthProvider>
  );
}
