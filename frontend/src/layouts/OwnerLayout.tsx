import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const OwnerLayout: React.FC = () => {
  const { adminInfo, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="w-10 h-10 bg-[#e65100] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
            Q4
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Owner Portal</h1>
            <p className="text-xs text-gray-400">Culinary Tourism</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink 
            to="/owner/dashboard" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#e65100] text-white font-bold shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            📊 Tổng quan
          </NavLink>
          <NavLink 
            to="/owner/submissions/new" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#e65100] text-white font-bold shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            📝 Đăng ký Quán mới
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">👤</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{adminInfo?.username}</p>
              <p className="text-xs text-green-400">Verified Partner</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Không gian quản lý Chủ quán</h2>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
