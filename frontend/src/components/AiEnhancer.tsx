import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface AiEnhancerProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const AiEnhancer: React.FC<AiEnhancerProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, isLoading: isAuthLoading, error: authError, login, logout } = useAuthStore();
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // AI Form State
  const [poiName, setPoiName] = useState('');
  const [poiCategory, setPoiCategory] = useState('');
  const [rawDesc, setRawDesc] = useState('');
  
  // AI Response State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleEnhance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnhancing(true);
    setAiError(null);
    setEnhancedResult('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/enhance-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // IMPORTANT: Must include credentials so the browser sends the HttpOnly JWT Cookie!
        credentials: 'include',
        body: JSON.stringify({
          name: poiName,
          category: poiCategory,
          rawDescription: rawDesc
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to enhance description');
      }

      setEnhancedResult(data.data.enhanced_description);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div 
        className={`absolute top-0 right-0 h-full w-96 max-w-[90vw] bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-white/20 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-lg font-black text-gray-800 tracking-tight">AI Content Enhancer</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!isAuthenticated ? (
            <div className="animate-fade-in">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-orange-800 font-medium">
                  Tính năng này chỉ dành cho Admin/Chủ quán. Vui lòng đăng nhập để sử dụng AI Gemini.
                </p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e65100]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e65100]"
                    required
                  />
                </div>
                {authError && <p className="text-red-500 text-xs font-medium">{authError}</p>}
                <button 
                  type="submit" 
                  disabled={isAuthLoading}
                  className="mt-2 bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isAuthLoading ? 'Đang xác thực...' : 'Đăng nhập'}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col h-full">
              <form onSubmit={handleEnhance} className="flex flex-col gap-4 shrink-0">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tên Quán</label>
                    <input 
                      type="text" value={poiName} onChange={e => setPoiName(e.target.value)} required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e65100]"
                      placeholder="VD: Ốc Oanh"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Loại</label>
                    <input 
                      type="text" value={poiCategory} onChange={e => setPoiCategory(e.target.value)} required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e65100]"
                      placeholder="VD: Hải sản"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mô tả thô (Raw)</label>
                  <textarea 
                    value={rawDesc} onChange={e => setRawDesc(e.target.value)} required rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e65100] resize-none"
                    placeholder="VD: Quán ốc vỉa hè rẻ, đông khách, mở tới sáng."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isEnhancing}
                  className="bg-gradient-to-r from-[#e65100] to-orange-500 hover:from-[#ac1900] hover:to-[#e65100] text-white font-bold py-2.5 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEnhancing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Đang sáng tạo...
                    </>
                  ) : '🪄 Viết lại bằng AI'}
                </button>
                {aiError && <p className="text-red-500 text-xs font-medium mt-1">{aiError}</p>}
              </form>

              {enhancedResult && (
                <div className="mt-6 flex-1 flex flex-col min-h-0">
                  <label className="block text-xs font-bold text-green-600 uppercase mb-2">Kết quả từ Gemini</label>
                  <div className="flex-1 overflow-y-auto bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-900 leading-relaxed shadow-inner">
                    {enhancedResult}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-center shrink-0">
                <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 underline">Đăng xuất Admin</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
