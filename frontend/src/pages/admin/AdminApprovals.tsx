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

export const AdminApprovals: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, poiRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/approvals/registrations`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/v1/admin/approvals/pois`, { credentials: 'include' })
      ]);
      if (regRes.ok) {
        const regData = await regRes.json();
        const mappedRegs = regData.data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          username: r.username,
          email: r.email,
          businessName: r.business_name,
          businessAddress: r.business_address,
          status: r.status,
          createdAt: r.created_at
        }));
        setRegistrations(mappedRegs);
      }
      if (poiRes.ok) {
        const poiData = await poiRes.json();
        const mappedPois = poiData.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          ownerId: p.owner_id
        }));
        setPois(mappedPois);
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

  if (loading) {
    return <div className="p-8 text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Xét duyệt Yêu cầu</h1>
          <p className="text-gray-500 mt-1 text-sm">Quản lý đơn đăng ký Chủ quán và Bài viết mới.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Đơn Đăng ký Chủ Quán Mới</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {registrations.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có đơn đăng ký mới.</p>
            ) : (
              registrations.map(reg => (
                <div key={reg.id} className="border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{reg.businessName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                    <p><strong>Username:</strong> {reg.username}</p>
                    <p><strong>Email:</strong> {reg.email}</p>
                    <p className="col-span-2"><strong>Địa chỉ:</strong> {reg.businessAddress}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveRegistration(reg.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors">Duyệt (Approve)</button>
                    <button onClick={() => handleRejectRegistration(reg.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold transition-colors">Từ chối</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* POI Submissions Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Bài viết chờ duyệt (POI Submissions)</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {pois.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có bài viết chờ duyệt.</p>
            ) : (
              pois.map(poi => (
                <div key={poi.id} className="border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-blue-400"></div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{poi.name}</h4>
                  <p className="text-xs text-blue-600 font-bold mb-2">Owner ID: {poi.ownerId || 'N/A'}</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 italic border-l-4 border-gray-300">
                    "{poi.description.substring(0, 100)}{poi.description.length > 100 ? '...' : ''}"
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprovePoi(poi.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors">Duyệt (Xuất bản)</button>
                    <button onClick={() => handleRejectPoi(poi.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold transition-colors">Từ chối / Xóa</button>
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
