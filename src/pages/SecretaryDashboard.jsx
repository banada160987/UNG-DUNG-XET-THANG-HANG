import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { logAction } from '../utils/logger';
import { StatusBadge } from '../components/StatusBadge';
import { CandidateTimeline } from '../components/CandidateTimeline';
import { CandidateDetailsModal } from '../components/CandidateDetailsModal';
import { Users, FileText, CheckSquare, Search, ThumbsUp, ThumbsDown, LogOut, XCircle, Send, History, Eye } from 'lucide-react';

export const SecretaryDashboard = ({ secretaryInfo, onLogout }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Trạng thái modal từ chối
  const [rejectingCand, setRejectingCand] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  // Trạng thái modal lịch sử
  const [timelineCandId, setTimelineCandId] = useState(null);
  
  // Trạng thái modal xem chi tiết
  const [viewCand, setViewCand] = useState(null);

  useEffect(() => {
    loadData();
  }, [secretaryInfo]);

  const loadData = async () => {
    setLoading(true);
    const { data: batches } = await supabase.from('batches').select('id').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
    
    if (batches && batches.length > 0) {
      setActiveBatchId(batches[0].id);
      
      const managedDepts = secretaryInfo.departments || [];
      
      if (managedDepts.length > 0) {
        const { data: cands } = await supabase
          .from('candidates')
          .select('*')
          .eq('batch_id', batches[0].id)
          .in('unit', managedDepts)
          .order('created_at', { ascending: false });
        
        setCandidates(cands || []);
      } else {
        setCandidates([]);
      }
    }
    setLoading(false);
  };

  const updateStatus = async (c, status, feedbackMsg = '') => {
    let action = 'Bắt đầu rà soát';
    if(status === 'admin_approved') action = 'ĐỦ ĐIỀU KIỆN';
    if(status === 'returned') action = 'TRẢ LẠI / YÊU CẦU BỔ SUNG'; // Đổi status thành returned thay vì admin_rejected

    const payload = { status };
    if (feedbackMsg) payload.feedback_message = feedbackMsg;

    const { error } = await supabase.from('candidates').update(payload).eq('id', c.id);
    if (!error) {
      await logAction(c.id, 'secretary', `Thư ký ${secretaryInfo.username}`, action, feedbackMsg);
      loadData();
    } else {
      alert('Lỗi cập nhật trạng thái!');
    }
  };

  const handleRejectSubmit = async (withZalo) => {
    if (!feedback.trim()) {
      alert("Vui lòng nhập lý do!");
      return;
    }
    
    await updateStatus(rejectingCand, 'returned', feedback);
    
    if (withZalo && rejectingCand.phone) {
      const msg = `Chào thầy/cô, hồ sơ thăng hạng của thầy/cô cần bổ sung: ${feedback}. Thầy/cô vui lòng lên hệ thống cập nhật nhé!`;
      window.open(`https://zalo.me/${rejectingCand.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (withZalo) {
      alert("Giáo viên này chưa cập nhật Số điện thoại Zalo.");
    }
    
    setRejectingCand(null);
    setFeedback('');
  };

  const evaluated = useMemo(() => {
    return candidates.map(c => ({
      ...c,
      eligibility: checkEligibility(c)
    }));
  }, [candidates]);

  // Thống kê
  const totalCount = evaluated.length;
  const waitingAdminCount = evaluated.filter(c => c.status === 'head_approved').length;
  const reviewingCount = evaluated.filter(c => c.status === 'admin_reviewing').length;
  const adminFinishedCount = evaluated.filter(c => ['admin_approved', 'returned', 'ranked', 'finalized'].includes(c.status)).length;

  const displayList = evaluated.filter(c => {
    if (selectedFilter === 'waiting') return c.status === 'head_approved';
    if (selectedFilter === 'reviewing') return c.status === 'admin_reviewing';
    if (selectedFilter === 'finished') return ['admin_approved', 'returned', 'ranked', 'finalized'].includes(c.status);
    return true; 
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row pb-10">
      
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl flex-shrink-0 z-20">
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">Thư ký Rà soát</h1>
            <p className="text-xs text-slate-400">@{secretaryInfo.username}</p>
          </div>
        </div>
        
        <div className="p-4 space-y-2 flex-1">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-2">Tổ phân công rà soát:</div>
          {secretaryInfo.departments?.map(d => (
            <div key={d} className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm font-medium">
              {d}
            </div>
          ))}
          {(!secretaryInfo.departments || secretaryInfo.departments.length === 0) && (
            <div className="text-sm italic text-amber-500">Chưa được phân công tổ nào</div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg text-sm transition-colors text-slate-400"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden flex flex-col h-screen overflow-y-auto bg-slate-100">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Tiếp nhận & Rà soát Hồ sơ</h2>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {!activeBatchId ? (
            <div className="text-center p-8 text-slate-500 bg-white rounded-lg border">Chưa có đợt xét nào đang mở.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Tất cả Hồ sơ" 
                  value={totalCount} 
                  icon={<Users className="text-slate-500" size={24} />} 
                  bgColor="bg-slate-50"
                  active={selectedFilter === 'all'}
                  onClick={() => setSelectedFilter('all')}
                />
                <StatCard 
                  title="Mới nhận từ Tổ" 
                  value={waitingAdminCount} 
                  icon={<FileText className="text-blue-500" size={24} />} 
                  bgColor="bg-blue-50"
                  active={selectedFilter === 'waiting'}
                  onClick={() => setSelectedFilter('waiting')}
                  pulse={waitingAdminCount > 0}
                />
                <StatCard 
                  title="Đang Rà soát" 
                  value={reviewingCount} 
                  icon={<Search className="text-amber-500" size={24} />} 
                  bgColor="bg-amber-50"
                  active={selectedFilter === 'reviewing'}
                  onClick={() => setSelectedFilter('reviewing')}
                />
                <StatCard 
                  title="Đã Rà soát xong" 
                  value={adminFinishedCount} 
                  icon={<CheckSquare className="text-emerald-500" size={24} />} 
                  bgColor="bg-emerald-50"
                  active={selectedFilter === 'finished'}
                  onClick={() => setSelectedFilter('finished')}
                />
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText size={18} className="text-slate-500" />
                    Danh sách được phân công rà soát
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {displayList.length === 0 ? (
                    <p className="text-center p-8 text-slate-400">Không có dữ liệu phù hợp.</p>
                  ) : displayList.map(c => {
                    const adminCanAct = ['head_approved', 'admin_reviewing'].includes(c.status);
                    
                    return (
                    <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-800 text-lg">{c.fullName} <span className="text-sm font-normal text-slate-500">({c.cccd})</span></p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                          <span className="text-sm text-slate-600 font-medium">{c.unit}</span>
                          <StatusBadge status={c.status} />
                          {c.phone && (
                            <a href={`https://zalo.me/${c.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
                              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.2 5.54C20.66 4.3 19.8 3.2 18.66 2.45C17.06 1.4 14.86 0.7 12 0.7C9.14 0.7 6.94 1.4 5.34 2.45C4.2 3.2 3.34 4.3 2.8 5.54C2.26 6.8 2 8.18 2 9.7C2 11.22 2.26 12.6 2.8 13.86C3.34 15.1 4.2 16.2 5.34 16.95C6.38 17.65 7.6 18.15 8.95 18.42C8.86 18.73 8.7 19.12 8.44 19.55C8.04 20.24 7.54 20.9 7 21.46L6.82 21.65C6.73 21.75 6.64 21.86 6.55 21.98C6.32 22.25 6.42 22.65 6.72 22.78C6.88 22.84 7.05 22.85 7.22 22.78C9.56 22 11.4 20.88 12.86 19.62C14 19.53 15.1 19.26 16.1 18.84C18.25 17.9 19.98 16.42 21.1 14.48C21.7 13.4 22 12.24 22 10.98C22 9.15 21.7 7.34 21.2 5.54Z"/></svg>
                              Zalo: {c.phone}
                            </a>
                          )}
                        </div>
                        
                        {!c.eligibility.isValid && (
                          <div className="flex flex-wrap gap-1">
                            {c.eligibility.missing.map((err, i) => (
                              <span key={i} className="inline-flex text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md font-medium">
                                {err}
                              </span>
                            ))}
                          </div>
                        )}
                        {c.eligibility.isValid && (
                          <span className="inline-flex text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md font-medium">
                            Hệ thống: Đủ điều kiện ban đầu
                          </span>
                        )}
                        <button 
                          onClick={() => setTimelineCandId(c.id)}
                          className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 mt-2 shadow-sm"
                        >
                          <History size={14} /> Xem lịch sử thao tác
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <button 
                          onClick={() => setViewCand(c)}
                          className="flex items-center justify-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 shadow-sm mb-1"
                        >
                          <Eye size={16} /> Xem Chi Tiết Hồ Sơ
                        </button>
                        
                        {c.status === 'head_approved' && (
                          <button onClick={() => updateStatus(c, 'admin_reviewing')} className="flex items-center justify-center gap-1 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 shadow-sm">
                            <Search size={16} /> Bắt đầu rà soát
                          </button>
                        )}
                        
                        {c.status === 'admin_reviewing' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateStatus(c, 'admin_approved')} className="flex-1 flex items-center justify-center gap-1 text-sm bg-emerald-600 text-white px-2 py-2 rounded-lg hover:bg-emerald-700 shadow-sm">
                              <ThumbsUp size={16} /> Đủ ĐK
                            </button>
                            <button onClick={() => setRejectingCand(c)} className="flex-1 flex items-center justify-center gap-1 text-sm bg-white border border-rose-300 text-rose-600 px-2 py-2 rounded-lg hover:bg-rose-50 shadow-sm">
                              <ThumbsDown size={16} /> Loại
                            </button>
                          </div>
                        )}
                        
                        {['admin_approved', 'returned', 'ranked', 'finalized'].includes(c.status) && (
                          <button onClick={() => updateStatus(c, 'admin_reviewing')} className="text-xs text-slate-500 hover:text-blue-600 underline text-right">
                            Rà soát lại
                          </button>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

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
        <CandidateDetailsModal candidate={viewCand} onClose={() => setViewCand(null)} />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, active, onClick, pulse }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-xl border cursor-pointer transition-all ${
      active ? 'border-blue-400 shadow-md ring-2 ring-blue-50' : 'border-slate-200 shadow-sm hover:border-slate-300 bg-white'
    } flex items-center gap-4 relative overflow-hidden`}
  >
    {active && <div className="absolute inset-0 bg-blue-50/30"></div>}
    <div className={`p-3 rounded-full ${bgColor} relative z-10 ${pulse ? 'animate-pulse' : ''}`}>
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);
