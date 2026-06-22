import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export const OwnerDashboard: React.FC = () => {
  const { adminInfo } = useAuthStore();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-[#e65100] to-orange-400 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-black mb-2">Xin chào, {adminInfo?.username}! 👋</h1>
        <p className="text-orange-100 max-w-2xl text-lg">
          Chào mừng bạn đến với Cổng Quản lý Đối tác Khu Ẩm Thực Vĩnh Khánh. Tại đây, bạn có thể đăng ký quán mới, và theo dõi lượng du khách tương tác.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-2xl mb-4">🏪</div>
          <h3 className="text-gray-500 text-sm font-bold uppercase">Quán của bạn</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">0</p>
          <p className="text-xs text-gray-400 mt-2">Đang chờ duyệt: 0</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-2xl mb-4">🎧</div>
          <h3 className="text-gray-500 text-sm font-bold uppercase">Lượt nghe Audio</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">--</p>
          <p className="text-xs text-gray-400 mt-2">Cập nhật theo thời gian thực</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center text-2xl mb-4">⭐</div>
          <h3 className="text-gray-500 text-sm font-bold uppercase">Điểm đánh giá</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">--</p>
          <p className="text-xs text-gray-400 mt-2">Dựa trên phản hồi từ du khách</p>
        </div>
      </div>
    </div>
  );
};
