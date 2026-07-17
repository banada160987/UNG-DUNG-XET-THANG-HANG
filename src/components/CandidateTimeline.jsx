import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { History, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const CandidateTimeline = ({ candidateId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidate_logs')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };
    
    fetchLogs();
  }, [candidateId]);

  const renderNotes = (notes) => {
    if (!notes) return null;
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

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-blue-500" />
            Lịch sử thao tác
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-500 italic py-8">Đang tải lịch sử...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-slate-500 italic py-8">Chưa có thao tác nào được ghi nhận.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.id} className="flex gap-4 relative">
                  {index !== logs.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-200"></div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 z-10">
                    <Clock size={16} />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1 mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-800">{log.action}</span>
                      <span className="text-xs text-slate-500">{format(new Date(log.created_at), 'HH:mm dd/MM/yyyy')}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">
                      Thực hiện bởi: <span className="font-medium">{log.actor_name}</span> ({log.actor_role})
                    </p>
                    {log.notes && (
                      <div className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-100 mt-2">
                        {renderNotes(log.notes)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
