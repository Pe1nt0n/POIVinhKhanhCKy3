import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface Poi {
  id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  images?: string[];
}

export const AdminPois: React.FC = () => {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [managingPoi, setManagingPoi] = useState<Poi | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Localization Modal State
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [locName, setLocName] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [locAudio, setLocAudio] = useState<File | null>(null);
  const [locs, setLocs] = useState<any[]>([]);
  const [savingLoc, setSavingLoc] = useState(false);

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

  useEffect(() => {
    fetchPois();
  }, []);

  // --- IMAGE MANAGEMENT ---
  const handleOpenImageManager = (poi: Poi) => {
    setManagingPoi(poi);
    setIsImageModalOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!managingPoi || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('file', file); // AdminPoiController expects 'file'

    setUploadingImage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi/${managingPoi.id}/images`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.url) {
           setManagingPoi(prev => prev ? {...prev, images: [...(prev.images||[]), json.data.url]} : null);
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
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!managingPoi) return;
    if (!window.confirm("Xóa ảnh này?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi/${managingPoi.id}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageUrl), // Sending as string json
        credentials: 'include'
      });
      if (res.ok) {
        setManagingPoi(prev => prev ? {...prev, images: prev.images?.filter(img => img !== imageUrl)} : null);
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch(err) {
      console.error(err);
    }
  };

  // --- REVIEW MANAGEMENT ---
  const handleOpenReviews = async (poi: Poi) => {
    setManagingPoi(poi);
    setIsReviewModalOpen(true);
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/public/poi/${poi.id}/reviews`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Đánh giá này?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        alert("Lỗi xóa Đánh giá");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- LOCALIZATION MANAGEMENT ---
  const handleOpenLocalizations = async (poi: Poi) => {
    setManagingPoi(poi);
    setIsLocModalOpen(true);
    await fetchLocalizations(poi.id);
  };

  const fetchLocalizations = async (poiId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi/${poiId}/localizations`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setLocs(json.data || []);
        updateLocForm(json.data || [], 'en');
      }
    } catch (e) {
      console.error("Failed to fetch localizations", e);
    }
  };

  const updateLocForm = (localizations: any[], lang: string) => {
    setCurrentLang(lang);
    setLocAudio(null);
    const loc = localizations.find((l: any) => l.lang === lang);
    if (loc) {
      setLocName(loc.name || '');
      setLocDesc(loc.description || '');
    } else {
      setLocName('');
      setLocDesc('');
    }
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateLocForm(locs, e.target.value);
  };

  const handleSaveLocalization = async () => {
    if (!managingPoi) return;
    setSavingLoc(true);
    try {
      const formData = new FormData();
      formData.append('lang', currentLang);
      formData.append('name', locName);
      formData.append('description', locDesc);
      if (locAudio) {
        formData.append('audio', locAudio);
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi/${managingPoi.id}/localizations`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (res.ok) {
        alert("Lưu bản dịch và âm thanh thành công!");
        await fetchLocalizations(managingPoi.id);
      } else {
        const data = await res.json();
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi hệ thống.");
    } finally {
      setSavingLoc(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (!managingPoi) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa Audio của ngôn ngữ này?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi/${managingPoi.id}/localizations/${currentLang}/audio`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert("Xóa Audio thành công!");
        await fetchLocalizations(managingPoi.id);
      } else {
        const data = await res.json();
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi hệ thống.");
    }
  };

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
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleOpenImageManager(poi)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  🖼 Ảnh ({poi.images?.length || 0})
                </button>
                <button 
                  onClick={() => handleOpenReviews(poi)}
                  className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  ⭐ Đánh giá
                </button>
                <button 
                  onClick={() => handleOpenLocalizations(poi)}
                  className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 px-2 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  🎧 Bản dịch & Audio
                </button>
                <button 
                  onClick={() => handleDeletePoi(poi.id)}
                  className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  🗑 Xóa POI
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Quản lý Ảnh */}
      {isImageModalOpen && managingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Quản lý Hình ảnh</h2>
              <button onClick={() => { setIsImageModalOpen(false); fetchPois(); }} className="text-gray-400 hover:text-gray-600">
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
                onClick={() => { setIsImageModalOpen(false); fetchPois(); }}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Đánh giá */}
      {isReviewModalOpen && managingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Quản lý Đánh giá</h2>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-gray-500 mb-4 text-sm">Quán: <strong className="text-gray-800">{managingPoi.name}</strong></p>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              {loadingReviews ? (
                <p className="text-gray-500 text-center py-10">Đang tải đánh giá...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-sm">Chưa có đánh giá nào cho POI này.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-4 h-4 ${star <= rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm mb-1">{rev.comment || <span className="text-gray-400 italic">Không có nội dung</span>}</p>
                        <p className="text-xs text-gray-400">Ngày: {new Date(rev.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(rev.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 text-right">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Localizations */}
      {isLocModalOpen && managingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Quản lý Bản dịch & Audio</h2>
              <button onClick={() => setIsLocModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-gray-500 mb-6 text-sm">Quán: <strong className="text-gray-800">{managingPoi.name}</strong></p>
            
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Chọn Ngôn ngữ</label>
                <select 
                  value={currentLang} 
                  onChange={handleLangChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">Tiếng Anh (English)</option>
                  <option value="zh">Tiếng Trung (中文)</option>
                  <option value="ja">Tiếng Nhật (日本語)</option>
                  <option value="ko">Tiếng Hàn (한국어)</option>
                  <option value="fr">Tiếng Pháp (Français)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên Quán (Bản dịch)</label>
                <input 
                  type="text" 
                  value={locName} 
                  onChange={e => setLocName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập tên quán..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (Bản dịch)</label>
                <textarea 
                  value={locDesc} 
                  onChange={e => setLocDesc(e.target.value)}
                  className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Nhập mô tả..."
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">File Âm thanh (Audio .mp3)</label>
                <div className="flex flex-col gap-3">
                  {locs.find(l => l.lang === currentLang)?.audio_url && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-700 font-bold mb-1">Đã có Audio</p>
                          <audio 
                            src={`${API_BASE_URL}${locs.find(l => l.lang === currentLang)?.audio_url}`} 
                            controls 
                            className="h-8 w-48"
                          />
                        </div>
                        <button 
                          onClick={handleDeleteAudio}
                          className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
                        >
                          Xóa Audio
                        </button>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="audio/*"
                    onChange={e => setLocAudio(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-400">Tải lên file âm thanh mới sẽ ghi đè file cũ (nếu có).</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsLocModalOpen(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={handleSaveLocalization}
                disabled={savingLoc || !locName}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {savingLoc ? 'Đang lưu...' : 'Lưu Bản dịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
