import { useEffect } from 'react';
import { usePoiStore } from './store/usePoiStore';

function App() {
  const { 
    pois, 
    isSyncing, 
    lastSyncTime, 
    error, 
    initOfflineData, 
    syncWithServer,
    language,
    setLanguage
  } = usePoiStore();

  useEffect(() => {
    // Load data from IndexedDB instantly on startup
    initOfflineData();
  }, [initOfflineData]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-extrabold text-[#e65100] mb-2 tracking-tight">
          Quan4 Culinary
        </h1>
        <p className="text-gray-500 mb-8 text-sm">Offline-First PWA Prototype</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">
              Offline POIs
            </p>
            <p className="text-4xl font-black text-[#e65100]">
              {pois.length}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col justify-center">
             <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">
              Language
            </p>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-blue-200 text-blue-800 text-sm rounded-lg focus:ring-blue-500 block w-full p-2 outline-none font-medium"
            >
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg text-left border border-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={syncWithServer}
          disabled={isSyncing}
          className="w-full bg-[#e65100] hover:bg-[#ac1900] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </>
          ) : (
            'Sync with Backend'
          )}
        </button>

        {lastSyncTime && (
          <p className="mt-4 text-xs text-gray-400">
            Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
