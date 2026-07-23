import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { calculateTotalScore } from '../utils/ranking';
import { logAction } from '../utils/logger';
import { StatusBadge } from '../components/StatusBadge';
import { CandidateTimeline } from '../components/CandidateTimeline';
import { DigitalTwinModal } from '../components/DigitalTwinModal';
import { CompareModal } from '../components/CompareModal';
import { StatisticsModal } from '../components/StatisticsModal';
import { AIReportModal } from '../components/AIReportModal';
import { ZaloReminderModal } from '../components/ZaloReminderModal';
import { useSettings } from '../contexts/SettingsContext';
import { CheckCircle, XCircle, Search, UserCheck, AlertTriangle, Send, History, Eye, Scale, Users, FileText, CheckSquare, FileSpreadsheet, Clock, HelpCircle, BarChart2, Sparkles, Bell } from 'lucide-react';
import { showAlert, showConfirm } from '../utils/alert';
import { exportStatisticsWord } from '../utils/exportStatistics';
import { exportStatisticsExcel } from '../utils/exportExcel';
import { ActionHistory } from '../components/ActionHistory';
import { UserGuideModal } from '../components/UserGuideModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { KeyRound } from 'lucide-react';
import { DepartmentInsights, getBadges } from '../components/DepartmentInsights';

export const HeadDashboard = ({ department, onLogout }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [sortByScore, setSortByScore] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [showZaloModal, setShowZaloModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const { settings } = useSettings();
  
  // Tráº¡ng thÃ¡i modal tá»« chá»‘i
  const [rejectingCand, setRejectingCand] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  // Tráº¡ng thÃ¡i modal lá»‹ch sá»­
  const [timelineCandId, setTimelineCandId] = useState(null);
  
  // Tráº¡ng thÃ¡i modal xem chi tiáº¿t
  const [viewCand, setViewCand] = useState(null);

  const [activeBatch, setActiveBatch] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: batches } = await supabase.from('batches').select('*').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
    
    if (batches && batches.length > 0) {
      setActiveBatchId(batches[0].id);
      setActiveBatch(batches[0]);
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
    const action = status === 'head_approved' ? 'XÃC NHáº¬N Há»¢P Lá»†' : 'YÃŠU Cáº¦U Bá»” SUNG';
    if (status === 'head_approved' && !confirm(`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n ${action} há»“ sÆ¡ nÃ y?`)) return;

    const payload = { status };
    if (feedbackMsg) payload.feedback_message = feedbackMsg;

    const { error } = await supabase.from('candidates').update(payload).eq('id', c.id);
    if (!error) {
      await logAction(c.id, 'head', `Tá»• trÆ°á»Ÿng ${department}`, action, feedbackMsg);
      loadData();
    } else {
      showAlert('ThÃ´ng bÃ¡o', 'Lá»—i cáº­p nháº­t tráº¡ng thÃ¡i');
    }
  };

  const handleRejectSubmit = async (withZalo) => {
    if (!feedback.trim()) {
      showAlert('ThÃ´ng bÃ¡o', "Vui lÃ²ng nháº­p lÃ½ do!");
      return;
    }
    
    await updateStatus(rejectingCand, 'head_rejected', feedback);
    
    if (withZalo && rejectingCand.phone) {
      const msg = `ChÃ o tháº§y/cÃ´, há»“ sÆ¡ thÄƒng háº¡ng cá»§a tháº§y/cÃ´ cáº§n bá»• sung: ${feedback}. Tháº§y/cÃ´ vui lÃ²ng lÃªn há»‡ thá»‘ng cáº­p nháº­t nhÃ©!`;
      window.open(`https://zalo.me/${rejectingCand.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (withZalo) {
      showAlert('ThÃ´ng bÃ¡o', "GiÃ¡o viÃªn nÃ y chÆ°a cáº­p nháº­t Sá»‘ Ä‘iá»‡n thoáº¡i Zalo.");
    }
    
    setRejectingCand(null);
    setFeedback('');
  };

  // Tá»• trÆ°á»Ÿng chá»‰ tháº¥y há»“ sÆ¡ náº¿u tráº¡ng thÃ¡i KHÃC 'draft'
  let displayCandidates = candidates.filter(c => c.status && c.status !== 'draft').map(c => ({
    ...c,
    score: calculateTotalScore(c, settings)
  }));
  
  // Báº£ng thá»‘ng kÃª
  const totalCount = displayCandidates.length;
  const waitingCount = displayCandidates.filter(c => c.status === 'submitted').length;
  const rejectedCount = displayCandidates.filter(c => c.status === 'head_rejected').length;
  const forwardCount = displayCandidates.filter(c => !['submitted', 'head_rejected'].includes(c.status)).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((forwardCount / totalCount) * 100);

  if (selectedFilter === 'waiting') displayCandidates = displayCandidates.filter(c => c.status === 'submitted');
  if (selectedFilter === 'rejected') displayCandidates = displayCandidates.filter(c => c.status === 'head_rejected');
  if (selectedFilter === 'forwarded') displayCandidates = displayCandidates.filter(c => !['submitted', 'head_rejected'].includes(c.status));

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayCandidates = displayCandidates.filter(c => c.fullName.toLowerCase().includes(q) || c.cccd.includes(q));
  }

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

  const handleBulkApprove = async () => {
    const candsToApprove = candidates.filter(c => selectedForCompare.includes(c.id) && c.status === 'submitted');
    if (candsToApprove.length === 0) {
      showAlert('ThÃ´ng bÃ¡o', "KhÃ´ng cÃ³ há»“ sÆ¡ nÃ o há»£p lá»‡ Ä‘á»ƒ duyá»‡t trong cÃ¡c há»“ sÆ¡ Ä‘Ã£ chá»n (chá»‰ duyá»‡t há»“ sÆ¡ Ä‘ang 'Chá» xá»­ lÃ½').");
      return;
    }
    if (!confirm(`Báº¡n cÃ³ cháº¯c muá»‘n duyá»‡t hÃ ng loáº¡t ${candsToApprove.length} há»“ sÆ¡?`)) return;
    
    for (const c of candsToApprove) {
      const { error } = await supabase.from('candidates').update({ status: 'head_approved' }).eq('id', c.id);
      if (!error) await logAction(c.id, 'head', `Tá»• trÆ°á»Ÿng ${department}`, 'XÃC NHáº¬N Há»¢P Lá»† (Duyá»‡t gá»™p)');
    }
    setSelectedForCompare([]);
    loadData();
  };

    return (
    <div className="min-h-screen bg-slate-100 pb-10">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50 shadow-sm">
          <div>
            <p className="text-xs text-slate-500 mb-0.5 font-medium">Há»‡ thá»‘ng XÃ©t thÄƒng háº¡ng viÃªn chá»©c | TrÆ°á»ng THPT Cao BÃ¡ QuÃ¡t - PhÆ°á»ng TÃ¢n An - Tá»‰nh Äáº¯k Láº¯k</p>
            <h2 className="text-xl font-bold text-slate-800">
              Duyá»‡t há»“ sÆ¡ Tá»•: <span className="text-blue-600">{department}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 shadow-sm font-medium border border-blue-200"
              title="HÆ°á»›ng dáº«n sá»­ dá»¥ng"
            >
              <HelpCircle size={16} />
              HÆ°á»›ng dáº«n
            </button>
            <button 
              onClick={() => setShowZaloModal(true)}
              className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 shadow-sm font-medium border border-amber-200 transition-colors"
            >
              <Bell size={16} />
              ÄÃ´n Ä‘á»‘c
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors ${showHistory ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
            >
              <Clock size={16} /> Nháº­t kÃ½
            </button>
            <button 
              onClick={() => exportStatisticsWord(displayCandidates, department)} 
              className="flex items-center gap-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 font-medium transition-colors"
            >
              <FileText size={16} /> Xuáº¥t thá»‘ng kÃª (Word)
            </button>
            <button 
              onClick={() => exportStatisticsExcel(displayCandidates)} 
              className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium transition-colors"
            >
              <FileSpreadsheet size={16} /> Xuáº¥t bÃ¡o cÃ¡o Sá»Ÿ (Excel)
            </button>
            <button 
              onClick={() => setShowStatistics(true)} 
              className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 font-medium transition-colors"
            >
              <BarChart2 size={16} /> Chi tiáº¿t thÃ nh tÃ­ch
            </button>
            <button 
              onClick={() => setShowAIReport(true)} 
              className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 font-medium transition-colors"
            >
              <Sparkles size={16} /> PhÃ¢n tÃ­ch AI
            </button>
            <button 
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-2 text-sm bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 shadow-sm font-medium border border-slate-200 transition-colors"
            >
              <KeyRound size={16} /> Đổi mật khẩu
            </button>
            <button onClick={onLogout} className="text-sm text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-medium">
              ThoÃ¡t
            </button>
          </div>
        </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {showHistory ? (
          <ActionHistory />
        ) : !activeBatchId ? (
          <div className="text-center p-8 text-slate-500 bg-white rounded-lg border">ChÆ°a cÃ³ Ä‘á»£t xÃ©t nÃ o Ä‘ang má»Ÿ.</div>
        ) : displayCandidates.length === 0 && selectedFilter === 'all' && !searchQuery ? (
          <div className="text-center p-12 text-slate-500 bg-white rounded-lg border flex flex-col items-center">
            <Search size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium">ChÆ°a cÃ³ giÃ¡o viÃªn nÃ o ná»™p há»“ sÆ¡.</p>
            <p className="text-sm mt-1">Há»“ sÆ¡ Ä‘Ã£ ná»™p cá»§a giÃ¡o viÃªn thuá»™c Tá»• {department} sáº½ hiá»‡n á»Ÿ Ä‘Ã¢y.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <DepartmentInsights candidates={candidates} department={department} quota={activeBatch?.quota || 0} />
            {/* Thá»‘ng kÃª */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard 
                title="Tá»•ng há»“ sÆ¡" 
                value={totalCount} 
                icon={<Users size={20} className="text-blue-600" />} 
                bgColor="bg-blue-100" 
                active={selectedFilter === 'all'}
                onClick={() => setSelectedFilter('all')}
              />
              <StatCard 
                title="Chá» duyá»‡t" 
                value={waitingCount} 
                icon={<FileText size={20} className="text-amber-600" />} 
                bgColor="bg-amber-100" 
                active={selectedFilter === 'waiting'}
                onClick={() => setSelectedFilter('waiting')}
              />
              <StatCard 
                title="YÃªu cáº§u bá»• sung" 
                value={rejectedCount} 
                icon={<AlertTriangle size={20} className="text-rose-600" />} 
                bgColor="bg-rose-100" 
                active={selectedFilter === 'rejected'}
                onClick={() => setSelectedFilter('rejected')}
              />
              <StatCard 
                title="ÄÃ£ duyá»‡t & Chuyá»ƒn" 
                value={forwardCount} 
                icon={<CheckSquare size={20} className="text-emerald-600" />} 
                bgColor="bg-emerald-100" 
                active={selectedFilter === 'forwarded'}
                onClick={() => setSelectedFilter('forwarded')}
              />
            </div>

            {/* Tiáº¿n Ä‘á»™ */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Tiáº¿n Ä‘á»™ duyá»‡t há»“ sÆ¡ cá»§a Tá»•</span>
                  <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="TÃ¬m tÃªn hoáº·c CCCD..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {settings?.use_scoring !== false && (
                    <button 
                      onClick={() => setSortByScore(!sortByScore)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${sortByScore ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                    >
                      {sortByScore ? 'Äang xáº¿p háº¡ng theo Äiá»ƒm' : 'Sáº¯p xáº¿p theo Äiá»ƒm'}
                    </button>
                  )}
                  {selectedForCompare.length >= 1 && (
                    <button
                      onClick={handleBulkApprove}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle size={16} /> Duyá»‡t ({selectedForCompare.length})
                    </button>
                  )}
                  {selectedForCompare.length >= 2 && (
                    <button
                      onClick={() => setShowCompare(true)}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 shadow-sm"
                    >
                      <Scale size={16} /> BÃ n cÃ¢n ({selectedForCompare.length})
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                      <th className="p-4 w-12 text-center">So sÃ¡nh</th>
                      <th className="p-4">Há» tÃªn / CCCD</th>
                      <th className="p-4">Tá»± Ä‘á»™ng quÃ©t ÄK</th>
                      <th className="p-4">Tráº¡ng thÃ¡i</th>
                      <th className="p-4 text-right">Thao tÃ¡c</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayCandidates.map(c => {
                      const eligibility = checkEligibility(c);
                      const canAct = ['submitted_to_head', 'resubmitted', 'head_rejected'].includes(c.status);
                      const badges = getBadges(c);
                      
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
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {settings?.use_scoring !== false && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Äiá»ƒm: {c.score}</span>
                              )}
                              {badges.map(b => {
                                const Icon = b.icon;
                                return (
                                  <span key={b.id} className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-white/50 ${b.color}`} title={b.name}>
                                    <Icon size={10} /> {b.name}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <StatusBadge status={eligibility.isValid ? 'eligible' : 'ineligible'} />
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-col gap-2 items-start">
                              <StatusBadge status={c.status} />
                              {c.phone && (
                                <a 
                                  href={`https://zalo.me/${c.phone}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                                >
                                  <div className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">Z</div>
                                  Zalo: {c.phone}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-1 justify-end items-center">
                              <button onClick={() => setViewCand(c)} title="Xem chi tiáº¿t" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                                <Eye size={16} />
                              </button>
                              
                              {canAct ? (
                                <>
                                  <button onClick={() => updateStatus(c, 'head_approved')} title="XÃ¡c nháº­n Ä‘á»§ Ä‘iá»u kiá»‡n" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200">
                                    <CheckCircle size={16} />
                                  </button>
                                  <button onClick={() => setRejectingCand(c)} title="YÃªu cáº§u bá»• sung" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                                    <AlertTriangle size={16} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 italic px-2">ÄÃ£ xá»­ lÃ½</span>
                              )}
                              <button onClick={() => setTimelineCandId(c.id)} title="Lá»‹ch sá»­ há»“ sÆ¡" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <History size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {rejectingCand && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-rose-50 text-rose-700 font-bold flex justify-between items-center">
              <span>YÃªu cáº§u bá»• sung há»“ sÆ¡</span>
              <button onClick={() => setRejectingCand(null)} className="text-rose-500 hover:text-rose-700"><XCircle size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600">GiÃ¡o viÃªn: <b>{rejectingCand.fullName}</b></p>
              <textarea 
                className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                rows="4"
                placeholder="Nháº­p lÃ½ do cáº§n bá»• sung (VD: Chá»¥p thiáº¿u áº£nh quyáº¿t Ä‘á»‹nh lÆ°Æ¡ng)..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => handleRejectSubmit(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
                  LÆ°u (KhÃ´ng bÃ¡o Zalo)
                </button>
                <button onClick={() => handleRejectSubmit(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm">
                  <Send size={16} /> LÆ°u & BÃ¡o Zalo
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
        <DigitalTwinModal 
          candidate={viewCand} 
          onClose={() => setViewCand(null)} 
          onReject={(candidate, msg) => {
            updateStatus(candidate, 'head_rejected', msg);
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
      
      {showStatistics && <StatisticsModal candidates={displayCandidates} unitName={department || "Tá»•"} onClose={() => setShowStatistics(false)} />}
      
      {showAIReport && <AIReportModal candidates={displayCandidates} unitName={department || "Tá»•"} onClose={() => setShowAIReport(false)} />}

      {showGuide && (
        <UserGuideModal role="head" onClose={() => setShowGuide(false)} />
      )}
      
      {showChangePassword && (
        <ChangePasswordModal 
          isOpen={showChangePassword} 
          onClose={() => setShowChangePassword(false)} 
          role="head" 
          identifier={department} 
        />
      )}
      
      <ZaloReminderModal 
        isOpen={showZaloModal} 
        onClose={() => setShowZaloModal(false)} 
        candidates={candidates} 
        scope="head" 
        departmentName={department}
        activeBatch={activeBatch}
      />
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
      <p className="text-sm font-medium text-slate-500 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);




