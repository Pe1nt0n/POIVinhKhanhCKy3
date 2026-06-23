import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface MyPoi {
  id: string;
  name: string;
  description: string;
  draft_description?: string;
  audio_update_requested: boolean;
  is_active: boolean;
}

export const OwnerDashboard: React.FC = () => {
  const { adminInfo } = useAuthStore();
  const [pois, setPois] = useState<MyPoi[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoi, setEditingPoi] = useState<MyPoi | null>(null);
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats State
  const [stats, setStats] = useState({ audio_plays: 0, average_rating: 0 });

  const fetchMyPois = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/owner/poi`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setPois(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch owner POIs', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/owner/poi/stats`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setStats({
          audio_plays: json.data?.audio_plays || 0,
          average_rating: json.data?.average_rating || 0
        });
      }
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  };

  useEffect(() => {
    fetchMyPois();
    fetchStats();
    // Poll stats every 10 seconds for real-time updates
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenEdit = (poi: MyPoi) => {
    setEditingPoi(poi);
    setNewDesc(poi.draft_description || poi.description);
    setIsModalOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!editingPoi) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/owner/poi/${editingPoi.id}/request-audio-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_description: newDesc }),
        credentials: 'include'
      });
      if (res.ok) {
        alert("Đã gửi yêu cầu đổi nội dung âm thanh thành công! Vui lòng chờ Admin duyệt.");
        setIsModalOpen(false);
        fetchMyPois();
      } else {
        const json = await res.json();
        alert(`Lỗi: ${json.message}`);
      }
    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = pois.filter(p => p.is_active).length;
  const pendingCount = pois.filter(p => !p.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in relative">
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
          <p className="text-3xl font-black text-gray-900 mt-1">{activeCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-2xl mb-4">🎧</div>
          <h3 className="text-gray-500 text-sm font-bold uppercase">Lượt nghe Audio</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">{stats.audio_plays}</p>
          <p className="text-xs text-gray-400 mt-2">Cập nhật theo thời gian thực</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center text-2xl mb-4">⭐</div>
          <h3 className="text-gray-500 text-sm font-bold uppercase">Điểm đánh giá</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">{stats.average_rating.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-2">Dựa trên phản hồi từ du khách</p>
        </div>
      </div>

      {/* Danh sách Quán */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Quản lý Quán & Thuyết Minh</h2>
        {loading ? (
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        ) : pois.length === 0 ? (
          <p className="text-gray-500">Bạn chưa có quán nào. Hãy vào mục "Đăng ký Quán mới".</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pois.map(poi => (
              <div key={poi.id} className="border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{poi.name}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${poi.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {poi.is_active ? 'Đã xuất bản' : 'Chờ duyệt POI'}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 h-24 overflow-y-auto">
                  {poi.description}
                </div>
                
                {poi.audio_update_requested ? (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium border border-blue-100">
                    ⏳ Yêu cầu đổi nội dung thuyết minh đang chờ Admin duyệt.
                  </div>
                ) : (
                  <button 
                    onClick={() => handleOpenEdit(poi)}
                    className="w-full bg-[#e65100] hover:bg-[#ac1900] text-white font-bold py-2.5 rounded-xl transition-colors"
                  >
                    ✏️ Tùy chỉnh nội dung thuyết minh (Audio)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Edit Audio */}
      {isModalOpen && editingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Tùy chỉnh Thuyết minh</h2>
            <p className="text-gray-500 mb-6 text-sm">Quán: <strong className="text-gray-800">{editingPoi.name}</strong>. Cập nhật lời bình để giới thiệu quán của bạn tới du khách. Admin sẽ kiểm duyệt trước khi áp dụng.</p>
            
            <textarea
              className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e65100] outline-none text-gray-700 resize-none mb-6 bg-gray-50"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Nhập nội dung quảng cáo..."
            ></textarea>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmitEdit}
                disabled={isSubmitting || !newDesc.trim()}
                className="flex-1 bg-[#e65100] hover:bg-[#ac1900] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

