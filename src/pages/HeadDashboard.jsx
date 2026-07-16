import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { calculateTotalScore } from '../utils/ranking';
import { logAction } from '../utils/logger';
import { StatusBadge } from '../components/StatusBadge';
import { CandidateTimeline } from '../components/CandidateTimeline';
import { CandidateDetailsModal } from '../components/CandidateDetailsModal';
import { CompareModal } from '../components/CompareModal';
import { CheckCircle, XCircle, Search, UserCheck, AlertTriangle, Send, History, Eye, Scale } from 'lucide-react';

export const HeadDashboard = ({ department, onLogout }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [sortByScore, setSortByScore] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  
  // Trạng thái modal từ chối
  const [rejectingCand, setRejectingCand] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  // Trạng thái modal lịch sử
  const [timelineCandId, setTimelineCandId] = useState(null);
  
  // Trạng thái modal xem chi tiết
  const [viewCand, setViewCand] = useState(null);

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
  let displayCandidates = candidates.filter(c => c.status !== 'draft').map(c => ({
    ...c,
    score: calculateTotalScore(c)
  }));
  
  if (sortByScore) {
    displayCandidates = [...displayCandidates].sort((a, b) => b.score - a.score);
  }

  const handleToggleCompare = (candidateId) => {
    setSelectedForCompare(prev => {
      if (prev.includes(candidateId)) return prev.filter(id => id !== candidateId);
      return [...prev, candidateId];
    });
  };

  const getCompareCandidates = () => {
    return candidates.filter(c => selectedForCompare.includes(c.id));
  };

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
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Danh sách Giáo viên đã nộp</h3>
            <button 
              onClick={() => setSortByScore(!sortByScore)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${sortByScore ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
            >
              {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}
            </button>
            {selectedForCompare.length >= 2 && (
              <button
                onClick={() => setShowCompare(true)}
                className="ml-2 px-3 py-1.5 text-sm font-medium rounded-lg border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex items-center gap-1 shadow-sm"
              >
                <Scale size={16} /> Bàn cân đối chiếu ({selectedForCompare.length})
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                  <th className="p-4 w-12 text-center">So sánh</th>
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
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                          checked={selectedForCompare.includes(c.id)}
                          onChange={() => handleToggleCompare(c.id)}
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{c.fullName}</p>
                        <p className="text-xs text-slate-500">CCCD: {c.cccd}</p>
                        <div className="mt-1">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Điểm: {c.score}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
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
                      <td className="p-4 align-top">
                        <StatusBadge status={c.status} />
                        {c.phone && (
                          <button 
                            onClick={() => {
                              const missingDocs = c.eligibility && !c.eligibility.isValid ? c.eligibility.missing.map(m => `- ${m}`).join('\n') : '';
                              const msg = missingDocs 
                                ? `Chào thầy/cô ${c.fullName},\nHồ sơ xét thăng hạng của thầy/cô trên hệ thống đang thiếu các thông tin/giấy tờ sau:\n${missingDocs}\n\nThầy/cô vui lòng bổ sung sớm nhé!`
                                : `Chào thầy/cô ${c.fullName},\nHồ sơ xét thăng hạng của thầy/cô đã được tiếp nhận.`;
                              navigator.clipboard.writeText(msg).then(() => {
                                alert("Đã copy sẵn tin nhắn báo thiếu hồ sơ!\nBạn chỉ cần ấn Ctrl+V (Dán) vào khung chat Zalo nhé.");
                                window.location.href = `zalo://conversation?phone=${c.phone}`;
                              });
                            }}
                            className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors mt-1"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.2 5.54C20.66 4.3 19.8 3.2 18.66 2.45C17.06 1.4 14.86 0.7 12 0.7C9.14 0.7 6.94 1.4 5.34 2.45C4.2 3.2 3.34 4.3 2.8 5.54C2.26 6.8 2 8.18 2 9.7C2 11.22 2.26 12.6 2.8 13.86C3.34 15.1 4.2 16.2 5.34 16.95C6.38 17.65 7.6 18.15 8.95 18.42C8.86 18.73 8.7 19.12 8.44 19.55C8.04 20.24 7.54 20.9 7 21.46L6.82 21.65C6.73 21.75 6.64 21.86 6.55 21.98C6.32 22.25 6.42 22.65 6.72 22.78C6.88 22.84 7.05 22.85 7.22 22.78C9.56 22 11.4 20.88 12.86 19.62C14 19.53 15.1 19.26 16.1 18.84C18.25 17.9 19.98 16.42 21.1 14.48C21.7 13.4 22 12.24 22 10.98C22 9.15 21.7 7.34 21.2 5.54Z"/></svg>
                            Zalo: {c.phone}
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {canAct ? (
                          <>
                            <button 
                              onClick={() => setViewCand(c)}
                              className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 shadow-sm mr-2"
                              title="Xem chi tiết hồ sơ & minh chứng"
                            >
                              <Eye size={16} /> Xem
                            </button>
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
                          <>
                            <button 
                              onClick={() => setViewCand(c)}
                              className="inline-flex items-center gap-1 text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200 mr-2 shadow-sm"
                            >
                              <Eye size={16} /> Xem
                            </button>
                            <span className="text-xs text-slate-400 italic">Đã chuyển cấp trên</span>
                          </>
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

      {viewCand && (
        <CandidateDetailsModal 
          candidate={viewCand} 
          onClose={() => setViewCand(null)} 
          onReject={(candidate, msg) => {
            handleReject(candidate.id, msg);
            setViewCand(null);
          }}
        />
      )}

      {showCompare && (
        <CompareModal 
          candidates={getCompareCandidates()} 
          onClose={() => setShowCompare(false)} 
        />
      )}
    </div>
  );
};
