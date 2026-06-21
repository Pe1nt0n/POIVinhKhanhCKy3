import React from 'react';

export const AdminApprovals: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Xét duyệt Yêu cầu</h1>
          <p className="text-gray-500 mt-1 text-sm">Quản lý đơn đăng ký Chủ quán và Bài viết mới.</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3 items-start">
        <span className="text-xl">🚧</span>
        <div>
          <h3 className="text-sm font-bold text-yellow-800">Mock UI - Backend APIs Pending</h3>
          <p className="text-xs text-yellow-700 mt-1">
            Giao diện này hiện tại sử dụng dữ liệu giả lập (Mock Data). Backend C# cần bổ sung thêm các Endpoint để Admin có thể `Approve/Reject` đơn đăng ký và POI Submissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Registration Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Đơn Đăng ký Chủ Quán Mới</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            
            {/* Mock Item */}
            <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">Quán Ốc Oanh</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <p><strong>Người đại diện:</strong> Trần Văn A</p>
                <p><strong>CCCD:</strong> 079xxxxxxxxx</p>
                <p className="col-span-2"><strong>Địa chỉ:</strong> 534 Vĩnh Khánh, Q4</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors">Duyệt (Approve)</button>
                <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold transition-colors">Từ chối</button>
              </div>
            </div>

          </div>
        </div>

        {/* POI Submissions Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Bài viết chờ duyệt (POI Submissions)</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            
            {/* Mock Item */}
            <div className="border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-blue-400"></div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">Bún Bò Huế 14B</h4>
              <p className="text-xs text-blue-600 font-bold mb-2">Người nộp: bunbo14b_owner</p>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 italic border-l-4 border-gray-300">
                "Bún bò Huế chính gốc, nước lèo thanh ngọt xương bò, chả cua tự làm thơm phức..."
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors">Duyệt (Xuất bản)</button>
                <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold transition-colors">Yêu cầu sửa</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
