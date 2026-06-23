import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface Poi {
  id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
}

export const AdminPois: React.FC = () => {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPois = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch POIs');
        setPois(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPois();
  }, []);

  const handleDeletePoi = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa POI này vĩnh viễn không?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setPois(prev => prev.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(`Lỗi khi xóa: ${data.message}`);
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi hệ thống.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý POI (Nhà hàng)</h1>
          <p className="text-gray-500 mt-1 text-sm">Danh sách các địa điểm đang hoạt động trên bản đồ Quận 4.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-3">Đang tải dữ liệu...</p>
        ) : pois.length === 0 ? (
          <p className="text-gray-500 col-span-3">Chưa có POI nào trên hệ thống.</p>
        ) : (
          pois.map(poi => (
            <div key={poi.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{poi.name}</h3>
                {poi.is_active 
                  ? <span className="px-2 py-1 text-[10px] font-bold rounded bg-green-100 text-green-800 uppercase tracking-wider">Live</span>
                  : <span className="px-2 py-1 text-[10px] font-bold rounded bg-yellow-100 text-yellow-800 uppercase tracking-wider">Nháp</span>
                }
              </div>
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded w-max mb-3 font-medium">
                {poi.category}
              </span>
              <p className="text-sm text-gray-600 flex-1 line-clamp-3 mb-4 leading-relaxed">
                {poi.description || 'Chưa có mô tả'}
              </p>
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button 
                  onClick={() => alert("Tính năng chỉnh sửa đang được phát triển. Vui lòng duyệt qua tab Xét duyệt.")}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ✏️ Sửa
                </button>
                <button 
                  onClick={() => handleDeletePoi(poi.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🗑 Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
