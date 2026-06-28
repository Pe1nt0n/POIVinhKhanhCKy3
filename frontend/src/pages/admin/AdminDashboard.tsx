import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total_events_today: 0,
    poi_views_today: 0,
    audio_plays_today: 0,
    active_users: 0
  });
  const [topAudio, setTopAudio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/stats`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setStats(json.data || stats);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    }
  };

  const fetchTopAudio = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/top-audio?limit=10`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setTopAudio(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch top audio pois', e);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchTopAudio()]);
      setLoading(false);
    };
    loadAll();

    // Tự động kết nối WebSocket (SignalR) để nhận cập nhật real-time
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/analytics?role=admin`, {
         withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log('Connected to Analytics SignalR Hub'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    connection.on("ReceiveAnalyticsUpdate", () => {
      console.log('Received real-time analytics update!');
      fetchStats();
      fetchTopAudio();
    });

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard Tổng Quan</h1>
          <p className="text-gray-500 mt-1 text-sm">Thống kê hoạt động của hệ thống thời gian thực.</p>
        </div>
      </div>

      {loading && stats.total_events_today === 0 ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">📊</div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase">Tổng sự kiện (Hôm nay)</p>
                <p className="text-3xl font-black text-gray-900">{stats.total_events_today}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-2xl font-bold">🏪</div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase">Lượt xem POI</p>
                <p className="text-3xl font-black text-gray-900">{stats.poi_views_today}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-2xl font-bold">🎧</div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase">Lượt nghe Audio</p>
                <p className="text-3xl font-black text-gray-900">{stats.audio_plays_today}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-bold z-10 relative">
                <span className="animate-pulse">🔥</span>
              </div>
              <div className="z-10 relative">
                <p className="text-sm text-gray-500 font-bold uppercase">Người đang Online</p>
                <p className="text-3xl font-black text-gray-900">{stats.active_users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 Bảng Xếp Hạng POI (Top Audio)</h2>
            {topAudio.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có dữ liệu xếp hạng.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hạng</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên Quán (POI)</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Lượt Nghe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAudio.map((item, idx) => (
                      <tr key={item.poi_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-400">
                          {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-800">{item.poi_name}</td>
                        <td className="py-4 px-4 font-bold text-[#e65100] text-right">{item.play_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
