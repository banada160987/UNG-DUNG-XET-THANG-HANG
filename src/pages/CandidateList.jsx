import React, { useState, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { rankCandidates } from '../utils/ranking';
import { StatusBadge } from '../components/StatusBadge';
import { Download, Calculator, CheckCircle, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

export const CandidateList = ({ candidates, onRefresh }) => {
  const [rankedList, setRankedList] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Chỉ lấy những hồ sơ ĐÃ ĐƯỢC QUẢN TRỊ DUYỆT (admin_approved) hoặc đã xếp hạng (ranked, finalized)
  const approvedCandidates = useMemo(() => {
    return candidates
      .filter(c => ['admin_approved', 'ranked', 'finalized'].includes(c.status))
      .map(c => ({
        ...c,
        eligibility: checkEligibility(c)
      }));
  }, [candidates]);

  // Hành động 1: Nút tính xếp hạng (Bỏ qua người không đủ điều kiện)
  const calculateRanking = async () => {
    // Rank chỉ những người admin_approved hoặc ranked
    const valid = approvedCandidates.filter(c => c.eligibility.isValid);
    const sortedValid = valid.sort(rankCandidates);
    sortedValid.forEach((c, i) => c.rank = i + 1);
    
    setRankedList(sortedValid);
    setHasCalculated(true);
    
    // Lưu trạng thái 'ranked' xuống DB cho những người mới 'admin_approved'
    const toUpdate = sortedValid.filter(c => c.status === 'admin_approved').map(c => c.id);
    if(toUpdate.length > 0) {
      await supabase.from('candidates').update({ status: 'ranked' }).in('id', toUpdate);
      if(onRefresh) onRefresh();
    }
  };

  const finalizeList = async () => {
    if (!hasCalculated) {
      alert('Vui lòng tính thứ tự ưu tiên trước khi chốt danh sách!');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn chốt danh sách trình Hiệu trưởng? Hồ sơ sẽ bị khóa ở trạng thái cuối cùng.')) return;
    
    const toUpdate = rankedList.filter(c => c.status === 'ranked').map(c => c.id);
    if(toUpdate.length > 0) {
      await supabase.from('candidates').update({ status: 'finalized' }).in('id', toUpdate);
      if(onRefresh) onRefresh();
      alert('Đã chốt danh sách trình Hiệu trưởng thành công!');
    }
  };

  // Các hàm xuất Excel
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
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
      alert('Vui lòng tính thứ tự ưu tiên trước khi xuất báo cáo!');
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

  return (
    <div className="space-y-6 pb-10">
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
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <ExportBtn label="Tải DS Đủ ĐK" onClick={exportValid} color="emerald" />
          <ExportBtn label="Tải DS Xếp hạng" onClick={exportRanked} color="amber" disabled={!hasCalculated} />
        </div>
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
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">Không có hồ sơ nào đủ điều kiện xếp hạng.</td>
                </tr>
              ) : displayList.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4 text-center">
                    {hasCalculated && c.eligibility.isValid ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200 shadow-sm">
                        {c.rank}
                      </span>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{c.fullName}</p>
                    <p className="text-xs text-slate-500">{c.unit}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-slate-600">
                    {c.targetTitle}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
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
