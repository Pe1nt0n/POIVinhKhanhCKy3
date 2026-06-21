import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLogin } from './pages/admin/AdminLogin';
import { OwnerRegister } from './pages/owner/OwnerRegister';
import { OwnerLayout } from './layouts/OwnerLayout';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { PoiSubmissionForm } from './pages/owner/PoiSubmissionForm';
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
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register/owner" element={<OwnerRegister />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<div className="p-8 text-2xl font-bold">Admin Dashboard (Coming in Step 3)</div>} />
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
