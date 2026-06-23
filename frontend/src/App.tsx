import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { usePoiStore } from './store/usePoiStore';
import { Map } from './components/Map';
import { AudioEngine } from './components/AudioEngine';
import { CustomerChatbot } from './components/CustomerChatbot';
import { QRScanner } from './pages/QRScanner';
import { PoiSubmissionForm } from './pages/PoiSubmissionForm';

function App() {
  const { 
    pois, 
    isSyncing, 
    initOfflineData, 
    syncWithServer,
    language,
    setLanguage,
    setUserLocation
  } = usePoiStore();

  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const [mockLat, setMockLat] = useState(10.75990);
  const [mockLng, setMockLng] = useState(106.70590);

  useEffect(() => {
    initOfflineData().then(() => {
      syncWithServer();
    });
  }, [initOfflineData, syncWithServer]);
  // For testing offline sync without backend, you can mock adding a POI directly
  const addMockPoi = () => {
    usePoiStore.setState({
      pois: [
        ...pois, 
        {
          id: Date.now().toString(),
          name: 'Ốc Oanh - Vinh Khanh',
          category: 'Street Food',
          location: { type: 'Point', coordinates: [106.7029, 10.7616] }, // D4 coords
          address: 'Vinh Khanh, Q4',
          price_range: '$$',
          rating: 4.8,
          priority: 1,
          images: [],
          owner_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    });
  };

  const handleTeleport = () => {
  const lng = Number(mockLng);
  const lat = Number(mockLat);

  setUserLocation([lng, lat]);

  console.log(`[MOCK GPS] Teleport tới: ${lng}, ${lat}`);
};

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      <AudioEngine onPermissionGranted={() => setAudioEnabled(true)} />
      <CustomerChatbot />

      {/* The full-screen MapLibre instance */}
      <Map />

      {/* Top Floating Overlay (Status & Sync) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        
        {/* Branding & Status */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg pointer-events-auto border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e65100] rounded-full flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-lg">VK</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 leading-tight">Khu Ẩm Thực Vĩnh Khánh</h1>
            <p className="text-xs font-semibold text-[#e65100]">
              {pois.length} POIs Loaded
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 items-end pointer-events-auto">
          <button
            onClick={syncWithServer}
            disabled={isSyncing}
            className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-50 border border-gray-100"
            title="Sync Data"
          >
            {isSyncing ? (
              <svg className="animate-spin h-5 w-5 text-[#e65100]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>



          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/90 backdrop-blur-md text-sm font-semibold text-gray-800 py-2 px-3 rounded-xl shadow-lg border border-gray-100 outline-none cursor-pointer"
          >
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇬🇧 English</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="ko">🇰🇷 한국어</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>
      </div>

      {/* Bottom Floating Overlay (Debug Tools) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center gap-3 w-11/12 max-w-sm">
        
        {/* Mock GPS Controller */}
        {audioEnabled && (
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg w-full flex flex-col gap-2 border border-gray-100">
            <div className="flex justify-between text-xs font-bold text-gray-700 px-1">
              <span>Mock GPS (Geofencing Test)</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="number" 
                step="0.0001"
                value={mockLng}
                onChange={e => setMockLng(parseFloat(e.target.value))}
                className="w-1/2 bg-gray-100 rounded px-2 py-1 text-xs outline-none"
                placeholder="Lng"
              />
              <input 
                type="number" 
                step="0.0001"
                value={mockLat}
                onChange={e => setMockLat(parseFloat(e.target.value))}
                className="w-1/2 bg-gray-100 rounded px-2 py-1 text-xs outline-none"
                placeholder="Lat"
              />
            </div>
            <button 
              onClick={handleTeleport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
            >
              Teleport 
            </button>
          </div>
        )}

        {/* Scan QR Button */}
        <button 
          onClick={() => window.location.href = '/scan'}
          className="bg-gradient-to-r from-[#e65100] to-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white mb-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Quét QR Ngay
        </button>
      </div>

    </div>
  );
}

export default App;
