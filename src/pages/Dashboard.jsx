import React, { useState, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { calculateTotalScore } from '../utils/ranking';
import { StatusBadge } from '../components/StatusBadge';
import { logAction } from '../utils/logger';
import { CandidateTimeline } from '../components/CandidateTimeline';
import { CandidateDetailsModal } from '../components/CandidateDetailsModal';
import { CompareModal } from '../components/CompareModal';
import { SettingsModal } from '../components/SettingsModal';
import { useSettings } from '../contexts/SettingsContext';
import { Users, FileText, CheckSquare, XCircle, Search, ThumbsUp, ThumbsDown, History, Eye, Trash2, Scale, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { showAlert, showConfirm, showPrompt } from '../utils/alert';

export const Dashboard = ({ candidates, onRefresh }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [timelineCandId, setTimelineCandId] = useState(null);
  const [viewCand, setViewCand] = useState(null);
  const [sortByScore, setSortByScore] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { settings } = useSettings();

  const evaluated = useMemo(() => {
    return candidates.map(c => ({
      ...c,
      eligibility: checkEligibility(c),
      score: calculateTotalScore(c, settings)
    }));
  }, [candidates, settings]);

  const updateStatus = async (id, status) => {
    let action = 'Bắt đầu rà soát';
    if(status === 'admin_approved') action = 'ĐỦ ĐIỀU KIỆN';
    if(status === 'admin_rejected') action = 'TỪ CHỐI / LOẠI';

    const { error } = await supabase.from('candidates').update({ status }).eq('id', id);
    if (!error) {
      await logAction(id, 'admin', 'Ban Giám Hiệu', action, '');
      if(onRefresh) onRefresh();
    } else {
      showAlert('Thông báo', 'Lỗi cập nhật trạng thái!');
    }
  };

  const handleReject = async (id, message) => {
    const msg = message || await showPrompt('Lý do từ chối', "Nhập lý do báo cho giáo viên...", "");
    if (msg === null) return;
    const { error } = await supabase.from('candidates').update({ status: 'returned', feedback_message: msg }).eq('id', id);
    if (!error) {
      await logAction(id, 'admin', 'Ban Giám Hiệu', 'TRẢ LẠI HỒ SƠ', msg);
      if (onRefresh) onRefresh();
    } else {
      showAlert('Thông báo', 'Lỗi cập nhật trạng thái!');
    }
  };

  const handleDeleteCandidate = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN hồ sơ của giáo viên ${name} không?\nHành động này không thể hoàn tác!`)) {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (!error) {
        if (onRefresh) onRefresh();
      } else {
        showAlert('Thông báo', 'Có lỗi xảy ra khi xóa hồ sơ!');
      }
    }
  };

  // Thống kê
  const totalCount = evaluated.length;
  const waitingAdminCount = evaluated.filter(c => c.status === 'head_approved').length;
  const reviewingCount = evaluated.filter(c => c.status === 'admin_reviewing').length;
  const adminFinishedCount = evaluated.filter(c => ['admin_approved', 'admin_rejected', 'ranked', 'finalized'].includes(c.status)).length;

  let displayList = evaluated.filter(c => {
    if (selectedFilter === 'waiting') return c.status === 'head_approved';
    if (selectedFilter === 'reviewing') return c.status === 'admin_reviewing';
    if (selectedFilter === 'finished') return ['admin_approved', 'returned', 'ranked', 'finalized'].includes(c.status);
    return true; 
  });

  if (sortByScore) {
    displayList = [...displayList].sort((a, b) => b.score - a.score);
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

  // Dữ liệu Biểu đồ tròn
  const pieData = [
    { name: 'Đủ điều kiện', value: evaluated.filter(c => ['admin_approved', 'ranked', 'finalized'].includes(c.status)).length, color: '#10b981' },
    { name: 'Đang rà soát', value: evaluated.filter(c => ['admin_reviewing', 'head_approved'].includes(c.status)).length, color: '#f59e0b' },
    { name: 'Trả lại/Loại', value: evaluated.filter(c => ['returned', 'admin_rejected', 'head_rejected'].includes(c.status)).length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  // Dữ liệu Biểu đồ cột
  const barData = useMemo(() => {
    const counts = {};
    evaluated.forEach(c => {
      counts[c.unit] = (counts[c.unit] || 0) + 1;
    });
    return Object.keys(counts).map(unit => ({
      name: unit || 'Chưa có tổ',
      total: counts[unit]
    })).sort((a, b) => b.total - a.total);
  }, [evaluated]);

  return (
    <div className="space-y-6 pb-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-80 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            Tỉ lệ phê duyệt
          </h3>
          <div className="flex-1 min-h-0">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-80 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            Số lượng nộp theo Tổ
          </h3>
          <div className="flex-1 min-h-0">
            {barData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 50, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            Danh sách rà soát cấp Trường ({displayList.length})
          </h3>
          {settings?.use_scoring !== false && (
            <div className="flex gap-2">
              <button 
                onClick={() => setSortByScore(!sortByScore)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${sortByScore ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
              >
                {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}
              </button>
              {selectedForCompare.length >= 2 && (
                <button
                  onClick={() => setShowCompare(true)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Scale size={16} /> Bàn cân đối chiếu ({selectedForCompare.length})
                </button>
              )}
            </div>
          )}
        </div>
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {displayList.length === 0 ? (
            <p className="text-center p-8 text-slate-400">Không có dữ liệu phù hợp.</p>
          ) : displayList.map(c => {
            return (
            <div key={c.id} className="p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {settings?.use_scoring !== false && (
                    <div className="pt-1">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                        checked={selectedForCompare.includes(c.id)}
                        onChange={() => handleToggleCompare(c.id)}
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-800 text-lg">{c.fullName} <span className="text-sm font-normal text-slate-500">({c.cccd})</span></p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                      {settings?.use_scoring !== false && (
                        <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Điểm: {c.score}</span>
                      )}
                      <span className="text-sm text-slate-600 font-medium">{c.unit}</span>
                      <StatusBadge status={c.status} />
                      {c.phone && (
                        <button 
                          onClick={() => {
                            const missingDocs = c.eligibility && !c.eligibility.isValid ? c.eligibility.missing.map(m => `- ${m}`).join('\n') : '';
                            const msg = missingDocs 
                              ? `Chào thầy/cô ${c.fullName},\nHồ sơ xét thăng hạng của thầy/cô trên hệ thống đang thiếu các thông tin/giấy tờ sau:\n${missingDocs}\n\nThầy/cô vui lòng bổ sung sớm nhé!`
                              : `Chào thầy/cô ${c.fullName},\nHồ sơ xét thăng hạng của thầy/cô đã được tiếp nhận.`;
                            navigator.clipboard.writeText(msg).then(() => {
                              showAlert('Thông báo', "Đã copy sẵn tin nhắn báo thiếu hồ sơ!\nBạn chỉ cần ấn Ctrl+V (Dán) vào khung chat Zalo nhé.");
                              window.location.href = `zalo://conversation?phone=${c.phone}`;
                            });
                          }}
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.2 5.54C20.66 4.3 19.8 3.2 18.66 2.45C17.06 1.4 14.86 0.7 12 0.7C9.14 0.7 6.94 1.4 5.34 2.45C4.2 3.2 3.34 4.3 2.8 5.54C2.26 6.8 2 8.18 2 9.7C2 11.22 2.26 12.6 2.8 13.86C3.34 15.1 4.2 16.2 5.34 16.95C6.38 17.65 7.6 18.15 8.95 18.42C8.86 18.73 8.7 19.12 8.44 19.55C8.04 20.24 7.54 20.9 7 21.46L6.82 21.65C6.73 21.75 6.64 21.86 6.55 21.98C6.32 22.25 6.42 22.65 6.72 22.78C6.88 22.84 7.05 22.85 7.22 22.78C9.56 22 11.4 20.88 12.86 19.62C14 19.53 15.1 19.26 16.1 18.84C18.25 17.9 19.98 16.42 21.1 14.48C21.7 13.4 22 12.24 22 10.98C22 9.15 21.7 7.34 21.2 5.54Z"/></svg>
                          Zalo: {c.phone}
                        </button>
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
                    {c.phone && (
                      <button 
                        onClick={() => {
                          const missingDocs = c.eligibility && !c.eligibility.isValid ? c.eligibility.missing.map(m => `- ${m}`).join('\n') : '';
                          const msg = missingDocs 
                            ? `Chào thầy/cô ${c.fullName},\nHồ sơ xét thăng hạng của thầy/cô trên hệ thống đang thiếu các thông tin/giấy tờ sau:\n${missingDocs}\n\nThầy/cô vui lòng bổ sung sớm nhé!`
                            : `Chào thầy/cô ${c.fullName},\nHồ sơ xét thăng hạng của thầy/cô đã được tiếp nhận.`;
                          navigator.clipboard.writeText(msg).then(() => {
                            showAlert('Thông báo', "Đã copy sẵn tin nhắn báo thiếu hồ sơ!\nBạn chỉ cần ấn Ctrl+V (Dán) vào khung chat Zalo nhé.");
                            window.location.href = `zalo://conversation?phone=${c.phone}`;
                          });
                        }}
                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.2 5.54C20.66 4.3 19.8 3.2 18.66 2.45C17.06 1.4 14.86 0.7 12 0.7C9.14 0.7 6.94 1.4 5.34 2.45C4.2 3.2 3.34 4.3 2.8 5.54C2.26 6.8 2 8.18 2 9.7C2 11.22 2.26 12.6 2.8 13.86C3.34 15.1 4.2 16.2 5.34 16.95C6.38 17.65 7.6 18.15 8.95 18.42C8.86 18.73 8.7 19.12 8.44 19.55C8.04 20.24 7.54 20.9 7 21.46L6.82 21.65C6.73 21.75 6.64 21.86 6.55 21.98C6.32 22.25 6.42 22.65 6.72 22.78C6.88 22.84 7.05 22.85 7.22 22.78C9.56 22 11.4 20.88 12.86 19.62C14 19.53 15.1 19.26 16.1 18.84C18.25 17.9 19.98 16.42 21.1 14.48C21.7 13.4 22 12.24 22 10.98C22 9.15 21.7 7.34 21.2 5.54Z"/></svg>
                        Zalo: {c.phone}
                      </button>
                    )}
                </div>
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
              
              {/* Vùng thao tác của Admin */}
              <div className="flex flex-col gap-2 min-w-[200px]">
                <button 
                  onClick={() => setViewCand(c)}
                  className="flex items-center justify-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 shadow-sm mb-1"
                >
                  <Eye size={16} /> Xem Chi Tiết Hồ Sơ
                </button>
                
                {c.status === 'head_approved' && (
                  <button onClick={() => updateStatus(c.id, 'admin_reviewing')} className="flex items-center justify-center gap-1 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 shadow-sm">
                    <Search size={16} /> Bắt đầu rà soát
                  </button>
                )}
                
                {c.status === 'admin_reviewing' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateStatus(c.id, 'admin_approved')} className="flex-1 flex items-center justify-center gap-1 text-sm bg-emerald-600 text-white px-2 py-2 rounded-lg hover:bg-emerald-700 shadow-sm">
                      <ThumbsUp size={16} /> Đủ ĐK
                    </button>
                    <button onClick={() => updateStatus(c.id, 'admin_rejected')} className="flex-1 flex items-center justify-center gap-1 text-sm bg-white border border-rose-300 text-rose-600 px-2 py-2 rounded-lg hover:bg-rose-50 shadow-sm">
                      <ThumbsDown size={16} /> Loại
                    </button>
                  </div>
                )}
                
                {['admin_approved', 'admin_rejected', 'ranked', 'finalized'].includes(c.status) && (
                  <button onClick={() => updateStatus(c.id, 'admin_reviewing')} className="text-xs text-slate-500 hover:text-blue-600 underline text-right">
                    Rà soát lại
                  </button>
                )}
                
                <button 
                  onClick={() => handleDeleteCandidate(c.id, c.fullName)}
                  className="mt-2 text-xs text-rose-500 hover:text-rose-700 underline text-right flex items-center justify-end gap-1"
                >
                  <Trash2 size={12} /> Xóa hồ sơ
                </button>
              </div>
              </div>
            </div>
          )})}
        </div>
      </div>

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




