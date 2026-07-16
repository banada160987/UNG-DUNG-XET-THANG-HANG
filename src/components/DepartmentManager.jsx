import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Trash2 } from 'lucide-react';
import { showAlert, showConfirm } from '../utils/alert';

export const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [newName, setNewName] = useState('');
  const [headPasswords, setHeadPasswords] = useState({});

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) setDepartments(data);
    
    const { data: heads } = await supabase.from('heads').select('*');
    if (heads) {
      const pwMap = {};
      heads.forEach(h => pwMap[h.department] = h.password);
      setHeadPasswords(pwMap);
    }
  };

  const saveHeadPassword = async (deptName, password) => {
    if (!password) {
       showAlert('Thông báo', 'Vui lòng nhập mật khẩu');
       return;
    }
    const { error } = await supabase.from('heads').upsert({ department: deptName, password }, { onConflict: 'department' });
    if (error) showAlert('Lỗi', 'Không thể lưu mật khẩu');
    else {
       showAlert('Thành công', 'Đã lưu mật khẩu Tổ trưởng!');
       fetchDepts();
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const { error } = await supabase.from('departments').insert([{ name: newName.trim() }]);
    if (error) {
      showAlert('Thông báo', 'Lỗi thêm Tổ (Có thể bị trùng tên)');
    } else {
      setNewName('');
      fetchDepts();
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Xóa Tổ này?')) {
      await supabase.from('departments').delete().eq('id', id);
      fetchDepts();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Quản lý Tổ chuyên môn</h2>
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="Nhập tên Tổ mới..." 
          value={newName} 
          onChange={e => setNewName(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 flex-1 outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded flex items-center gap-1 font-medium hover:bg-blue-700">
          <Plus size={16} /> Thêm
        </button>
      </form>

      <div className="space-y-2">
        {departments.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Chưa có Tổ chuyên môn nào.</p>
        ) : (
          departments.map(d => (
            <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 gap-2">
              <span className="font-medium text-slate-700">{d.name}</span>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Mật khẩu Tổ trưởng"
                  value={headPasswords[d.name] || ''}
                  onChange={(e) => setHeadPasswords({...headPasswords, [d.name]: e.target.value})}
                  className="border border-slate-300 rounded px-2 py-1 text-sm w-40"
                />
                <button 
                  onClick={() => saveHeadPassword(d.name, headPasswords[d.name])}
                  className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded hover:bg-emerald-200 font-medium"
                >
                  Lưu MK
                </button>
                <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-rose-500 p-1.5 ml-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
