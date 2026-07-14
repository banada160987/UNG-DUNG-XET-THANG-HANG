import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { logAction } from '../utils/logger';
import { StatusBadge } from '../components/StatusBadge';
import { CandidateTimeline } from '../components/CandidateTimeline';
import { CheckCircle, XCircle, Search, UserCheck, AlertTriangle, Send, History } from 'lucide-react';

export const HeadDashboard = ({ department, onLogout }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  
  // Trạng thái modal từ chối
  const [rejectingCand, setRejectingCand] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  // Trạng thái modal lịch sử
  const [timelineCandId, setTimelineCandId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: batches } = await supabase.from('batches').select('id').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
    
    if (batches && batches.length > 0) {
      setActiveBatchId(batches[0].id);
      const { data: cands } = await supabase
        .from('candidates')
        .select('*')
        .eq('batch_id', batches[0].id)
        .eq('unit', department)
        .order('created_at', { ascending: false });
      
      setCandidates(cands || []);
    }
    setLoading(false);
  };

  const updateStatus = async (c, status, feedbackMsg = '') => {
    const action = status === 'head_approved' ? 'XÁC NHẬN HỢP LỆ' : 'YÊU CẦU BỔ SUNG';
    if (status === 'head_approved' && !confirm(`Bạn có chắc chắn muốn ${action} hồ sơ này?`)) return;

    const payload = { status };
    if (feedbackMsg) payload.feedback_message = feedbackMsg;

    const { error } = await supabase.from('candidates').update(payload).eq('id', c.id);
    if (!error) {
      await logAction(c.id, 'head', `Tổ trưởng ${department}`, action, feedbackMsg);
      loadData();
    } else {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleRejectSubmit = async (withZalo) => {
    if (!feedback.trim()) {
      alert("Vui lòng nhập lý do!");
      return;
    }
    
    await updateStatus(rejectingCand, 'head_rejected', feedback);
    
    if (withZalo && rejectingCand.phone) {
      const msg = `Chào thầy/cô, hồ sơ thăng hạng của thầy/cô cần bổ sung: ${feedback}. Thầy/cô vui lòng lên hệ thống cập nhật nhé!`;
      window.open(`https://zalo.me/${rejectingCand.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (withZalo) {
      alert("Giáo viên này chưa cập nhật Số điện thoại Zalo.");
    }
    
    setRejectingCand(null);
    setFeedback('');
  };

  // Tổ trưởng chỉ thấy hồ sơ nếu trạng thái KHÁC 'draft'
  const displayCandidates = candidates.filter(c => c.status !== 'draft');

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Duyệt hồ sơ Tổ: <span className="text-blue-600">{department}</span>
        </h2>
        <button onClick={onLogout} className="text-sm text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-medium">
          Thoát
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {!activeBatchId ? (
          <div className="text-center p-8 text-slate-500 bg-white rounded-lg border">Chưa có đợt xét nào đang mở.</div>
        ) : displayCandidates.length === 0 ? (
          <div className="text-center p-12 text-slate-500 bg-white rounded-lg border flex flex-col items-center">
            <Search size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium">Chưa có giáo viên nào nộp hồ sơ.</p>
            <p className="text-sm mt-1">Hồ sơ đã nộp của giáo viên thuộc tổ {department} sẽ hiện ở đây.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                  <th className="p-4">Họ tên / CCCD</th>
                  <th className="p-4">Tự động quét ĐK</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác của Tổ trưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayCandidates.map(c => {
                  const eligibility = checkEligibility(c);
                  // Tổ trưởng chỉ được thao tác nếu trạng thái là đã gửi Tổ trưởng, đã bổ sung, hoặc trả lại
                  const canAct = ['submitted_to_head', 'resubmitted', 'head_rejected'].includes(c.status);
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{c.fullName}</p>
                        <p className="text-xs text-slate-500">CCCD: {c.cccd}</p>
                      </td>
                      <td className="p-4">
                        {eligibility.isValid ? (
                          <span className="inline-flex text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">Hệ thống báo: Đủ ĐK</span>
                        ) : (
                          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded">
                            <span className="font-semibold block mb-1">Hệ thống phát hiện thiếu:</span>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {eligibility.missing.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {canAct ? (
                          <>
                            <button 
                              onClick={() => updateStatus(c, 'head_approved')}
                              className="inline-flex items-center gap-1 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 shadow-sm"
                            >
                              <UserCheck size={16} /> Xác nhận
                            </button>
                            <button 
                              onClick={() => setRejectingCand(c)}
                              disabled={c.status === 'head_rejected'}
                              className="inline-flex items-center gap-1 text-sm bg-white border border-rose-300 text-rose-600 px-3 py-1.5 rounded hover:bg-rose-50 shadow-sm disabled:opacity-50"
                            >
                              <XCircle size={16} /> YC Bổ sung
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Đã chuyển cấp trên</span>
                        )}
                        <button 
                          onClick={() => setTimelineCandId(c.id)}
                          className="inline-flex items-center gap-1 text-sm bg-slate-100 text-slate-600 px-2 py-1.5 rounded hover:bg-slate-200 ml-2 shadow-sm"
                          title="Xem lịch sử thao tác"
                        >
                          <History size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectingCand && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-rose-50 text-rose-700 font-bold flex justify-between items-center">
              <span>Yêu cầu bổ sung hồ sơ</span>
              <button onClick={() => setRejectingCand(null)} className="text-rose-500 hover:text-rose-700"><XCircle size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600">Giáo viên: <b>{rejectingCand.fullName}</b></p>
              <textarea 
                className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                rows="4"
                placeholder="Nhập lý do cần bổ sung (VD: Chụp thiếu ảnh quyết định lương)..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => handleRejectSubmit(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
                  Lưu (Không báo Zalo)
                </button>
                <button onClick={() => handleRejectSubmit(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm">
                  <Send size={16} /> Lưu & Báo Zalo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {timelineCandId && (
        <CandidateTimeline candidateId={timelineCandId} onClose={() => setTimelineCandId(null)} />
      )}
    </div>
  );
};
