import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Trash2 } from 'lucide-react';

export const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) setDepartments(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const { error } = await supabase.from('departments').insert([{ name: newName.trim() }]);
    if (error) {
      alert('Lỗi thêm Tổ (Có thể bị trùng tên)');
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
            <div key={d.id} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-medium text-slate-700">{d.name}</span>
              <button onClick={() => handleDelete(d.id)} className="text-rose-500 hover:bg-rose-100 p-1 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
