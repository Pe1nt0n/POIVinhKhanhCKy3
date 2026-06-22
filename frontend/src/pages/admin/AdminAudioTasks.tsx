import React, { useEffect, useState, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface AudioTask {
  id: string;
  poiId: string;
  lang: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  progress: number; // 0 to 100
  audioUrl?: string;
  error?: string;
  createdAt: string;
}

export const AdminAudioTasks: React.FC = () => {
  const [tasks, setTasks] = useState<AudioTask[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'sse' | 'polling' | 'offline'>('connecting');
  const pollingInterval = useRef<number | null>(null);

  const fetchTasksFallback = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/audio/tasks`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const mappedTasks = data.data.map((t: any) => ({
          id: t.id,
          poiId: t.poi_id,
          lang: t.lang,
          status: t.status,
          progress: t.progress,
          audioUrl: t.audio_url,
          error: t.error,
          createdAt: t.created_at
        }));
        setTasks(mappedTasks);
      }
    } catch (err) {
      console.error('Polling failed:', err);
    }
  };

  useEffect(() => {
    let sse: EventSource | null = null;
    let isMounted = true;

    const setupSSE = () => {
      // Mock SSE endpoint - assumes backend might implement it at /stream
      sse = new EventSource(`${API_BASE_URL}/api/v1/audio/tasks/stream`, {
        withCredentials: true
      });

      sse.onopen = () => {
        if (isMounted) setConnectionStatus('sse');
      };

      sse.onmessage = (event) => {
        try {
          const rawTasks = JSON.parse(event.data);
          const mappedTasks = rawTasks.map((t: any) => ({
            id: t.id,
            poiId: t.poi_id,
            lang: t.lang,
            status: t.status,
            progress: t.progress,
            audioUrl: t.audio_url,
            error: t.error,
            createdAt: t.created_at
          }));
          if (isMounted) setTasks(mappedTasks);
        } catch (e) {
          console.error('Invalid SSE payload', e);
        }
      };

      sse.onerror = (err) => {
        console.warn('SSE Error, falling back to Polling...', err);
        sse?.close();
        if (isMounted) {
          setConnectionStatus('polling');
          // Start Polling fallback
          fetchTasksFallback(); // Initial fetch
          pollingInterval.current = window.setInterval(fetchTasksFallback, 3000);
        }
      };
    };

    setupSSE();

    return () => {
      isMounted = false;
      sse?.close();
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Trình tạo Âm thanh (TTS)</h1>
          <p className="text-gray-500 mt-1 text-sm">Theo dõi tiến trình sinh âm thanh đa ngôn ngữ cho các POI.</p>
        </div>
        
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kết nối:</span>
          {connectionStatus === 'connecting' && <span className="flex items-center gap-1 text-xs font-bold text-yellow-600"><span className="animate-spin text-sm">⏳</span> Đang kết nối</span>}
          {connectionStatus === 'sse' && <span className="flex items-center gap-1 text-xs font-bold text-green-600"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> SSE (Realtime)</span>}
          {connectionStatus === 'polling' && <span className="flex items-center gap-1 text-xs font-bold text-blue-600">⚡ Polling (3s)</span>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            
            {tasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl mb-3 block">🎧</span>
                Chưa có tiến trình âm thanh nào đang chạy.
              </div>
            )}

            {tasks.map(task => (
              <div key={task.id} className="border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                      ${task.status === 'done' ? 'bg-green-100 text-green-600' : ''}
                      ${task.status === 'processing' ? 'bg-blue-100 text-blue-600' : ''}
                      ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : ''}
                      ${task.status === 'failed' ? 'bg-red-100 text-red-600' : ''}
                    `}>
                      {task.status === 'done' ? '✓' : task.status === 'failed' ? '✖' : task.lang.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Mã POI: {task.poiId}</h4>
                      <p className="text-xs text-gray-500">Ngôn ngữ: {task.lang.toUpperCase()} • Tác vụ: {task.id.slice(-6)}</p>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div>
                    {task.status === 'pending' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">Chờ xử lý</span>}
                    {task.status === 'processing' && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded animate-pulse">Đang chạy...</span>}
                    {task.status === 'done' && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">Hoàn tất</span>}
                    {task.status === 'failed' && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">Thất bại</span>}
                  </div>
                </div>

                {/* Progress Bar Container */}
                {task.status === 'processing' && (
                  <div className="mt-2 relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-blue-600">Đang tổng hợp giọng nói...</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">{task.progress}%</span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100 relative">
                      <div style={{ width: `${task.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 relative">
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden rounded">
                          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error View */}
                {task.status === 'failed' && (
                  <div className="mt-2 bg-red-50 p-3 rounded-lg border border-red-100">
                    <p className="text-xs text-red-700 font-medium">Lỗi: {task.error || 'Lỗi hệ thống không xác định'}</p>
                  </div>
                )}

                {/* Success View */}
                {task.status === 'done' && task.audioUrl && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-600">URL: <a href={`${API_BASE_URL}${task.audioUrl}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{task.audioUrl}</a></p>
                    <button 
                      onClick={() => new Audio(`${API_BASE_URL}${task.audioUrl}`).play()}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded"
                    >
                      Nghe thử
                    </button>
                  </div>
                )}

              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
};
