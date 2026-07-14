import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Trash2, Edit } from 'lucide-react';

export const SecretaryManager = () => {
  const [secretaries, setSecretaries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newSec, setNewSec] = useState({ username: '', password: '', selectedDepts: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [secRes, depRes] = await Promise.all([
      supabase.from('secretaries').select('*').order('username'),
      supabase.from('departments').select('*').order('name')
    ]);
    
    if (secRes.data) setSecretaries(secRes.data);
    if (depRes.data) setDepartments(depRes.data);
    
    setLoading(false);
  };

  const handleToggleDept = (deptName) => {
    setNewSec(prev => {
      const isSelected = prev.selectedDepts.includes(deptName);
      if (isSelected) {
        return { ...prev, selectedDepts: prev.selectedDepts.filter(d => d !== deptName) };
      } else {
        return { ...prev, selectedDepts: [...prev.selectedDepts, deptName] };
      }
    });
  };

  const addSecretary = async (e) => {
    e.preventDefault();
    if (!newSec.username.trim() || !newSec.password.trim()) {
      alert("Vui lòng nhập Tên đăng nhập và Mật khẩu!");
      return;
    }
    if (newSec.selectedDepts.length === 0) {
      alert("Vui lòng chọn ít nhất 1 Tổ chuyên môn!");
      return;
    }

    const { error } = await supabase.from('secretaries').insert([{
      username: newSec.username.trim(),
      password: newSec.password.trim(),
      departments: newSec.selectedDepts
    }]);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      setNewSec({ username: '', password: '', selectedDepts: [] });
      loadData();
    }
  };

  const deleteSecretary = async (id) => {
    if(!confirm("Bạn có chắc chắn muốn xóa Thư ký này?")) return;
    const { error } = await supabase.from('secretaries').delete().eq('id', id);
    if (error) alert("Lỗi xóa");
    else loadData();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-slate-800">Thêm Thư ký mới</h3>
        <form onSubmit={addSecretary} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Tên đăng nhập</label>
              <input 
                type="text" 
                value={newSec.username} 
                onChange={(e) => setNewSec({...newSec, username: e.target.value})}
                placeholder="vd: thuky_thu"
                className="border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <input 
                type="text" 
                value={newSec.password} 
                onChange={(e) => setNewSec({...newSec, password: e.target.value})}
                placeholder="Mật khẩu đăng nhập"
                className="border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Chọn Tổ chuyên môn phụ trách rà soát</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-60 overflow-y-auto">
              {departments.map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={newSec.selectedDepts.includes(d.name)}
                    onChange={() => handleToggleDept(d.name)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              <Plus size={18} /> Thêm Thư ký
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Danh sách Thư ký</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b text-sm text-slate-600 font-medium">
              <th className="p-4">Tên đăng nhập</th>
              <th className="p-4">Mật khẩu</th>
              <th className="p-4">Tổ quản lý</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {secretaries.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-500">Chưa có dữ liệu</td></tr>
            ) : secretaries.map(sec => (
              <tr key={sec.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-medium">{sec.username}</td>
                <td className="p-4 font-mono text-sm">{sec.password}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {sec.departments.map(dept => (
                      <span key={dept} className="inline-flex text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded">
                        {dept}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteSecretary(sec.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
