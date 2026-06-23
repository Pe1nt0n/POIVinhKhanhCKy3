import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const OwnerRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    businessName: '',
    businessAddress: '',
    cccd: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Hits the OwnerAuthController endpoint in C# Backend
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auth/register-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          business_name: formData.businessName,
          business_address: formData.businessAddress,
          cccd: formData.cccd
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-12 px-10 shadow-2xl rounded-3xl text-center border-t-8 border-green-500">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Đăng ký Thành Công!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Hồ sơ chủ quán của bạn đã được gửi đến Ban Quản Trị Khu Ẩm Thực Vĩnh Khánh. Quá trình kiểm duyệt có thể mất từ 1-2 ngày làm việc.
          </p>
          <button 
            onClick={() => navigate('/admin/login')}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
          >
            Quay lại trang Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-10">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Hợp tác cùng Khu Ẩm Thực Vĩnh Khánh</h2>
        <p className="mt-3 text-lg text-gray-600">Đăng ký trở thành Đối tác Ẩm thực chính thức</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Thông tin Tài khoản</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Tên đăng nhập</label>
                <input type="text" name="username" required onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                <input type="password" name="password" required onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" />
              </div>

              <div className="sm:col-span-2 mt-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Thông tin Doanh nghiệp & Định danh</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Tên Doanh nghiệp / Tên Quán</label>
                <input type="text" name="businessName" required onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">CCCD / CMND của Chủ quán</label>
                <input type="text" name="cccd" required onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700">Địa chỉ Kinh doanh</label>
                <input type="text" name="businessAddress" required onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700">Email liên hệ</label>
                <input type="email" name="email" required onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#e65100] focus:border-[#e65100]" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium">
                ❌ {error}
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => navigate('/admin/login')} className="w-1/3 bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 font-bold py-3 rounded-xl transition-colors">
                Hủy
              </button>
              <button type="submit" disabled={isSubmitting} className="w-2/3 bg-gradient-to-r from-[#e65100] to-orange-500 hover:from-[#ac1900] hover:to-[#e65100] text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 transition-all">
                {isSubmitting ? 'Đang xử lý...' : 'Gửi Đơn Đăng Ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
