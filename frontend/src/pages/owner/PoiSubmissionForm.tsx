import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const PoiSubmissionForm: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerInstance = useRef<maplibregl.Marker | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [lat, setLat] = useState<number>(10.7616);
  const [lng, setLng] = useState<number>(106.7029);
  const [rawDescription, setRawDescription] = useState('');
  
  // AI Enhancer State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedDesc, setEnhancedDesc] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Online map for admin since they have internet
      center: [lng, lat],
      zoom: 15
    });

    markerInstance.current = new maplibregl.Marker({ color: '#e65100', draggable: true })
      .setLngLat([lng, lat])
      .addTo(mapInstance.current);

    markerInstance.current.on('dragend', () => {
      const lngLat = markerInstance.current?.getLngLat();
      if (lngLat) {
        setLng(lngLat.lng);
        setLat(lngLat.lat);
      }
    });

    mapInstance.current.on('click', (e) => {
      markerInstance.current?.setLngLat(e.lngLat);
      setLng(e.lngLat.lng);
      setLat(e.lngLat.lat);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  const handleEnhance = async () => {
    if (!name || !category || !rawDescription) {
      setAiError('Vui lòng điền Tên quán, Thể loại và Mô tả nháp trước khi gọi AI.');
      return;
    }
    setIsEnhancing(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/enhance-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, category, rawDescription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi từ Gemini');
      setEnhancedDesc(data.data.enhanced_description);
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyAi = () => {
    setRawDescription(enhancedDesc);
    setEnhancedDesc(''); // Hide diff view
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // In PRD, this goes to /owner/submissions to wait for Admin approval.
      // If the endpoint is missing, we fallback to /admin/poi for now.
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/poi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          category,
          description: rawDescription,
          location: { type: 'Point', coordinates: [lng, lat] },
          isActive: false // Pending approval
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi gửi thông tin');
      }

      setSubmitMessage({ type: 'success', text: 'Nộp thông tin thành công! Vui lòng chờ Admin xét duyệt.' });
      // Reset form
      setName(''); setCategory(''); setRawDescription(''); setEnhancedDesc('');
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Đăng ký Quán mới</h1>
        <p className="text-gray-500 mt-2">Điền thông tin nhà hàng, quán ăn của bạn để xuất hiện trên Bản đồ Ẩm thực Quận 4.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Basic Info & Map */}
        <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tên Quán</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" placeholder="VD: Ốc Oanh" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Thể loại</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" placeholder="VD: Quán ốc, Ăn vặt" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tọa độ Bản đồ</label>
            <p className="text-xs text-gray-500 mb-2">Click hoặc kéo thả ghim trên bản đồ để chọn vị trí chính xác.</p>
            <div ref={mapContainer} className="w-full h-64 rounded-xl border border-gray-300 overflow-hidden mb-2 shadow-inner" />
            <div className="flex gap-4">
              <input type="text" value={`Vĩ độ: ${lat.toFixed(5)}`} readOnly className="w-1/2 bg-gray-50 px-3 py-2 text-xs text-gray-500 rounded-lg border border-gray-200" />
              <input type="text" value={`Kinh độ: ${lng.toFixed(5)}`} readOnly className="w-1/2 bg-gray-50 px-3 py-2 text-xs text-gray-500 rounded-lg border border-gray-200" />
            </div>
          </div>
        </div>

        {/* Right Column: AI Enhancer & Submit */}
        <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-bold text-gray-700">Mô tả Nội dung</label>
              <button 
                type="button" 
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                {isEnhancing ? 'Đang viết...' : '✨ Cải thiện bằng AI'}
              </button>
            </div>
            {aiError && <p className="text-xs text-red-500 mb-2">{aiError}</p>}
            
            <textarea 
              value={rawDescription} onChange={e => setRawDescription(e.target.value)} required rows={enhancedDesc ? 3 : 8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100] resize-none"
              placeholder="Gõ nháp những gì bạn muốn giới thiệu về quán..."
            />

            {/* AI Diff View */}
            {enhancedDesc && (
              <div className="mt-4 flex-1 flex flex-col animate-fade-in">
                <label className="block text-sm font-bold text-green-700 mb-1">Gợi ý từ AI (Gemini)</label>
                <div className="flex-1 overflow-y-auto bg-green-50 border border-green-200 p-4 rounded-xl text-sm text-green-900 leading-relaxed shadow-inner">
                  {enhancedDesc}
                </div>
                <button 
                  type="button" onClick={handleApplyAi}
                  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition-colors shadow-md"
                >
                  ✓ Áp dụng nội dung này
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 mt-auto">
            {submitMessage && (
              <div className={`p-4 rounded-xl mb-4 text-sm font-bold ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {submitMessage.text}
              </div>
            )}
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-[#e65100] hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 text-lg"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Phê Duyệt'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Bài viết sẽ được Ban quản trị duyệt trước khi hiển thị trên Bản đồ công cộng.</p>
          </div>
        </div>

      </form>
    </div>
  );
};
