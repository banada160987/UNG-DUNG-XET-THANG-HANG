import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { GraduationCap, User, Users, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { showAlert } from '../utils/alert';
import { hashPassword, logAccess, handleFailedAttempt, handleSuccessfulLogin, getRemainingLockMinutes } from '../utils/security';

export const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('teacher'); // teacher | head | secretary | admin
  const [departments, setDepartments] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);
  
  // States for Teacher
  const [cccd, setCccd] = useState('');
  const [teacherPass, setTeacherPass] = useState('');
  
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
    
    const { data: batches } = await supabase.from('batches').select('*').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
    if (batches && batches.length > 0) {
      setActiveBatch(batches[0]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (role === 'teacher') {
      if (cccd.length !== 12 || !/^\d{12}$/.test(cccd)) {
        showAlert('Thông báo', 'Vui lòng nhập đúng 12 số CCCD!');
        return;
      }
      
      const { data: teacher, error } = await supabase.from('teachers').select('*').eq('cccd', cccd).maybeSingle();
      if (error) {
        showAlert('Thông báo', 'Lỗi kết nối cơ sở dữ liệu!');
        return;
      }

      if (!teacher) {
        if (!teacherPass) {
          showAlert('Thông báo', 'Đây là lần đăng nhập đầu tiên, vui lòng nhập Mật khẩu để tạo tài khoản!');
          return;
        }
        const hashedPass = await hashPassword(teacherPass);
        const { error: insertError } = await supabase.from('teachers').insert([{ cccd, password: hashedPass }]);
        if (insertError) {
          showAlert('Thông báo', 'Lỗi tạo tài khoản!');
          return;
        }
        await logAccess(cccd, 'teacher', 'SUCCESS');
        onLogin({ role: 'teacher', cccd });
      } else {
        const lockMins = getRemainingLockMinutes(teacher.locked_until);
        if (lockMins) {
          showAlert('Lỗi', `Tài khoản đã bị khoá tạm thời. Vui lòng thử lại sau ${lockMins} phút.`);
          await logAccess(cccd, 'teacher', 'LOCKED');
          return;
        }

        if (!teacherPass) {
          showAlert('Thông báo', 'Vui lòng nhập mật khẩu!');
          return;
        }

        const hashedPass = await hashPassword(teacherPass);
        if (teacher.password !== hashedPass) {
          const isLocked = await handleFailedAttempt('teachers', 'cccd', cccd, teacher.failed_attempts || 0);
          await logAccess(cccd, 'teacher', 'FAILED');
          if (isLocked) {
             showAlert('Lỗi', 'Bạn đã nhập sai mật khẩu quá 5 lần. Tài khoản bị khoá tạm thời 15 phút.');
          } else {
             showAlert('Lỗi', 'Sai mật khẩu!');
          }
          return;
        }
        
        await handleSuccessfulLogin('teachers', 'cccd', cccd);
        await logAccess(cccd, 'teacher', 'SUCCESS');
        onLogin({ role: 'teacher', cccd });
      }
    } 
    else if (role === 'head') {
      const { data: head, error } = await supabase.from('heads').select('*').eq('department', selectedDept).maybeSingle();
      if (!head) {
         showAlert('Thông báo', 'Chưa có tài khoản cho Tổ trưởng tổ này. Vui lòng liên hệ Admin!');
         return;
      }

      const lockMins = getRemainingLockMinutes(head.locked_until);
      if (lockMins) {
        showAlert('Lỗi', `Tài khoản đã bị khoá tạm thời. Vui lòng thử lại sau ${lockMins} phút.`);
        await logAccess(selectedDept, 'head', 'LOCKED');
        return;
      }

      const hashedPass = await hashPassword(headPass);
      if (head.password !== hashedPass) {
        const isLocked = await handleFailedAttempt('heads', 'department', selectedDept, head.failed_attempts || 0);
        await logAccess(selectedDept, 'head', 'FAILED');
        if (isLocked) {
           showAlert('Lỗi', 'Nhập sai mật khẩu quá 5 lần. Tài khoản bị khoá tạm thời 15 phút.');
        } else {
           showAlert('Lỗi', 'Sai mật khẩu Tổ trưởng!');
        }
        return;
      }

      await handleSuccessfulLogin('heads', 'department', selectedDept);
      await logAccess(selectedDept, 'head', 'SUCCESS');
      onLogin({ role: 'head', department: selectedDept });
    } 
    else if (role === 'secretary') {
      const { data } = await supabase.from('secretaries').select('*').eq('username', secUser).maybeSingle();
      if (!data) {
        await logAccess(secUser, 'secretary', 'FAILED');
        showAlert('Thông báo', 'Sai tên đăng nhập hoặc mật khẩu Thư ký!');
        return;
      }

      const lockMins = getRemainingLockMinutes(data.locked_until);
      if (lockMins) {
        showAlert('Lỗi', `Tài khoản đã bị khoá tạm thời. Vui lòng thử lại sau ${lockMins} phút.`);
        await logAccess(secUser, 'secretary', 'LOCKED');
        return;
      }

      const hashedPass = await hashPassword(secPass);
      if (data.password !== hashedPass) {
        const isLocked = await handleFailedAttempt('secretaries', 'username', secUser, data.failed_attempts || 0);
        await logAccess(secUser, 'secretary', 'FAILED');
        if (isLocked) {
           showAlert('Lỗi', 'Nhập sai mật khẩu quá 5 lần. Tài khoản bị khoá tạm thời 15 phút.');
        } else {
           showAlert('Lỗi', 'Sai mật khẩu Thư ký!');
        }
        return;
      }

      await handleSuccessfulLogin('secretaries', 'username', secUser);
      await logAccess(secUser, 'secretary', 'SUCCESS');
      onLogin({ role: 'secretary', info: data });
    }
    else if (role === 'admin') {
      const { data: adminConfig } = await supabase.from('settings').select('points').eq('id', 'admin_config').maybeSingle();
      const defaultAdminPass = import.meta.env.VITE_ADMIN_PASS;
      
      let isValid = false;
      if (adminConfig && adminConfig.points && adminConfig.points.password) {
        const hashedPass = await hashPassword(adminPass);
        isValid = (adminConfig.points.password === hashedPass);
      } else {
        isValid = (adminPass === defaultAdminPass);
      }

      if (!isValid) {
        await logAccess('admin', 'admin', 'FAILED');
        showAlert('Thông báo', 'Sai mật khẩu Quản trị!');
        return;
      }
      await logAccess('admin', 'admin', 'SUCCESS');
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Hệ thống Xét thăng hạng viên chức</h1>
          <p className="text-blue-100 mt-2 text-xs sm:text-sm font-medium">Trường Tân An - Tỉnh Đắk Lắk</p>
        </div>
        
        {activeBatch && activeBatch.deadline && (
          <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm font-semibold border-b border-amber-200 shadow-inner">
            Hạn chót nộp hồ sơ đợt này: 23h59 phút ngày {new Date(activeBatch.deadline).toLocaleDateString('vi-VN')}
          </div>
        )}
        
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
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={cccd} 
                    onChange={e => setCccd(e.target.value)}
                    placeholder="Nhập 12 số CCCD..." 
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldAlert size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required 
                    value={teacherPass} 
                    onChange={e => setTeacherPass(e.target.value)}
                    placeholder="Mật khẩu của bạn..." 
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
                <p className="text-xs text-slate-500 mt-2">
                  Lưu ý: Nếu chưa có tài khoản, hệ thống sẽ tự động tạo bằng CCCD và Mật khẩu bạn nhập ở trên.
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
