import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { calculateTotalScore, rankCandidates } from '../utils/ranking';
import { StatusBadge } from '../components/StatusBadge';
import { logAction } from '../utils/logger';
import { CandidateTimeline } from '../components/CandidateTimeline';
import { DigitalTwinModal } from '../components/DigitalTwinModal';
import { CompareModal } from '../components/CompareModal';
import { SettingsModal } from '../components/SettingsModal';
import { StatisticsModal } from '../components/StatisticsModal';
import { AIReportModal } from '../components/AIReportModal';
import { ExplainRankingModal } from '../components/ExplainRankingModal';
import { ZaloReminderModal } from '../components/ZaloReminderModal';
import { useSettings } from '../contexts/SettingsContext';
import { Users, FileText, CheckSquare, XCircle, Search, ThumbsUp, ThumbsDown, History, Eye, EyeOff, Trash2, Scale, Settings, FileSpreadsheet, BarChart2, Sparkles, AlertTriangle, CheckCircle, Award, Table as TableIcon, Target, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { showAlert, showConfirm, showPrompt, showLoading, closeLoading } from '../utils/alert';
import { getDeviceIp } from '../utils/security';
import { exportStatisticsWord } from '../utils/exportStatistics';
import { exportGoldenRollWord } from '../utils/exportGoldenRoll';
import { exportStatisticsExcel } from '../utils/exportExcel';

export const Dashboard = ({ candidates, onRefresh }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [timelineCandId, setTimelineCandId] = useState(null);
  const [viewCand, setViewCand] = useState(null);
  const [sortByScore, setSortByScore] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [showZaloModal, setShowZaloModal] = useState(false);
  const [explainCandidate, setExplainCandidate] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  
  // Simulation Mode States
  const [quota, setQuota] = useState(8);
  const [excludedIds, setExcludedIds] = useState([]);

  const { settings } = useSettings();

  useEffect(() => {
    const fetchBatch = async () => {
      const { data } = await supabase.from('batches').select('*').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setActiveBatch(data[0]);
    };
    fetchBatch();
  }, []);

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

  // Thống kê đếm
  const totalCount = evaluated.length;
  const waitingAdminCount = evaluated.filter(c => c.status === 'head_approved').length;
  const reviewingCount = evaluated.filter(c => c.status === 'admin_reviewing').length;
  const adminFinishedCount = evaluated.filter(c => ['admin_approved', 'admin_rejected', 'ranked', 'finalized'].includes(c.status)).length;

  let displayList = evaluated.filter(c => {
    if (selectedUnit !== 'all' && c.unit !== selectedUnit) return false;
    if (selectedFilter === 'waiting') return c.status === 'head_approved';
    if (selectedFilter === 'reviewing') return c.status === 'admin_reviewing';
    if (selectedFilter === 'finished') return ['admin_approved', 'returned', 'ranked', 'finalized'].includes(c.status);
    return true; 
  });

  const rankedDisplayList = useMemo(() => {
    // 1. Chia ra list active và excluded
    const active = displayList.filter(c => !excludedIds.includes(c.id));
    const excluded = displayList.filter(c => excludedIds.includes(c.id));

    // 2. Sắp xếp list active
    if (sortByScore) {
      active.sort((a, b) => b.score - a.score);
    } else {
      active.sort((a, b) => rankCandidates(a, b));
    }

    // 3. Đánh số rank cho list active
    const activeWithRank = active.map((c, idx) => ({ ...c, simRank: idx + 1 }));
    const excludedWithRank = excluded.map(c => ({ ...c, simRank: -1 }));

    return [...activeWithRank, ...excludedWithRank];
  }, [displayList, sortByScore, excludedIds]);

  const handleBulkReject = async () => {
    const reason = await showPrompt('Từ chối hàng loạt', 'Nhập lý do từ chối chung cho các hồ sơ đã chọn...');
    if (!reason || reason.trim() === '') {
      if (reason !== null) showAlert('Lỗi', 'Vui lòng nhập lý do từ chối.', 'error');
      return;
    }
    
    showLoading('Đang xử lý từ chối hàng loạt...');
    
    // Bulk update status
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ status: 'returned', feedback: reason })
      .in('id', selectedForCompare);
      
    if (updateError) {
      closeLoading();
      showAlert('Lỗi', 'Có lỗi xảy ra khi từ chối hồ sơ.', 'error');
      return;
    }
    
    // Bulk insert logs
    const logEntries = selectedForCompare.map(candId => ({
      candidate_id: candId,
      actor_role: 'Admin',
      actor_name: 'Quản trị viên',
      action: 'Từ chối (Hàng loạt)',
      notes: `Lý do: ${reason}`
    }));
    
    await supabase.from('candidate_logs').insert(logEntries);
    
    closeLoading();
    showAlert('Thành công', `Đã từ chối ${selectedForCompare.length} hồ sơ.`, 'success');
    setSelectedForCompare([]);
    if (onRefresh) onRefresh();
  };

  const handleToggleCompare = (candidateId) => {
    setSelectedForCompare(prev => {
      if (prev.includes(candidateId)) return prev.filter(id => id !== candidateId);
      return [...prev, candidateId];
    });
  };

  const getCompareCandidates = () => {
    return candidates.filter(c => selectedForCompare.includes(c.id));
  };

  // Các biểu đồ thống kê
  const pieData = [
    { name: 'Đủ điều kiện', value: evaluated.filter(c => ['admin_approved', 'ranked', 'finalized'].includes(c.status)).length, color: '#10b981' },
    { name: 'Đang rà soát', value: evaluated.filter(c => ['admin_reviewing', 'head_approved'].includes(c.status)).length, color: '#f59e0b' },
    { name: 'Trả lại/Loại', value: evaluated.filter(c => ['returned', 'admin_rejected', 'head_rejected'].includes(c.status)).length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const genderData = useMemo(() => {
    let male = 0, female = 0;
    evaluated.forEach(c => {
      if (c.gender === 'Nam') male++;
      else if (c.gender === 'Nữ') female++;
    });
    return [
      { name: 'Nam', value: male, color: '#3b82f6' },
      { name: 'Nữ', value: female, color: '#ec4899' }
    ].filter(d => d.value > 0);
  }, [evaluated]);

  const degreeData = useMemo(() => {
    let ts = 0, ths = 0, dh = 0, khac = 0;
    evaluated.forEach(c => {
      if (!c.degrees || c.degrees.length === 0) khac++;
      else if (c.degrees.some(d => d.level === 'Tiến sĩ')) ts++;
      else if (c.degrees.some(d => d.level === 'Thạc sĩ')) ths++;
      else if (c.degrees.some(d => d.level === 'Đại học')) dh++;
      else khac++;
    });
    return [
      { name: 'Tiến sĩ', value: ts, color: '#8b5cf6' },
      { name: 'Thạc sĩ', value: ths, color: '#6366f1' },
      { name: 'Đại học', value: dh, color: '#0ea5e9' },
      { name: 'Chưa rõ', value: khac, color: '#cbd5e1' }
    ].filter(d => d.value > 0);
  }, [evaluated]);

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

  const missingData = useMemo(() => {
    const counts = {};
    evaluated.forEach(c => {
      if (!c.eligibility.isValid) {
        c.eligibility.missing.forEach(m => {
          counts[m] = (counts[m] || 0) + 1;
        });
      }
    });
    return Object.keys(counts).map(k => ({
      name: k,
      total: counts[k]
    })).sort((a, b) => b.total - a.total).slice(0, 5); // top 5 lỗi
  }, [evaluated]);

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-72 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2">Tỉ lệ phê duyệt</h3>
          <div className="flex-1 min-h-0">
            {pieData.length === 0 ? <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div> :
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            }
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-72 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2">Cơ cấu Giới tính</h3>
          <div className="flex-1 min-h-0">
            {genderData.length === 0 ? <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div> :
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            }
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-72 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2">Trình độ chuyên môn</h3>
          <div className="flex-1 min-h-0">
            {degreeData.length === 0 ? <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div> :
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={degreeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {degreeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            }
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-80 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2">Số lượng nộp theo Tổ</h3>
          <div className="flex-1 min-h-0">
            {barData.length === 0 ? <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div> :
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 50, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            }
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-80 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2">Thiếu sót phổ biến (Top 5)</h3>
          <div className="flex-1 min-h-0">
            {missingData.length === 0 ? <div className="h-full flex items-center justify-center text-emerald-500">Tuyệt vời! Không có thiếu sót nào.</div> :
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missingData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={150} interval={0} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="total" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            }
          </div>
        </div>
      </div>
      
      {/* Toolbar & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 mb-4">
        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-500" />
          Danh sách hồ sơ ({rankedDisplayList.length})
        </h3>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select 
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px] shadow-sm flex-1 md:flex-none"
          >
            <option value="all">Tất cả Tổ</option>
            {barData.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
          </select>
          <button onClick={() => setShowZaloModal(true)} className="flex items-center justify-center gap-2 text-sm bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 px-3 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none">
            <Bell size={16} /> Đôn đốc
          </button>
          {selectedForCompare.length >= 2 && (
            <button onClick={() => setShowCompare(true)} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 shadow-sm">
              <Scale size={16} /> Bàn cân đối chiếu ({selectedForCompare.length})
            </button>
          )}
          {selectedForCompare.length >= 1 && (
            <button
              onClick={handleBulkReject}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1 shadow-sm"
            >
              <XCircle size={16} /> Trả lại hàng loạt ({selectedForCompare.length})
            </button>
          )}
          <button onClick={() => setShowStatistics(true)} className="flex items-center justify-center gap-2 text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none">
            <BarChart2 size={16} /> Chi tiết
          </button>
          <button onClick={() => setShowAIReport(true)} className="flex items-center justify-center gap-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none">
            <Sparkles size={16} /> Báo cáo AI
          </button>
          <button onClick={() => exportStatisticsExcel(rankedDisplayList, selectedUnit === 'all' ? "Toàn trường" : selectedUnit)} className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none" title="Xuất dữ liệu ra file Excel theo mẫu Sở">
            <FileSpreadsheet size={16} /> Xuất báo cáo Sở (Excel)
          </button>
          <button onClick={() => exportStatisticsWord(rankedDisplayList, selectedUnit === 'all' ? "Toàn trường" : selectedUnit)} className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none">
            <FileSpreadsheet size={16} /> Xuất Word
          </button>
          <button onClick={() => exportGoldenRollWord(rankedDisplayList, selectedUnit === 'all' ? "Toàn trường" : selectedUnit)} className="flex items-center justify-center gap-2 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none" title="Xuất Bảng vàng danh dự">
            <Award size={16} /> Bảng vàng
          </button>
          <button onClick={() => setShowSettings(true)} className="flex items-center justify-center gap-2 text-sm bg-slate-800 text-white hover:bg-slate-700 px-3 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none">
            <Settings size={16} /> Cấu hình
          </button>
        </div>
      </div>

      {/* Simulation / What-if Analysis Area */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-blue-200 shadow-sm flex flex-col md:flex-row gap-6 items-center bg-gradient-to-r from-blue-50 to-white mb-6">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><Target size={18} className="text-blue-600"/> Mô phỏng Chỉ tiêu (What-if Analysis)</h3>
          <p className="text-xs text-slate-500">Điều chỉnh thanh trượt để xem danh sách trúng tuyển thay đổi. Nhấn nút Tạm loại để thử xem thứ hạng những người phía sau nhảy như thế nào.</p>
        </div>
        <div className="w-full md:w-1/3 flex items-center gap-4">
          <input 
            type="range" 
            min="1" 
            max={totalCount || 10} 
            value={quota} 
            onChange={(e) => setQuota(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-lg min-w-[3rem] text-center shadow-inner">
            {quota}
          </div>
        </div>
      </div>

      {/* Candidate Flex/Grid Cards */}
      <div className="flex justify-between items-center mb-3 px-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors w-max">
          <input 
            type="checkbox" 
            checked={rankedDisplayList.length > 0 && selectedForCompare.length === rankedDisplayList.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedForCompare(rankedDisplayList.map(c => c.id));
              } else {
                setSelectedForCompare([]);
              }
            }}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          Chọn tất cả ({rankedDisplayList.length})
        </label>
      </div>
      
      <motion.div layout className="flex flex-col gap-4">
        <AnimatePresence>
        {rankedDisplayList.length === 0 ? (
          <p className="text-center p-8 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">Không có dữ liệu hồ sơ phù hợp.</p>
        ) : rankedDisplayList.map(c => {
          const isSafe = c.simRank > 0 && c.simRank <= quota;
          const isExcluded = c.simRank === -1;

          return (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            key={c.id} 
            className={`bg-white p-4 md:p-5 rounded-xl shadow-sm border transition-all flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center relative overflow-hidden ${isExcluded ? 'opacity-50 border-slate-200' : (isSafe ? 'border-emerald-400 shadow-emerald-500/10 shadow-lg' : 'border-slate-200 hover:border-blue-300')}`}>
            
            {isSafe && !isExcluded && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            )}
            {isExcluded && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400" />
            )}

            {/* Column 1: Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-start gap-3">
                {c.simRank > 0 ? (
                  <button onClick={() => setExplainCandidate(c)} className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm hover:scale-110 transition-transform ${isSafe ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400 ring-offset-1' : 'bg-slate-100 text-slate-600'}`} title="Tại sao xếp hạng này?">
                    #{c.simRank}
                  </button>
                ) : (
                  <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm bg-slate-200 text-slate-400">
                    -
                  </div>
                )}
                <input 
                  type="checkbox" 
                  className="mt-2.5 w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer" 
                  checked={selectedForCompare.includes(c.id)} 
                  onChange={() => handleToggleCompare(c.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800 text-lg uppercase leading-tight truncate">{c.fullName}</h4>
                    <button 
                      onClick={() => setExcludedIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                      className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors ${isExcluded ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600'}`}
                      title={isExcluded ? "Khôi phục hồ sơ này" : "Tạm loại hồ sơ này để mô phỏng"}
                    >
                      {isExcluded ? <Eye size={12}/> : <EyeOff size={12}/>}
                      {isExcluded ? 'Đang loại trừ' : 'Tạm loại'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                    <span>CCCD: {c.cccd}</span>
                    <span className="text-slate-300">|</span>
                    <span>Nộp: {new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-md">{c.unit}</span>
                    {settings?.use_scoring !== false && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-md shadow-sm">Điểm: {c.score}</span>
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
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-semibold rounded-md transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.2 5.54C20.66 4.3 19.8 3.2 18.66 2.45C17.06 1.4 14.86 0.7 12 0.7C9.14 0.7 6.94 1.4 5.34 2.45C4.2 3.2 3.34 4.3 2.8 5.54C2.26 6.8 2 8.18 2 9.7C2 11.22 2.26 12.6 2.8 13.86C3.34 15.1 4.2 16.2 5.34 16.95C6.38 17.65 7.6 18.15 8.95 18.42C8.86 18.73 8.7 19.12 8.44 19.55C8.04 20.24 7.54 20.9 7 21.46L6.82 21.65C6.73 21.75 6.64 21.86 6.55 21.98C6.32 22.25 6.42 22.65 6.72 22.78C6.88 22.84 7.05 22.85 7.22 22.78C9.56 22 11.4 20.88 12.86 19.62C14 19.53 15.1 19.26 16.1 18.84C18.25 17.9 19.98 16.42 21.1 14.48C21.7 13.4 22 12.24 22 10.98C22 9.15 21.7 7.34 21.2 5.54Z"/></svg>
                        Zalo: {c.phone}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Missing Warning */}
            <div className="w-full md:w-64 flex flex-col shrink-0">
              {c.eligibility.isValid ? (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                  <CheckCircle size={16} />
                  <span className="text-xs font-semibold">Đủ điều kiện ban đầu</span>
                </div>
              ) : (
                <div className="px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg">
                  <div className="flex items-center gap-1.5 text-rose-600 mb-1.5">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-bold">Thiếu sót:</span>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-rose-600 space-y-0.5 font-medium">
                    {c.eligibility.missing.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Column 3: Status & Action Buttons */}
            <div className="w-full md:w-48 flex flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
              <div className="w-full flex justify-between md:justify-end items-center gap-3">
                <StatusBadge status={c.status} />
                <button onClick={() => setTimelineCandId(c.id)} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium bg-slate-50 px-2 py-1 rounded">
                  <History size={14} /> Lịch sử
                </button>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => setViewCand(c)} className="col-span-2 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 rounded-lg transition-colors shadow-sm">
                  <Eye size={16} /> Xem Chi Tiết
                </button>

                {c.status === 'head_approved' && (
                  <button onClick={() => updateStatus(c.id, 'admin_reviewing')} className="col-span-2 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                    <Search size={16} /> Bắt đầu rà soát
                  </button>
                )}

                {c.status === 'admin_reviewing' && (
                  <>
                    <button onClick={() => updateStatus(c.id, 'admin_approved')} className="flex items-center justify-center gap-1 px-2 py-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
                      <ThumbsUp size={14} /> Duyệt
                    </button>
                    <button onClick={() => updateStatus(c.id, 'admin_rejected')} className="flex items-center justify-center gap-1 px-2 py-1.5 text-sm font-medium bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm transition-colors">
                      <ThumbsDown size={14} /> Loại
                    </button>
                  </>
                )}
              </div>

              <div className="w-full flex justify-between items-center mt-1">
                {['admin_approved', 'admin_rejected', 'ranked', 'finalized'].includes(c.status) ? (
                  <button onClick={() => updateStatus(c.id, 'admin_reviewing')} className="text-xs text-slate-400 hover:text-blue-600 underline">
                    Rà soát lại
                  </button>
                ) : <span />}
                
                <button onClick={() => handleDeleteCandidate(c.id, c.fullName)} className="text-xs text-rose-400 hover:text-rose-600 underline flex items-center gap-1">
                  <Trash2 size={12} /> Xóa
                </button>
              </div>
            </div>

          </motion.div>
        )})}
        </AnimatePresence>
      </motion.div>

      {timelineCandId && (
        <CandidateTimeline candidateId={timelineCandId} onClose={() => setTimelineCandId(null)} />
      )}

      {viewCand && (
        <DigitalTwinModal 
          candidate={viewCand} 
          onClose={() => setViewCand(null)} 
          onReject={(candidate, msg) => {
            handleReject(candidate.id, msg);
            setViewCand(null);
          }}
        />
      )}

      {explainCandidate && (
        <ExplainRankingModal 
          candidate={explainCandidate} 
          rankedList={rankedDisplayList.filter(c => c.simRank > 0)}
          onClose={() => setExplainCandidate(null)}
        />
      )}

      {showCompare && (
        <CompareModal 
          candidates={getCompareCandidates()} 
          onClose={() => setShowCompare(false)} 
        />
      )}
      {showSettings && <SettingsModal isOpen={true} onClose={() => setShowSettings(false)} />}
      {showStatistics && <StatisticsModal candidates={rankedDisplayList} unitName={selectedUnit === 'all' ? "Toàn trường" : selectedUnit} onClose={() => setShowStatistics(false)} />}
      {showAIReport && <AIReportModal candidates={rankedDisplayList} unitName={selectedUnit === 'all' ? "Toàn trường" : selectedUnit} onClose={() => setShowAIReport(false)} />}
      
      <ZaloReminderModal 
        isOpen={showZaloModal} 
        onClose={() => setShowZaloModal(false)} 
        candidates={candidates} 
        scope="school" 
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
      <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);
