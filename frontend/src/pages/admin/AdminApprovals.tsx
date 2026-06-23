import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface Registration {
  id: string;
  userId: string;
  username: string;
  email: string;
  businessName: string;
  businessAddress: string;
  status: string;
  createdAt: string;
}

interface Poi {
  id: string;
  name: string;
  description: string;
  ownerId: string;
}

interface AudioUpdate {
  id: string;
  name: string;
  description: string;
  draftDescription: string;
}

export const AdminApprovals: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pois, setPois] = useState<Poi[]>([]);
  const [audioUpdates, setAudioUpdates] = useState<AudioUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, poiRes, audioRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/approvals/registrations`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/v1/admin/approvals/pois`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/v1/admin/approvals/audio-updates`, { credentials: 'include' })
      ]);
      
      if (regRes.ok) {
        const regData = await regRes.json();
        const mappedRegs = regData.data.map((r: any) => ({
          id: r.id,
          userId: r.user_id || r.userId,
          username: r.username,
          email: r.email,
          businessName: r.business_name || r.businessName,
          businessAddress: r.business_address || r.businessAddress,
          status: r.status,
          createdAt: r.created_at || r.createdAt
        }));
        setRegistrations(mappedRegs);
      }
      
      if (poiRes.ok) {
        const poiData = await poiRes.json();
        const mappedPois = poiData.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          ownerId: p.owner_id || p.ownerId
        }));
        setPois(mappedPois);
      }
      
      if (audioRes.ok) {
        const audioData = await audioRes.json();
        const mappedUpdates = audioData.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          draftDescription: p.draft_description || p.draftDescription
        }));
        setAudioUpdates(mappedUpdates);
      }
    } catch (e) {
      console.error("Fetch approvals failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveRegistration = async (id: string) => {
    if (!window.confirm("Duyệt đơn đăng ký này?")) return;
    await fetch(`${API_BASE_URL}/api/v1/admin/approvals/registrations/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: "Approved" }),
      credentials: 'include'
    });
    fetchData();
  };

  const handleRejectRegistration = async (id: string) => {
    if (!window.confirm("Từ chối đơn đăng ký này?")) return;
    await fetch(`${API_BASE_URL}/api/v1/admin/approvals/registrations/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: "Rejected" }),
      credentials: 'include'
    });
    fetchData();
  };

  const handleApprovePoi = async (id: string) => {
    if (!window.confirm("Duyệt và xuất bản POI này?")) return;
    await fetch(`${API_BASE_URL}/api/v1/admin/approvals/pois/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: "Approved" }),
      credentials: 'include'
    });
    fetchData();
  };

  const handleRejectPoi = async (id: string) => {
    if (!window.confirm("Từ chối POI này? Thao tác này sẽ xóa bản nháp POI.")) return;
    await fetch(`${API_BASE_URL}/api/v1/admin/approvals/pois/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: "Rejected" }),
      credentials: 'include'
    });
    fetchData();
  };

  const handleApproveAudio = async (id: string) => {
    if (!window.confirm("Duyệt nội dung thuyết minh và bắt đầu sinh TTS?")) return;
    await fetch(`${API_BASE_URL}/api/v1/admin/approvals/audio-updates/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    fetchData();
  };

  const handleRejectAudio = async (id: string) => {
    if (!window.confirm("Từ chối bản nháp thuyết minh này?")) return;
    await fetch(`${API_BASE_URL}/api/v1/admin/approvals/audio-updates/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    fetchData();
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Xét duyệt Yêu cầu</h1>
          <p className="text-gray-500 mt-1 text-sm">Quản lý đơn đăng ký Chủ quán, Bài viết mới, và Cập nhật Nội dung Thuyết minh.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Đăng ký Chủ Quán Mới</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {registrations.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có yêu cầu.</p>
            ) : (
              registrations.map(reg => (
                <div key={reg.id} className="border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-orange-400"></div>
                  <h4 className="font-bold text-gray-900 mb-1">{reg.businessName}</h4>
                  <div className="text-xs text-gray-600 mb-3 space-y-1">
                    <p>User: {reg.username}</p>
                    <p>Email: {reg.email}</p>
                    <p>Đ/c: {reg.businessAddress}</p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => handleApproveRegistration(reg.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg font-bold transition-colors">Duyệt</button>
                    <button onClick={() => handleRejectRegistration(reg.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-1.5 rounded-lg font-bold transition-colors">Từ chối</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* POI Submissions Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Đăng ký Quán Mới</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {pois.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có bài viết chờ duyệt.</p>
            ) : (
              pois.map(poi => (
                <div key={poi.id} className="border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-400"></div>
                  <h4 className="font-bold text-gray-900 mb-1">{poi.name}</h4>
                  <p className="text-[10px] text-blue-600 font-bold mb-2 break-all">Owner: {poi.ownerId || 'N/A'}</p>
                  <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 mb-3 italic border-l-2 border-gray-300">
                    "{poi.description.substring(0, 80)}{poi.description.length > 80 ? '...' : ''}"
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => handleApprovePoi(poi.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg font-bold transition-colors">Duyệt & Xuất bản</button>
                    <button onClick={() => handleRejectPoi(poi.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-1.5 rounded-lg font-bold transition-colors">Xóa</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audio Content Updates Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Sửa Nội Dung Audio</h3>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Mới</span>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {audioUpdates.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có yêu cầu cập nhật Audio.</p>
            ) : (
              audioUpdates.map(update => (
                <div key={update.id} className="border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-400"></div>
                  <h4 className="font-bold text-gray-900 mb-2">{update.name}</h4>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs">
                      <span className="font-bold text-gray-500 uppercase block mb-0.5">Bản Cũ:</span>
                      <p className="bg-gray-50 p-2 rounded text-gray-500 line-clamp-3">{update.description}</p>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-purple-600 uppercase block mb-0.5">Bản Nháp (Chủ quán gửi):</span>
                      <p className="bg-purple-50 border border-purple-100 p-2 rounded text-gray-800 h-24 overflow-y-auto">{update.draftDescription}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm">
                    <button onClick={() => handleApproveAudio(update.id)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg font-bold transition-colors">Duyệt & Sinh TTS</button>
                    <button onClick={() => handleRejectAudio(update.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg font-bold transition-colors">Từ chối</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
