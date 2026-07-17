import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Clock, Search, Filter } from 'lucide-react';

export const ActionHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // Join with candidates to get candidate name
    const { data, error } = await supabase
      .from('candidate_logs')
      .select(`
        *,
        candidate:candidate_id (
          fullName
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const getActionColor = (action) => {
    const act = (action || '').toLowerCase();
    if (act.includes('duyệt') || act.includes('trúng')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (act.includes('trả') || act.includes('từ chối')) return 'text-red-600 bg-red-50 border-red-200';
    if (act.includes('nộp')) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const renderNotes = (notes) => {
    if (!notes) return '-';
    try {
      const parsed = JSON.parse(notes);
      if (parsed.general) {
        const hasFields = parsed.fields && Object.keys(parsed.fields).length > 0;
        return (
          <div className="flex flex-col gap-1">
            <span>{parsed.general}</span>
            {hasFields && <span className="text-[11px] text-rose-500 italic">Có đính kèm lỗi chi tiết từng mục</span>}
          </div>
        );
      }
    } catch(e) {}
    return notes;
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = (log.actor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (log.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (log.candidate?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || log.actor_role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock size={20} className="text-blue-600" /> Nhật ký Hoạt động (Audit Logs)
        </h3>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm theo tên, hành động..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="secretary">Thư ký</option>
            <option value="admin">Quản trị / Hiệu trưởng</option>
            <option value="teacher">Giáo viên</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải nhật ký...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Không tìm thấy lịch sử hoạt động nào.</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="p-3 font-medium w-40">Thời gian</th>
                <th className="p-3 font-medium">Người thực hiện</th>
                <th className="p-3 font-medium">Hành động</th>
                <th className="p-3 font-medium">Hồ sơ tác động</th>
                <th className="p-3 font-medium">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id || Math.random()} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-500">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-800">{log.actor_name}</p>
                    <p className="text-xs text-slate-500 uppercase">{log.actor_role}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {log.candidate ? log.candidate.fullName : 'Hệ thống'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {renderNotes(log.notes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
