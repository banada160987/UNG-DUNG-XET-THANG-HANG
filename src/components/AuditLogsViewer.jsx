import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Clock, User, Activity, FileText, ChevronDown, ChevronUp, AlertCircle, Eye } from 'lucide-react';
import { showAlert } from '../utils/alert';

export const AuditLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Lỗi khi tải nhật ký:', error);
      showAlert('Lỗi', 'Không thể tải nhật ký hệ thống.');
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const getActionColor = (action) => {
    if (action.includes('APPROVED')) return 'text-emerald-600 bg-emerald-50';
    if (action.includes('REJECTED') || action.includes('RETURNED')) return 'text-red-600 bg-red-50';
    if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50';
    return 'text-slate-600 bg-slate-50';
  };

  const formatData = (data) => {
    if (!data) return 'Không có dữ liệu';
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Nhật ký Hoạt động Hệ thống (Audit Logs)
        </h2>
        <button onClick={fetchLogs} className="text-sm text-blue-600 hover:underline">
          Làm mới
        </button>
      </div>

      <div className="p-0 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải nhật ký...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center text-slate-500">
            <AlertCircle size={32} className="mb-2 text-slate-300" />
            <p>Chưa có dữ liệu nhật ký hệ thống.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-1 sm:mt-0 ${getActionColor(log.action_type)}`}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{log.actor}</span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <User size={14} /> CCCD Tác động: {log.target_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getActionColor(log.action_type)}`}>
                          {log.action_type}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400 flex self-end sm:self-auto">
                    {expandedLog === log.id ? <ChevronUp size={20} /> : <Eye size={20} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLog === log.id && (
                  <div className="mt-4 pl-12 pr-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-red-800 mb-2 uppercase">Dữ liệu cũ</h4>
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-x-auto">
                        {formatData(log.old_data)}
                      </pre>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-emerald-800 mb-2 uppercase">Dữ liệu mới</h4>
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-x-auto">
                        {formatData(log.new_data)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
