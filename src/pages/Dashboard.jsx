import React, { useState, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkEligibility } from '../utils/validation';
import { StatusBadge } from '../components/StatusBadge';
import { Users, FileText, CheckSquare, XCircle, Search, ThumbsUp, ThumbsDown } from 'lucide-react';

export const Dashboard = ({ candidates, onRefresh }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const evaluated = useMemo(() => {
    return candidates.map(c => ({
      ...c,
      eligibility: checkEligibility(c)
    }));
  }, [candidates]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('candidates').update({ status }).eq('id', id);
    if (!error) {
      if(onRefresh) onRefresh();
    } else {
      alert('Lỗi cập nhật trạng thái!');
    }
  };

  // Thống kê
  const totalCount = evaluated.length;
  const waitingAdminCount = evaluated.filter(c => c.status === 'head_approved').length;
  const reviewingCount = evaluated.filter(c => c.status === 'admin_reviewing').length;
  const adminFinishedCount = evaluated.filter(c => ['admin_approved', 'admin_rejected', 'ranked', 'finalized'].includes(c.status)).length;

  const displayList = evaluated.filter(c => {
    if (selectedFilter === 'waiting') return c.status === 'head_approved';
    if (selectedFilter === 'reviewing') return c.status === 'admin_reviewing';
    if (selectedFilter === 'finished') return ['admin_approved', 'admin_rejected', 'ranked', 'finalized'].includes(c.status);
    return true; 
  });

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
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            Danh sách rà soát cấp Trường
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
                <div className="flex items-center gap-3 mt-1 mb-2">
                  <span className="text-sm text-slate-600 font-medium">{c.unit}</span>
                  <StatusBadge status={c.status} />
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
              </div>
              
              {/* Vùng thao tác của Admin */}
              <div className="flex flex-col gap-2 min-w-[200px]">
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
              </div>
            </div>
          )})}
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
