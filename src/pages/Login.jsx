import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { GraduationCap, User, Users, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('teacher'); // teacher | head | secretary | admin
  const [departments, setDepartments] = useState([]);
  
  // States for Teacher
  const [cccd, setCccd] = useState('');
  
  // States for Head
  const [selectedDept, setSelectedDept] = useState('');
  const [headPass, setHeadPass] = useState('');
  
  // States for Secretary
  const [secUser, setSecUser] = useState('');
  const [secPass, setSecPass] = useState('');

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

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (role === 'teacher') {
      if (cccd.length !== 12 || !/^\d{12}$/.test(cccd)) {
        alert('Vui lòng nhập đúng 12 số CCCD!');
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
    else if (role === 'secretary') {
      // Validate with database
      const { data } = await supabase.from('secretaries').select('*').eq('username', secUser).eq('password', secPass);
      if (data && data.length > 0) {
        onLogin({ role: 'secretary', info: data[0] });
      } else {
        alert('Sai tên đăng nhập hoặc mật khẩu Thư ký!');
      }
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
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button 
              onClick={() => setRole('teacher')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'teacher' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Giáo viên
            </button>
            <button 
              onClick={() => setRole('head')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'head' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Tổ trưởng
            </button>
            <button 
              onClick={() => setRole('secretary')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'secretary' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Thư ký
            </button>
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
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
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={headPass} 
                      onChange={e => setHeadPass(e.target.value)}
                      placeholder="Nhập mật khẩu..." 
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {role === 'secretary' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập Thư ký</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={secUser} 
                      onChange={e => setSecUser(e.target.value)}
                      placeholder="vd: thuky_thu" 
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={secPass} 
                      onChange={e => setSecPass(e.target.value)}
                      placeholder="Nhập mật khẩu..." 
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                    type={showPassword ? "text" : "password"}
                    required 
                    value={adminPass} 
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="Mật khẩu Admin..." 
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 hover:bg-blue-700 transition-colors">
              Đăng nhập
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500 font-medium">
            Bản quyền thuộc về trường THPT Cao Bá Quát
          </div>
        </div>
      </div>
    </div>
  );
};
