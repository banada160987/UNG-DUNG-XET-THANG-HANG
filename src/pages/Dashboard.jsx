import React, { useState, useMemo } from 'react';
import { checkEligibility } from '../utils/validation';
import { Users, CheckCircle, XCircle, FileText, CheckSquare } from 'lucide-react';

export const Dashboard = ({ candidates }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const evaluated = useMemo(() => {
    return candidates.map(c => ({
      ...c,
      eligibility: checkEligibility(c)
    }));
  }, [candidates]);

  // Bộ lọc
  const validCount = evaluated.filter(c => c.eligibility.isValid && c.status === 'verified').length;
  const invalidCount = evaluated.filter(c => !c.eligibility.isValid).length;
  const draftCount = evaluated.filter(c => c.status !== 'verified').length;

  const displayList = evaluated.filter(c => {
    if (selectedFilter === 'invalid') return !c.eligibility.isValid;
    if (selectedFilter === 'verified') return c.status === 'verified';
    if (selectedFilter === 'draft') return c.status !== 'verified';
    return true; 
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng nộp" 
          value={evaluated.length} 
          icon={<Users className="text-blue-500" size={24} />} 
          bgColor="bg-blue-50"
          active={selectedFilter === 'all'}
          onClick={() => setSelectedFilter('all')}
        />
        <StatCard 
          title="Chưa duyệt" 
          value={draftCount} 
          icon={<FileText className="text-amber-500" size={24} />} 
          bgColor="bg-amber-50"
          active={selectedFilter === 'draft'}
          onClick={() => setSelectedFilter('draft')}
        />
        <StatCard 
          title="Tổ đã duyệt" 
          value={evaluated.length - draftCount} 
          icon={<CheckSquare className="text-indigo-500" size={24} />} 
          bgColor="bg-indigo-50"
          active={selectedFilter === 'verified'}
          onClick={() => setSelectedFilter('verified')}
        />
        <StatCard 
          title="Lỗi (Thiếu ĐK)" 
          value={invalidCount} 
          icon={<XCircle className="text-rose-500" size={24} />} 
          bgColor="bg-rose-50"
          active={selectedFilter === 'invalid'}
          onClick={() => setSelectedFilter('invalid')}
          pulse={invalidCount > 0}
        />
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            Danh sách rà soát
          </h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {displayList.length === 0 ? (
            <p className="text-center p-8 text-slate-400">Không có dữ liệu.</p>
          ) : displayList.map(c => (
            <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-semibold text-slate-800 text-lg">{c.fullName}</p>
                <p className="text-sm text-slate-500">Tổ: {c.unit} • Trạng thái: {c.status === 'verified' ? 'Đã duyệt' : c.status === 'rejected' ? 'Báo sửa' : 'Chờ duyệt'}</p>
                
                {!c.eligibility.isValid && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.eligibility.missing.map((err, i) => (
                      <span key={i} className="inline-flex text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md font-medium">
                        {err}
                      </span>
                    ))}
                  </div>
                )}
                {c.eligibility.isValid && (
                  <div className="mt-2">
                    <span className="inline-flex text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md font-medium">
                      Hồ sơ đầy đủ
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
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
