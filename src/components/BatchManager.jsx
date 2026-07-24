import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Check, Save, Edit2, Trash2, ArrowRightLeft } from 'lucide-react';
import { showAlert, showConfirm, showPrompt } from '../utils/alert';

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
        showAlert('Thông báo', "Có lỗi khi cập nhật!");
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
        showAlert('Thông báo', "Có lỗi khi tạo mới!");
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
        showAlert('Thông báo', "Lỗi khi xóa đợt xét");
      }
    }
  };

  const handleTransitionYear = async () => {
    if (!activeBatchId) {
      showAlert('Thông báo', 'Vui lòng chọn một đợt xét duyệt hiện tại để chuyển giao.');
      return;
    }

    const currentBatch = batches.find(b => b.id === activeBatchId);
    if (!currentBatch) return;

    const confirmed = await showConfirm(
      'CẢNH BÁO CHUYỂN GIAO NĂM HỌC',
      'Tính năng này sẽ "Đóng băng" đợt xét duyệt hiện tại và Tạo ra một đợt xét duyệt mới.\n\nTOÀN BỘ GIÁO VIÊN sẽ được chuyển sang đợt mới nhưng MỌI THÀNH TÍCH VÀ ĐIỂM SỐ SẼ BỊ XÓA SẠCH để bắt đầu lại từ đầu.\n\nBạn có chắc chắn muốn thực hiện?',
      'warning'
    );
    if (!confirmed) return;

    const newBatchName = await showPrompt(
      'Tạo đợt xét duyệt mới',
      'Nhập tên đợt xét duyệt mới...',
      `Đợt xét thăng hạng năm ${new Date().getFullYear() + 1}`
    );

    if (!newBatchName) return;

    // 1. Create new batch
    const { data: newBatchData, error: newBatchError } = await supabase.from('batches').insert([{
      name: newBatchName,
      type: currentBatch.type,
      quota: currentBatch.quota,
      deadline: currentBatch.deadline,
      isActive: true
    }]).select();

    if (newBatchError || !newBatchData) {
      showAlert('Thông báo', 'Lỗi khi tạo đợt mới!');
      return;
    }

    const newBatchId = newBatchData[0].id;

    // 2. Fetch all candidates from current batch
    const { data: oldCands } = await supabase.from('candidates').select('*').eq('batch_id', activeBatchId);
    
    // 3. Map candidates to new batch (clearing achievements)
    if (oldCands && oldCands.length > 0) {
      const newCands = oldCands.map(c => ({
        batch_id: newBatchId,
        cccd: c.cccd,
        fullName: c.fullName,
        dob: c.dob,
        gender: c.gender,
        ethnicity: c.ethnicity,
        phone: c.phone,
        unit: c.unit,
        currentTitle: c.currentTitle,
        targetTitle: c.targetTitle,
        status: 'draft',
        score: 0,
        achievements: [],
        otherAchievements: [],
        degrees: [],
        certificates: [],
        evalMinute: null,
        decisionAppointment: null,
        feedback_message: null
      }));

      const { error: insertError } = await supabase.from('candidates').insert(newCands);
      if (insertError) {
        console.error('Error migrating candidates:', insertError);
        showAlert('Thông báo', 'Đã tạo đợt mới nhưng lỗi khi sao chép danh sách giáo viên!');
      }
    }

    // 4. Set current batch to inactive
    await supabase.from('batches').update({ isActive: false }).eq('id', activeBatchId);

    showAlert('Thành công', `Đã chuyển giao sang đợt mới: ${newBatchName}. Danh sách giáo viên đã được reset!`, 'success');
    
    fetchBatches();
    onSelectBatch(newBatchId);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Đợt xét thăng hạng</h2>
        <div className="flex gap-2">
          <button onClick={handleTransitionYear} className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 border border-amber-200 transition-colors" title="Chuyển sang năm học mới (Xóa thành tích, giữ nguyên danh sách)">
            <ArrowRightLeft size={16} className="inline mr-1" /> Chuyển giao năm học
          </button>
          <button onClick={() => {
            setNewBatch({ name: '', type: 'III -> II', quota: 1, deadline: '' });
            setIsCreating(!isCreating);
          }} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            <Plus size={16} className="inline mr-1" /> Tạo đợt mới
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded border border-slate-200">
          <input type="text" placeholder="Tên đợt (VD: Năm học 2025-2026)" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} className="border border-slate-300 rounded p-2 text-sm" />
          <select value={newBatch.type} onChange={e => setNewBatch({...newBatch, type: e.target.value})} className="border border-slate-300 rounded p-2 text-sm">
            <option>III -&gt; II</option>
            <option>II -&gt; I</option>
          </select>
          <input type="number" placeholder="Chỉ tiêu" value={newBatch.quota} onChange={e => setNewBatch({...newBatch, quota: parseInt(e.target.value)})} className="border border-slate-300 rounded p-2 text-sm" />
          <input type="datetime-local" value={newBatch.deadline} onChange={e => setNewBatch({...newBatch, deadline: e.target.value})} className="border border-slate-300 rounded p-2 text-sm" />
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
            className={`p-3 border rounded-xl cursor-pointer transition-all relative group ${
              b.id === activeBatchId 
                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
            onClick={() => onSelectBatch(b.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-800">{b.name}</span>
              {b.id === activeBatchId && <Check size={16} className="text-blue-600" />}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Hạng: {b.type}</span>
              <span className="font-medium text-slate-700">Chỉ tiêu: {b.quota}</span>
            </div>
            {b.deadline && (
              <div className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                <span className="font-semibold">Hạn nộp:</span> {new Date(b.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày {new Date(b.deadline).toLocaleDateString('vi-VN')}
              </div>
            )}
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
