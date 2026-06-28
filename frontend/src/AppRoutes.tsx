import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLogin } from './pages/admin/AdminLogin';
import { OwnerRegister } from './pages/owner/OwnerRegister';
import { OwnerLayout } from './layouts/OwnerLayout';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { PoiSubmissionForm } from './pages/owner/PoiSubmissionForm';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminPois } from './pages/admin/AdminPois';
import { AdminApprovals } from './pages/admin/AdminApprovals';
import { AdminAudioTasks } from './pages/admin/AdminAudioTasks';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ListenPoi } from './pages/ListenPoi';
import { QRScanner } from './pages/QRScanner';
import { useAuthStore } from './store/useAuthStore';

export const AppRoutes: React.FC = () => {
  const fetchMe = useAuthStore(state => state.fetchMe);

  React.useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<App />} />
        <Route path="/listen/:poiId" element={<ListenPoi />} />
        <Route path="/scan" element={<QRScanner />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register/owner" element={<OwnerRegister />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/pois" element={<AdminPois />} />
            <Route path="/admin/audio-tasks" element={<AdminAudioTasks />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
          </Route>
        </Route>

        {/* Owner Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['poi_owner']} requireVerifiedOwner={true} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/submissions/new" element={<PoiSubmissionForm />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
