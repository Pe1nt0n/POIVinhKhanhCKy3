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
  images?: string[];
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

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [managingPoi, setManagingPoi] = useState<MyPoi | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleOpenImageManager = (poi: MyPoi) => {
    setManagingPoi(poi);
    setIsImageModalOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!managingPoi || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('images', file);

    setUploadingImage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/owner/poi/${managingPoi.id}/images`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (res.ok) {
        fetchMyPois(); // Refresh data
        // Wait briefly for backend, ideally backend returns updated POI. We refresh by re-fetching.
        const json = await res.json();
        // Cập nhật state nội bộ nếu API trả về data mới
        if (json.data && json.data.images) {
           setManagingPoi(prev => prev ? {...prev, images: json.data.images} : null);
        } else {
           // Fallback nếu api không trả về
           setManagingPoi(prev => prev ? {...prev, images: [...(prev.images||[]), ""]} : null);
           setTimeout(() => { setIsImageModalOpen(false); }, 1000);
        }
        alert("Đã tải ảnh lên thành công");
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi tải ảnh');
      }
    } catch(err) {
      console.error(err);
      alert('Đã xảy ra lỗi.');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // clear input
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!managingPoi) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/owner/poi/${managingPoi.id}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
        credentials: 'include'
      });
      if (res.ok) {
        setManagingPoi(prev => prev ? {...prev, images: prev.images?.filter(img => img !== imageUrl)} : null);
        fetchMyPois();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch(err) {
      console.error(err);
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
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium border border-blue-100 mb-2">
                    ⏳ Yêu cầu đổi nội dung thuyết minh đang chờ Admin duyệt.
                  </div>
                ) : (
                  <button 
                    onClick={() => handleOpenEdit(poi)}
                    className="w-full mb-2 bg-[#e65100] hover:bg-[#ac1900] text-white font-bold py-2 rounded-xl transition-colors text-sm"
                  >
                    ✏️ Tùy chỉnh Thuyết minh (Audio)
                  </button>
                )}
                <button 
                    onClick={() => handleOpenImageManager(poi)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl transition-colors text-sm border border-gray-200"
                  >
                    🖼 Quản lý Hình ảnh ({poi.images?.length || 0})
                </button>
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

      {/* Modal Quản lý Ảnh */}
      {isImageModalOpen && managingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Quản lý Hình ảnh</h2>
              <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-gray-500 mb-4 text-sm">Quán: <strong className="text-gray-800">{managingPoi.name}</strong></p>
            
            <div className="flex-1 overflow-y-auto min-h-[300px] bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              {!managingPoi.images || managingPoi.images.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Chưa có hình ảnh nào.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {managingPoi.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                      {img ? (
                        <img src={`${API_BASE_URL}${img}`} alt="POI" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Đang tải...</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => handleDeleteImage(img)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          title="Xóa ảnh"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <label className={`cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingImage ? 'Đang tải lên...' : '➕ Thêm Ảnh mới'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={uploadingImage} />
              </label>
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

