import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CandidateForm } from './CandidateForm';
import { FileCheck, AlertCircle } from 'lucide-react';

export const TeacherDashboard = ({ cccd, onLogout }) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // 1. Tìm đợt xét đang mở
    const { data: batches } = await supabase.from('batches').select('id, name').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
    
    if (!batches || batches.length === 0) {
      alert("Hiện tại không có đợt xét nào đang mở.");
      setLoading(false);
      return;
    }
    
    const batchId = batches[0].id;
    setActiveBatchId(batchId);

    // 2. Tìm hồ sơ của CCCD này trong đợt đó
    const { data: cands } = await supabase.from('candidates').select('*').eq('batch_id', batchId).eq('cccd', cccd);
    
    if (cands && cands.length > 0) {
      setCandidate(cands[0]);
    }
    
    setLoading(false);
  };

  const handleSave = async (formData) => {
    setLoading(true);
    const payload = { ...formData, batch_id: activeBatchId, status: 'draft' };
    
    if (candidate && candidate.id) {
      const { error } = await supabase.from('candidates').update(payload).eq('id', candidate.id);
      if (error) alert('Lỗi cập nhật');
    } else {
      const { error } = await supabase.from('candidates').insert([payload]);
      if (error) alert('Lỗi nộp hồ sơ');
    }
    
    await loadData();
    alert('Đã lưu hồ sơ thành công!');
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Khai báo hồ sơ cá nhân
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">CCCD: {cccd}</span>
          <button onClick={onLogout} className="text-sm text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-medium">
            Thoát
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {!activeBatchId ? (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-lg border border-amber-200 text-center">
            Hiện tại không có đợt xét nào đang mở. Vui lòng quay lại sau.
          </div>
        ) : candidate?.status === 'verified' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center max-w-2xl mx-auto mt-10 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hồ sơ đã được phê duyệt!</h3>
            <p className="text-slate-600 mb-6">
              Hồ sơ của bạn đã được Tổ trưởng xác nhận hợp lệ. Bạn không thể chỉnh sửa thêm thông tin.
            </p>
            <div className="text-left bg-white p-4 rounded-lg border border-slate-200">
              <p><strong>Họ tên:</strong> {candidate.fullName}</p>
              <p><strong>Tổ chuyên môn:</strong> {candidate.unit}</p>
              <p><strong>Chức danh đăng ký:</strong> {candidate.targetTitle}</p>
            </div>
          </div>
        ) : (
          <>
            {candidate?.status === 'rejected' && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg mb-6 flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Hồ sơ cần chỉnh sửa</p>
                  <p className="text-sm mt-1">Tổ trưởng đã yêu cầu bạn rà soát và sửa lại thông tin. Vui lòng cập nhật và Lưu lại.</p>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6 text-sm">
              Hãy điền đầy đủ thông tin bên dưới. Bạn có thể lưu nháp nhiều lần trước khi Tổ trưởng duyệt.
            </div>
            
            <CandidateForm 
              initialData={candidate} 
              fixedCccd={cccd} 
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </div>
  );
};
