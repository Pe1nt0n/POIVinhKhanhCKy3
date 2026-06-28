import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const AdminLayout: React.FC = () => {
  const { adminInfo, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Light Mode for Admin */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center font-bold text-xl shadow-md text-white">
            Q4
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Admin Console</h1>
            <p className="text-xs text-blue-600 font-medium">Culinary Tourism</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            📊 Dashboard
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            👥 Quản lý Users
          </NavLink>
          <NavLink 
            to="/admin/pois" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            🏪 Quản lý POI
          </NavLink>

          <NavLink 
            to="/admin/approvals" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            📋 Duyệt Yêu Cầu
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {adminInfo?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{adminInfo?.username}</p>
              <p className="text-xs text-gray-500">System Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            Đăng xuất hệ thống
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50/50">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 h-16 border-b border-gray-200 flex items-center justify-between px-8 z-20">
          <h2 className="text-lg font-bold text-gray-800">Quản trị Hệ thống Bản đồ Khu Ẩm Thực Vĩnh Khánh</h2>
          <div className="flex items-center gap-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-600 font-medium">Hệ thống đang hoạt động</span>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
