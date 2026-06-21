import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // e.g., ['admin', 'super_admin', 'poi_owner']
  requireVerifiedOwner?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  requireVerifiedOwner = false 
}) => {
  const { isAuthenticated, isHydrating, adminInfo } = useAuthStore();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !adminInfo) {
    // Redirect them to the /admin/login page, but save the current location they were trying to go to
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = adminInfo.role_ids.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-red-700">403 Forbidden</h1>
          <p className="text-red-500 mt-2">You do not have the required roles to access this page.</p>
        </div>
      );
    }
  }

  // Check POI Owner Verification Status
  if (requireVerifiedOwner && !adminInfo.is_poi_owner_verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-6 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-yellow-800">Tài khoản đang chờ duyệt</h1>
        <p className="text-yellow-600 mt-2 max-w-md">
          Yêu cầu đăng ký Chủ quán của bạn đang được Ban quản trị Khu Ẩm Thực Vĩnh Khánh xem xét. 
          Vui lòng quay lại sau khi nhận được email thông báo phê duyệt.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
