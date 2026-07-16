import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserMinus } from 'lucide-react';
import { showAlert } from '../utils/alert';

export const TeacherManager = () => {
  const [searchCccd, setSearchCccd] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!searchCccd.trim()) {
      showAlert('Thông báo', 'Vui lòng nhập số CCCD cần đặt lại mật khẩu.');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn XÓA mật khẩu của tài khoản mang CCCD: ${searchCccd}?`)) {
      const { error } = await supabase.from('teachers').delete().eq('cccd', searchCccd.trim());
      if (error) {
        showAlert('Lỗi', 'Không thể xóa mật khẩu. Vui lòng kiểm tra lại.');
      } else {
        showAlert('Thành công', 'Đã xóa mật khẩu! Giáo viên có thể tạo mật khẩu mới ở lần đăng nhập tiếp theo.');
        setSearchCccd('');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Quản lý Tài khoản Giáo viên</h2>
      <p className="text-sm text-slate-600 mb-4">
        Khi giáo viên quên mật khẩu, bạn có thể nhập CCCD của họ vào đây để xóa mật khẩu cũ. Ở lần đăng nhập tiếp theo, hệ thống sẽ yêu cầu giáo viên tạo lại mật khẩu mới.
      </p>
      
      <form onSubmit={handleResetPassword} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Nhập 12 số CCCD của giáo viên..." 
          value={searchCccd} 
          onChange={e => setSearchCccd(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 flex-1 outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-rose-600 text-white px-4 py-2 rounded flex items-center gap-2 font-medium hover:bg-rose-700 transition-colors">
          <UserMinus size={18} /> Đặt lại Mật khẩu
        </button>
      </form>
    </div>
  );
};
