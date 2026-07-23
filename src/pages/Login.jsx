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
        showAlert('ThÃ´ng bÃ¡o', 'Vui lÃ²ng nháº­p Ä‘Ãºng 12 sá»‘ CCCD!');
        return;
      }
      
      const { data: teacher, error } = await supabase.from('teachers').select('*').eq('cccd', cccd).maybeSingle();
      if (error) {
        showAlert('ThÃ´ng bÃ¡o', 'Lá»—i káº¿t ná»‘i cÆ¡ sá»Ÿ dá»¯ liá»‡u!');
        return;
      }

      if (!teacher) {
        if (!teacherPass) {
          showAlert('ThÃ´ng bÃ¡o', 'ÄÃ¢y lÃ  láº§n Ä‘Äƒng nháº­p Ä‘áº§u tiÃªn, vui lÃ²ng nháº­p Máº­t kháº©u Ä‘á»ƒ táº¡o tÃ i khoáº£n!');
          return;
        }
        const hashedPass = await hashPassword(teacherPass);
        const { error: insertError } = await supabase.from('teachers').insert([{ cccd, password: hashedPass }]);
        if (insertError) {
          showAlert('ThÃ´ng bÃ¡o', 'Lá»—i táº¡o tÃ i khoáº£n!');
          return;
        }
        await logAccess(cccd, 'teacher', 'SUCCESS');
        onLogin({ role: 'teacher', cccd });
      } else {
        const lockMins = getRemainingLockMinutes(teacher.locked_until);
        if (lockMins) {
          showAlert('Lá»—i', `TÃ i khoáº£n Ä‘Ã£ bá»‹ khoÃ¡ táº¡m thá»i do nháº­p sai quÃ¡ nhiá»u láº§n. Vui lÃ²ng thá»­ láº¡i sau ${lockMins} phÃºt.`);
          await logAccess(cccd, 'teacher', 'LOCKED');
          return;
        }

        if (!teacherPass) {
          showAlert('ThÃ´ng bÃ¡o', 'Vui lÃ²ng nháº­p máº­t kháº©u!');
          return;
        }

        const hashedPass = await hashPassword(teacherPass);
        if (teacher.password !== hashedPass) {
          const isLocked = await handleFailedAttempt('teachers', 'cccd', cccd, teacher.failed_attempts || 0);
          await logAccess(cccd, 'teacher', 'FAILED');
          if (isLocked) {
             showAlert('Lá»—i', 'Báº¡n Ä‘Ã£ nháº­p sai máº­t kháº©u quÃ¡ 5 láº§n. TÃ i khoáº£n bá»‹ khoÃ¡ táº¡m thá»i 15 phÃºt.');
          } else {
             showAlert('Lá»—i', 'Sai máº­t kháº©u!');
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
         showAlert('ThÃ´ng bÃ¡o', 'ChÆ°a cÃ³ tÃ i khoáº£n cho Tá»• trÆ°á»Ÿng tá»• nÃ y. Vui lÃ²ng liÃªn há»‡ Admin!');
         return;
      }

      const lockMins = getRemainingLockMinutes(head.locked_until);
      if (lockMins) {
        showAlert('Lá»—i', `TÃ i khoáº£n Ä‘Ã£ bá»‹ khoÃ¡ táº¡m thá»i. Vui lÃ²ng thá»­ láº¡i sau ${lockMins} phÃºt.`);
        await logAccess(selectedDept, 'head', 'LOCKED');
        return;
      }

      const hashedPass = await hashPassword(headPass);
      if (head.password !== hashedPass) {
        const isLocked = await handleFailedAttempt('heads', 'department', selectedDept, head.failed_attempts || 0);
        await logAccess(selectedDept, 'head', 'FAILED');
        if (isLocked) {
           showAlert('Lá»—i', 'Nháº­p sai máº­t kháº©u quÃ¡ 5 láº§n. TÃ i khoáº£n bá»‹ khoÃ¡ táº¡m thá»i 15 phÃºt.');
        } else {
           showAlert('Lá»—i', 'Sai máº­t kháº©u Tá»• trÆ°á»Ÿng!');
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
        showAlert('ThÃ´ng bÃ¡o', 'Sai tÃªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u ThÆ° kÃ½!');
        return;
      }

      const lockMins = getRemainingLockMinutes(data.locked_until);
      if (lockMins) {
        showAlert('Lá»—i', `TÃ i khoáº£n Ä‘Ã£ bá»‹ khoÃ¡ táº¡m thá»i. Vui lÃ²ng thá»­ láº¡i sau ${lockMins} phÃºt.`);
        await logAccess(secUser, 'secretary', 'LOCKED');
        return;
      }

      const hashedPass = await hashPassword(secPass);
      if (data.password !== hashedPass) {
        const isLocked = await handleFailedAttempt('secretaries', 'username', secUser, data.failed_attempts || 0);
        await logAccess(secUser, 'secretary', 'FAILED');
        if (isLocked) {
           showAlert('Lá»—i', 'Nháº­p sai máº­t kháº©u quÃ¡ 5 láº§n. TÃ i khoáº£n bá»‹ khoÃ¡ táº¡m thá»i 15 phÃºt.');
        } else {
           showAlert('Lá»—i', 'Sai máº­t kháº©u ThÆ° kÃ½!');
        }
        return;
      }

      await handleSuccessfulLogin('secretaries', 'username', secUser);
      await logAccess(secUser, 'secretary', 'SUCCESS');
      onLogin({ role: 'secretary', info: data });
    }
    else if (role === 'admin') {
      if (adminPass !== import.meta.env.VITE_ADMIN_PASS) {
        await logAccess('admin', 'admin', 'FAILED');
        showAlert('ThÃ´ng bÃ¡o', 'Sai máº­t kháº©u Quáº£n trá»‹!');
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Há»‡ thá»‘ng XÃ©t thÄƒng háº¡ng viÃªn chá»©c</h1>
          <p className="text-blue-100 mt-2 text-xs sm:text-sm font-medium">TrÆ°á»ng THPT Cao BÃ¡ QuÃ¡t - PhÆ°á»ng TÃ¢n An - Tá»‰nh Äáº¯k Láº¯k</p>
        </div>
        
        {activeBatch && activeBatch.deadline && (
          <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm font-semibold border-b border-amber-200 shadow-inner">
            Háº¡n chÃ³t ná»™p há»“ sÆ¡ Ä‘á»£t nÃ y: 23h59 phÃºt ngÃ y {new Date(activeBatch.deadline).toLocaleDateString('vi-VN')}
          </div>
        )}
        
        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button 
              onClick={() => setRole('teacher')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'teacher' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              GiÃ¡o viÃªn
            </button>
            <button 
              onClick={() => setRole('head')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'head' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Tá»• trÆ°á»Ÿng
            </button>
            <button 
              onClick={() => setRole('secretary')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'secretary' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              ThÆ° kÃ½
            </button>
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 min-w-[80px] px-2 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Quáº£n trá»‹
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sá»‘ CCCD cá»§a báº¡n</label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={cccd} 
                    onChange={e => setCccd(e.target.value)}
                    placeholder="Nháº­p 12 sá»‘ CCCD..." 
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <label className="block text-sm font-medium text-slate-700 mb-1">Máº­t kháº©u</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldAlert size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required 
                    value={teacherPass} 
                    onChange={e => setTeacherPass(e.target.value)}
                    placeholder="Máº­t kháº©u cá»§a báº¡n..." 
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
                  LÆ°u Ã½: Náº¿u chÆ°a cÃ³ tÃ i khoáº£n, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng táº¡o báº±ng CCCD vÃ  Máº­t kháº©u báº¡n nháº­p á»Ÿ trÃªn.
                </p>
              </div>
            )}

            {role === 'head' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tá»• chuyÃªn mÃ´n</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Users size={18} />
                    </div>
                    <select 
                      value={selectedDept} 
                      onChange={e => setSelectedDept(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {departments.length === 0 && <option>ChÆ°a cÃ³ dá»¯ liá»‡u Tá»•</option>}
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Máº­t kháº©u duyá»‡t</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={headPass} 
                      onChange={e => setHeadPass(e.target.value)}
                      placeholder="Nháº­p máº­t kháº©u..." 
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">TÃªn Ä‘Äƒng nháº­p ThÆ° kÃ½</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Máº­t kháº©u</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={secPass} 
                      onChange={e => setSecPass(e.target.value)}
                      placeholder="Nháº­p máº­t kháº©u..." 
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Máº­t kháº©u Quáº£n trá»‹</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldAlert size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required 
                    value={adminPass} 
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="Máº­t kháº©u Admin..." 
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
              ÄÄƒng nháº­p
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500 font-medium">
            Báº£n quyá»n thuá»™c vá» trÆ°á»ng THPT Cao BÃ¡ QuÃ¡t
          </div>
        </div>
      </div>
    </div>
  );
};
