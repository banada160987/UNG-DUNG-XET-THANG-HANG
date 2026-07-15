import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CandidateForm } from './CandidateForm';
import { StatusBadge } from '../components/StatusBadge';
import { AlertCircle, FileCheck, Search, Download } from 'lucide-react';
import { exportCandidateToWord } from '../utils/exportWord';

export const TeacherDashboard = ({ cccd, onLogout }) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: batches } = await supabase.from('batches').select('id, name').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
    
    if (!batches || batches.length === 0) {
      alert("Hiện tại không có đợt xét nào đang mở.");
      setLoading(false);
      return;
    }
    
    const batchId = batches[0].id;
    setActiveBatchId(batchId);

    const { data: cands } = await supabase.from('candidates').select('*').eq('batch_id', batchId).eq('cccd', cccd);
    
    if (cands && cands.length > 0) {
      setCandidate(cands[0]);
    }
    
    setLoading(false);
  };

  const saveCandidate = async (formData, newStatus) => {
    setLoading(true);
    const payload = { ...formData, batch_id: activeBatchId, status: newStatus };
    
    if (candidate && candidate.id) {
      const { error } = await supabase.from('candidates').update(payload).eq('id', candidate.id);
      if (error) alert('Lỗi cập nhật');
    } else {
      const { error } = await supabase.from('candidates').insert([payload]);
      if (error) alert('Lỗi nộp hồ sơ');
    }
    
    await loadData();
    if(newStatus === 'draft') alert('Đã lưu nháp thành công!');
    else alert('Đã nộp hồ sơ cho Tổ trưởng!');
  };

  const handleSaveDraft = async (formData) => {
    await saveCandidate(formData, 'draft');
  };

  const handleSubmitToHead = async (formData) => {
    const newStatus = 'submitted_to_head'; // Luôn nộp cho tổ trưởng
    await saveCandidate(formData, newStatus);
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  const isReadOnly = candidate && !['draft', 'head_rejected', 'returned'].includes(candidate.status);

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">
            Hồ sơ xét Thăng hạng
          </h2>
          {candidate && <StatusBadge status={candidate.status} />}
        </div>
        <div className="flex items-center gap-4">
          {candidate && (
            <button 
              onClick={() => exportCandidateToWord(candidate)} 
              className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 shadow-sm font-medium"
              title="Tải Danh mục hồ sơ bản Word"
            >
              <Download size={16} />
              Xuất Bìa & Danh Mục
            </button>
          )}
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
        ) : (
          <>
            {candidate?.status === 'head_rejected' && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg mb-6 flex items-start gap-3 shadow-sm">
                <AlertCircle className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Yêu cầu bổ sung hồ sơ</p>
                  <p className="text-sm mt-1">Tổ trưởng đã xem qua và yêu cầu bạn cập nhật lại thông tin. Vui lòng sửa lại các mục bị thiếu và nhấn nút "Nộp cho Tổ trưởng" để gửi lại.</p>
                </div>
              </div>
            )}
            
            {candidate?.status === 'admin_reviewing' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6 flex items-center gap-3 shadow-sm">
                <Search className="shrink-0" />
                <div>
                  <p className="font-bold">Hồ sơ đang được rà soát</p>
                  <p className="text-sm">Tổ rà soát cấp Trường đang tiến hành thẩm định hồ sơ của bạn. Không thể sửa đổi thông tin lúc này.</p>
                </div>
              </div>
            )}
            
            {(candidate?.status === 'admin_approved' || candidate?.status === 'ranked' || candidate?.status === 'finalized') && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg mb-6 flex items-center gap-3 shadow-sm">
                <FileCheck className="shrink-0" />
                <div>
                  <p className="font-bold">Hồ sơ đã Đủ điều kiện</p>
                  <p className="text-sm">Chúc mừng, hồ sơ của bạn đã vượt qua khâu rà soát cấp Trường.</p>
                </div>
              </div>
            )}

            {!isReadOnly && !candidate?.status && (
               <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6 text-sm">
                 Hãy điền thông tin bên dưới. Bạn có thể nhấn <b>Lưu nháp</b> để lưu tạm và <b>Nộp cho Tổ trưởng</b> khi đã hoàn tất.
               </div>
            )}
            
            <CandidateForm 
              initialData={candidate} 
              fixedCccd={cccd} 
              onSave={handleSaveDraft}
              onSubmitToHead={handleSubmitToHead}
              isReadOnly={isReadOnly}
            />
          </>
        )}
      </div>
    </div>
  );
};
