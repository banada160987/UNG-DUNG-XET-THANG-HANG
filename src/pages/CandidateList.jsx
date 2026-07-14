import React, { useState, useMemo } from 'react';
import { checkEligibility } from '../utils/validation';
import { rankCandidates } from '../utils/ranking';
import { TARGET_TITLES } from '../data/config';
import { Edit, Trash2, Download, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const CandidateList = ({ candidates, onEdit, onDelete }) => {
  const [filterTitle, setFilterTitle] = useState('Hạng II');

  const displayCandidates = useMemo(() => {
    // Lọc theo chức danh đăng ký
    const filtered = candidates.filter(c => c.targetTitle === filterTitle);
    
    // Áp dụng đánh giá và xếp hạng
    const evaluated = filtered.map(c => {
      const eligibility = checkEligibility(c);
      return {
        ...c,
        eligibility
      };
    });

    // Chỉ xếp hạng những người đủ điều kiện
    const validCandidates = evaluated.filter(c => c.eligibility.isValid).sort(rankCandidates);
    const invalidCandidates = evaluated.filter(c => !c.eligibility.isValid); // Đưa xuống cuối, không xếp hạng

    // Gán thứ tự ưu tiên
    validCandidates.forEach((c, index) => {
      c.rank = index + 1;
    });

    return [...validCandidates, ...invalidCandidates];
  }, [candidates, filterTitle]);

  const exportExcel = () => {
    const data = displayCandidates.map((c, i) => ({
      'STT': i + 1,
      'Họ tên': c.fullName,
      'Đơn vị': c.unit,
      'Chức danh đăng ký': c.targetTitle,
      'Đủ điều kiện': c.eligibility.isValid ? 'Đủ điều kiện' : 'Thiếu ĐK',
      'Thứ tự ưu tiên': c.eligibility.isValid ? c.rank : '-',
      'Ghi chú thiếu': c.eligibility.isValid ? '' : c.eligibility.missing.join(', ')
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sach ung vien");
    XLSX.writeFile(wb, `Danh_Sach_Ung_Vien_${filterTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="font-medium text-slate-700">Lọc theo chức danh:</label>
          <select 
            value={filterTitle} 
            onChange={e => setFilterTitle(e.target.value)}
            className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
          >
            {TARGET_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button onClick={exportExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium transition-colors">
            <Download size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                <th className="p-4 w-16 text-center">TT Ưu tiên</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4 hidden md:table-cell">Đơn vị</th>
                <th className="p-4">Điều kiện</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayCandidates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Chưa có ứng viên nào đăng ký xét {filterTitle}.
                  </td>
                </tr>
              ) : (
                displayCandidates.map((c, i) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-center">
                      {c.eligibility.isValid ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                          {c.rank}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{c.fullName}</p>
                      <p className="text-xs text-slate-500">{c.dob} • {c.gender}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-slate-600">
                      {c.unit}
                    </td>
                    <td className="p-4">
                      {c.eligibility.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle size={14} /> Đủ điều kiện
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-rose-600 text-sm font-medium bg-rose-50 px-2.5 py-1 rounded-full w-max">
                            <XCircle size={14} /> Thiếu ĐK
                          </span>
                          <span className="text-xs text-rose-500 truncate max-w-[200px]" title={c.eligibility.missing.join(', ')}>
                            {c.eligibility.missing[0]} {c.eligibility.missing.length > 1 && '...'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(c.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => onDelete(c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
