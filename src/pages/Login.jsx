import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { GraduationCap, User, Users, ShieldAlert } from 'lucide-react';

export const Login = ({ onLogin }) => {
  const [role, setRole] = useState('teacher'); // teacher | head | admin
  const [departments, setDepartments] = useState([]);
  
  // States for Teacher
  const [cccd, setCccd] = useState('');
  
  // States for Head
  const [selectedDept, setSelectedDept] = useState('');
  const [headPass, setHeadPass] = useState('');
  
  // States for Admin
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) {
      setDepartments(data);
      if (data.length > 0) setSelectedDept(data[0].name);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (role === 'teacher') {
      if (cccd.length < 9) {
        alert('Vui lòng nhập số CCCD hợp lệ!');
        return;
      }
      onLogin({ role: 'teacher', cccd });
    } 
    else if (role === 'head') {
      if (headPass !== import.meta.env.VITE_HEAD_PASS) {
        alert('Sai mật khẩu Tổ trưởng!');
        return;
      }
      onLogin({ role: 'head', department: selectedDept });
    } 
    else if (role === 'admin') {
      if (adminPass !== import.meta.env.VITE_ADMIN_PASS) {
        alert('Sai mật khẩu Quản trị!');
        return;
      }
      onLogin({ role: 'admin' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold">Hệ thống Số hóa</h1>
          <p className="text-blue-100 mt-2">Hồ sơ Xét Thăng Hạng</p>
        </div>
        
        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button 
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'teacher' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Giáo viên
            </button>
            <button 
              onClick={() => setRole('head')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'head' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Tổ trưởng
            </button>
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Quản trị
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD của bạn</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={cccd} 
                    onChange={e => setCccd(e.target.value)}
                    placeholder="Nhập CCCD để mở hồ sơ..." 
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Dùng CCCD để định danh. Nếu chưa có hồ sơ, hệ thống sẽ tự động tạo mới cho bạn nhập.
                </p>
              </div>
            )}

            {role === 'head' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tổ chuyên môn</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Users size={18} />
                    </div>
                    <select 
                      value={selectedDept} 
                      onChange={e => setSelectedDept(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {departments.length === 0 && <option>Chưa có dữ liệu Tổ</option>}
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu duyệt</label>
                  <input 
                    type="password" 
                    required 
                    value={headPass} 
                    onChange={e => setHeadPass(e.target.value)}
                    placeholder="Nhập mật khẩu..." 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            {role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu Quản trị</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldAlert size={18} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={adminPass} 
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="Mật khẩu Admin..." 
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 hover:bg-blue-700 transition-colors">
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
