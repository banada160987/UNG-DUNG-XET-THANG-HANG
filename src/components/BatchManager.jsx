import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Check, Save } from 'lucide-react';

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

  const handleCreate = async () => {
    if (!newBatch.name || !newBatch.deadline) return;
    const { data, error } = await supabase.from('batches').insert([newBatch]).select();
    if (!error && data) {
      setIsCreating(false);
      fetchBatches();
      onSelectBatch(data[0].id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Đợt xét thăng hạng</h2>
        <button onClick={() => setIsCreating(!isCreating)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100">
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
            <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded">Hủy</button>
            <button onClick={handleCreate} className="px-3 py-1 text-sm bg-blue-600 text-white rounded flex items-center gap-1"><Save size={14}/> Lưu</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {batches.length === 0 ? <p className="text-slate-500 text-sm italic">Chưa có đợt xét nào. Hãy tạo mới.</p> : batches.map(b => (
          <button 
            key={b.id} 
            onClick={() => onSelectBatch(b.id)}
            className={`flex flex-col text-left px-4 py-3 rounded-lg border min-w-[200px] transition-all ${activeBatchId === b.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-slate-800 text-sm truncate pr-2">{b.name}</span>
              {activeBatchId === b.id && <Check size={16} className="text-blue-600 flex-shrink-0" />}
            </div>
            <div className="text-xs text-slate-500 flex justify-between mt-auto">
              <span>Hạng: {b.type}</span>
              <span className="font-medium text-slate-700">Chỉ tiêu: {b.quota}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
