import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Check, Save, Edit2, Trash2 } from 'lucide-react';

export const BatchManager = ({ activeBatchId, onSelectBatch }) => {
  const [batches, setBatches] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', type: 'III -> II', quota: 1, deadline: '' });
  
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    const { data } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
    if (data) {
      setBatches(data);
      if (!activeBatchId && data.length > 0) {
        onSelectBatch(data[0].id);
      }
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!newBatch.name || !newBatch.deadline) return;
    if (newBatch.id) {
      // Sửa
      const { error } = await supabase.from('batches').update({
        name: newBatch.name, type: newBatch.type, quota: newBatch.quota, deadline: newBatch.deadline
      }).eq('id', newBatch.id);
      if (!error) {
        setIsCreating(false);
        setNewBatch({ name: '', type: 'III -> II', quota: 1, deadline: '' });
        fetchBatches();
      } else {
        alert("Có lỗi khi cập nhật!");
      }
    } else {
      // Tạo mới
      const { data, error } = await supabase.from('batches').insert([newBatch]).select();
      if (!error && data) {
        setIsCreating(false);
        setNewBatch({ name: '', type: 'III -> II', quota: 1, deadline: '' });
        fetchBatches();
        onSelectBatch(data[0].id);
      } else {
        alert("Có lỗi khi tạo mới!");
      }
    }
  };

  const handleEdit = (b, e) => {
    e.stopPropagation();
    setNewBatch(b);
    setIsCreating(true);
  };

  const handleDelete = async (b, e) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa đợt: ${b.name}? CẢNH BÁO: Toàn bộ hồ sơ ứng viên thuộc đợt này cũng sẽ bị xóa vĩnh viễn!`)) {
      const { error } = await supabase.from('batches').delete().eq('id', b.id);
      if (!error) {
        fetchBatches();
        if (activeBatchId === b.id) onSelectBatch(null);
      } else {
        alert("Lỗi khi xóa đợt xét");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Đợt xét thăng hạng</h2>
        <button onClick={() => {
          setNewBatch({ name: '', type: 'III -> II', quota: 1, deadline: '' });
          setIsCreating(!isCreating);
        }} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100">
          <Plus size={16} className="inline mr-1" /> Tạo đợt mới
        </button>
      </div>

      {isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
          <input type="text" placeholder="Tên đợt (VD: Đợt 1 năm 2026)" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} className="border border-slate-300 rounded p-2 text-sm col-span-2" />
          <select value={newBatch.type} onChange={e => setNewBatch({...newBatch, type: e.target.value})} className="border border-slate-300 rounded p-2 text-sm bg-white">
            <option>III -&gt; II</option>
            <option>II -&gt; I</option>
          </select>
          <input type="number" placeholder="Chỉ tiêu" value={newBatch.quota} onChange={e => setNewBatch({...newBatch, quota: parseInt(e.target.value)})} className="border border-slate-300 rounded p-2 text-sm" />
          <input type="date" value={newBatch.deadline} onChange={e => setNewBatch({...newBatch, deadline: e.target.value})} className="border border-slate-300 rounded p-2 text-sm" />
          <div className="col-span-full flex justify-end gap-2 mt-2">
            <button onClick={() => {
              setIsCreating(false);
              setNewBatch({ name: '', type: 'III -> II', quota: 1, deadline: '' });
            }} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded">Hủy</button>
            <button onClick={handleCreateOrUpdate} className="px-3 py-1 text-sm bg-blue-600 text-white rounded flex items-center gap-1"><Save size={14}/> Lưu</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {batches.length === 0 ? <p className="text-slate-500 text-sm italic">Chưa có đợt xét nào. Hãy tạo mới.</p> : batches.map(b => (
          <div 
            key={b.id} 
            className={`flex flex-col text-left px-4 py-3 rounded-lg border min-w-[200px] transition-all relative group cursor-pointer ${activeBatchId === b.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
            onClick={() => onSelectBatch(b.id)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-slate-800 text-sm truncate pr-2">{b.name}</span>
              {activeBatchId === b.id && <Check size={16} className="text-blue-600 flex-shrink-0" />}
            </div>
            <div className="text-xs text-slate-500 flex justify-between mt-auto items-center">
              <span>Hạng: {b.type}</span>
              <span className="font-medium text-slate-700">Chỉ tiêu: {b.quota}</span>
            </div>
            {/* Các nút sửa xóa hiển thị khi hover */}
            <div className="absolute -top-2 -right-2 hidden group-hover:flex bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden z-10">
              <button 
                onClick={(e) => handleEdit(b, e)} 
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Sửa đợt xét"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={(e) => handleDelete(b, e)} 
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border-l border-slate-200"
                title="Xóa đợt xét"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
