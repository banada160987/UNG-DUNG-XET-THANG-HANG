import React, { useState, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { rankCandidates, evaluateAchievements } from '../utils/ranking';
import { ACHIEVEMENT_LEVELS } from '../data/config';
import { StatusBadge } from '../components/StatusBadge';
import { Download, Calculator, CheckCircle, FileText, Settings2, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { showAlert, showConfirm } from '../utils/alert';
import { useSettings } from '../contexts/SettingsContext';
import { exportProposalWord } from '../utils/exportProposal';

export const CandidateList = ({ candidates, onRefresh }) => {
  const [rankedList, setRankedList] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const { settings, updateSettings } = useSettings();
  const [localQuotas, setLocalQuotas] = useState({});
  const [showQuotaConfig, setShowQuotaConfig] = useState(false);

  React.useEffect(() => {
    if (settings && settings.quotas) {
      setLocalQuotas(settings.quotas);
    }
  }, [settings]);

  const getRankingReason = (c) => {
    try {
      if (!c.eligibility?.isValid) {
        return <div className="text-red-500 text-xs">Chưa có thông tin điều kiện</div>;
      }
      const ev = evaluateAchievements(c.achievements);
      let achName = "Không có thành tích ưu tiên";
      if (ev.highestScore !== 999) {
        const achDef = ACHIEVEMENT_LEVELS.find(a => a.score === ev.highestScore);
        achName = achDef ? achDef.name : achName;
      }
      
      const bDate = c.dob ? new Date(c.dob).getFullYear() : '?';
      let recDate = '?';
      if (c.decisionRecruitment?.date) recDate = new Date(c.decisionRecruitment.date).getFullYear();
      else if (c.decisionProbation?.date) recDate = new Date(c.decisionProbation.date).getFullYear();

      return (
        <div className="text-xs text-slate-500 space-y-1 mt-2 md:mt-0">
          {ev.highestScore !== 999 ? (
            <p><span className="font-medium text-slate-700">Thành tích:</span> {achName} (SL: {ev.highestCount}, Cá nhân: {ev.individualCount})</p>
          ) : (
            <p><span className="font-medium text-slate-700">Thành tích:</span> Không có</p>
          )}
          <div className="flex gap-4">
             <span><span className="font-medium text-slate-700">Giới tính:</span> {c.gender || 'Nam'}</span>
             {c.ethnicity && c.ethnicity.toLowerCase() !== 'kinh' && <span><span className="font-medium text-slate-700">Dân tộc:</span> {c.ethnicity}</span>}
          </div>
          <div className="flex gap-4">
             <span><span className="font-medium text-slate-700">Năm sinh:</span> {bDate}</span>
             <span><span className="font-medium text-slate-700">Vào ngành:</span> {recDate}</span>
          </div>
        </div>
      );
    } catch (err) {
      return <div className="text-red-500 text-xs">Lỗi hiển thị: {err.message}</div>;
    }
  };

  // Chỉ lấy những hồ sơ ĐÃ ĐƯỢC QUẢN TRỊ DUYỆT (admin_approved) hoặc đã xếp hạng (ranked, finalized)
  const approvedCandidates = useMemo(() => {
    return candidates
      .filter(c => ['admin_approved', 'ranked', 'finalized'].includes(c.status))
      .map(c => ({
        ...c,
        eligibility: checkEligibility(c)
      }));
  }, [candidates]);

  React.useEffect(() => {
    const alreadyRanked = approvedCandidates.some(c => c.status === 'ranked' || c.status === 'finalized');
    if (alreadyRanked && !hasCalculated) {
      const valid = approvedCandidates.filter(c => c.eligibility.isValid);
      const titles = [...new Set(valid.map(c => c.targetTitle))];
      const sortedValid = [];
      
      titles.forEach(title => {
        const group = valid.filter(c => c.targetTitle === title).sort(rankCandidates);
        group.forEach((c, i) => c.rank = i + 1);
        sortedValid.push(...group);
      });

      sortedValid.sort((a, b) => {
         if (a.targetTitle < b.targetTitle) return -1;
         if (a.targetTitle > b.targetTitle) return 1;
         return a.rank - b.rank;
      });

      setRankedList(sortedValid);
      setHasCalculated(true);
    }
  }, [approvedCandidates, hasCalculated]);

  // Hành động 1: Nút tính xếp hạng (Bỏ qua người không đủ điều kiện)
  const calculateRanking = async () => {
    // Rank chỉ những người admin_approved hoặc ranked
    const valid = approvedCandidates.filter(c => c.eligibility.isValid);
    
    // Group by targetTitle to rank them separately within their title
    const titles = [...new Set(valid.map(c => c.targetTitle))];
    const sortedValid = [];
    
    titles.forEach(title => {
      const group = valid.filter(c => c.targetTitle === title).sort(rankCandidates);
      group.forEach((c, i) => c.rank = i + 1);
      sortedValid.push(...group);
    });

    // Sắp xếp hiển thị theo Title rồi đến Rank
    sortedValid.sort((a, b) => {
       if (a.targetTitle < b.targetTitle) return -1;
       if (a.targetTitle > b.targetTitle) return 1;
       return a.rank - b.rank;
    });

    setRankedList(sortedValid);
    setHasCalculated(true);
    
    // Lưu trạng thái 'ranked' xuống DB cho những người mới 'admin_approved'
    const toUpdate = sortedValid.filter(c => c.status === 'admin_approved').map(c => c.id);
    if(toUpdate.length > 0) {
      await supabase.from('candidates').update({ status: 'ranked' }).in('id', toUpdate);
      if(onRefresh) onRefresh();
    }
  };

  const handleSaveQuotas = async () => {
    await updateSettings({ quotas: localQuotas });
    showAlert('Thành công', 'Đã lưu cấu hình chỉ tiêu xét thăng hạng!');
    setShowQuotaConfig(false);
  };

  const finalizeList = async () => {
    if (!hasCalculated) {
      showAlert('Thông báo', 'Vui lòng tính thứ tự ưu tiên trước khi chốt danh sách!');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn chốt danh sách trình Hiệu trưởng? Hồ sơ sẽ bị khóa ở trạng thái cuối cùng.')) return;
    
    const toUpdate = rankedList.filter(c => c.status === 'ranked').map(c => c.id);
    if(toUpdate.length > 0) {
      await supabase.from('candidates').update({ status: 'finalized' }).in('id', toUpdate);
      if(onRefresh) onRefresh();
      showAlert('Thông báo', 'Đã chốt danh sách trình Hiệu trưởng thành công!');
    }
  };

  // Các hàm xuất Excel và Tờ trình
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_sach");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleExportProposal = async () => {
    if (!hasCalculated) {
      showAlert('Thông báo', 'Bạn cần Tính Xếp hạng ưu tiên trước khi xuất tờ trình.');
      return;
    }
    const hasQuotas = Object.values(localQuotas).some(v => v > 0);
    if (!hasQuotas) {
      if (!confirm('Bạn chưa thiết lập Chỉ tiêu nào! Tờ trình sẽ trống. Bạn có muốn tiếp tục không?')) return;
    }
    
    const success = await exportProposalWord(rankedList, localQuotas);
    if (success) {
      showAlert('Thành công', 'Đã tải xuống file Tờ trình thành công!');
    } else {
      showAlert('Lỗi', 'Không thể tạo file Word. Vui lòng thử lại sau.');
    }
  };

  const exportValid = () => {
    const data = approvedCandidates
      .filter(c => c.eligibility.isValid)
      .map((c, i) => ({
        'STT': i + 1,
        'Họ tên': c.fullName,
        'CCCD': c.cccd,
        'Tổ chuyên môn': c.unit,
        'Chức danh HT': c.currentTitle,
        'Chức danh ĐK': c.targetTitle,
      }));
    exportToExcel(data, 'Danh_sach_du_dieu_kien');
  };

  const exportRanked = () => {
    if (!hasCalculated) {
      showAlert('Thông báo', 'Vui lòng tính thứ tự ưu tiên trước khi xuất báo cáo!');
      return;
    }
    const data = rankedList
      .filter(c => c.eligibility.isValid)
      .map(c => ({
        'Thứ tự ưu tiên': c.rank,
        'Họ tên': c.fullName,
        'Tổ chuyên môn': c.unit,
        'Thành tích (Cao nhất)': c.achievements.length > 0 ? c.achievements[0].id : '', 
      }));
    exportToExcel(data, 'Danh_sach_thu_tu_uu_tien');
  };

  const displayList = hasCalculated ? rankedList : approvedCandidates;
  const uniqueTitles = [...new Set(approvedCandidates.filter(c => c.eligibility.isValid).map(c => c.targetTitle))];

  return (
    <div className="space-y-6 pb-10">
      {/* Các action buttons */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={calculateRanking} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              <Calculator size={20} /> Xếp hạng Ưu tiên
            </button>
            
            <button 
              onClick={finalizeList} 
              disabled={!hasCalculated}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-slate-900 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <FileText size={20} /> Trình Hiệu trưởng
            </button>
            
            <button 
              onClick={() => setShowQuotaConfig(!showQuotaConfig)} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-all"
            >
              <Settings2 size={20} /> Chỉ tiêu
            </button>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            <ExportBtn label="Tải DS Đủ ĐK" onClick={exportValid} color="emerald" />
            <ExportBtn label="Tải DS Xếp hạng" onClick={exportRanked} color="amber" disabled={!hasCalculated} />
            <ExportBtn label="Xuất Tờ trình (Word)" onClick={handleExportProposal} color="blue" disabled={!hasCalculated} />
          </div>
        </div>

        {/* Khung cấu hình chỉ tiêu */}
        {showQuotaConfig && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Thiết lập Chỉ tiêu thăng hạng</h3>
            {uniqueTitles.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có hồ sơ đủ điều kiện để xét chỉ tiêu.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueTitles.map(title => (
                    <div key={title} className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-700">{title}</label>
                      <input 
                        type="number" min="0"
                        className="p-2 border border-slate-300 rounded-md outline-none focus:border-blue-500"
                        placeholder="VD: 2"
                        value={localQuotas[title] || ''}
                        onChange={(e) => setLocalQuotas({...localQuotas, [title]: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveQuotas} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-md font-bold hover:bg-emerald-700 shadow-sm transition-all">
                  <Save size={18} /> Lưu Cấu Hình
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-blue-50 text-blue-700 px-4 py-3 text-sm font-medium border-b border-blue-100 flex items-center justify-between">
          <span>* Lưu ý: Danh sách này chỉ bao gồm {approvedCandidates.length} hồ sơ ĐÃ ĐƯỢC TỔ RÀ SOÁT CẤP TRƯỜNG đánh giá Đủ Điều Kiện.</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                <th className="p-4 w-20 text-center">Xếp hạng</th>
                <th className="p-4">Họ tên & Tổ</th>
                <th className="p-4 hidden md:table-cell">Chức danh đăng ký</th>
                <th className="p-4">Tình trạng</th>
                <th className="p-4">Chi tiết ưu tiên</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Không có hồ sơ nào đủ điều kiện xếp hạng.</td>
                </tr>
              ) : displayList.map(c => {
                const isRankedAndValid = hasCalculated && c.eligibility.isValid;
                const quota = localQuotas[c.targetTitle] || 0;
                const isPassed = isRankedAndValid && quota > 0 && c.rank <= quota;
                const rowClass = isPassed ? "bg-emerald-50/50 hover:bg-emerald-100" : "hover:bg-slate-50/50";
                
                return (
                  <tr key={c.id} className={`border-b border-slate-100 ${rowClass}`}>
                    <td className="p-4 text-center">
                      {isRankedAndValid ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold border shadow-sm ${
                            isPassed ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {c.rank}
                          </span>
                          {quota > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPassed ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                              {isPassed ? 'Trúng tuyển' : 'Vượt chỉ tiêu'}
                            </span>
                          )}
                        </div>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{c.fullName}</p>
                      <p className="text-xs text-slate-500">{c.unit}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-slate-600">
                      {c.targetTitle}
                      {quota > 0 && <span className="ml-2 text-xs font-medium text-slate-400">(Chỉ tiêu: {quota})</span>}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4">
                      {getRankingReason(c)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ExportBtn = ({ label, onClick, color, disabled }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
  };
  const base = colors[color];
  const dis = disabled ? 'opacity-50 cursor-not-allowed grayscale' : '';

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${base} ${dis}`}
    >
      <Download size={16} /> {label}
    </button>
  );
}
