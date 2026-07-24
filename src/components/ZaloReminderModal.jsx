import React from 'react';
import { X, Copy, MessageCircle } from 'lucide-react';
import { showAlert } from '../utils/alert';

export const ZaloReminderModal = ({ isOpen, onClose, candidates, scope, departmentName, activeBatch }) => {
  if (!isOpen) return null;

  // Lọc danh sách những người chưa nộp (nháp, bị trả lại)
  const pendingStatuses = ['draft', 'head_rejected', 'returned', 'admin_rejected'];
  
  const pendingCandidates = candidates.filter(c => pendingStatuses.includes(c.status));
  const count = pendingCandidates.length;

  const deadlineText = activeBatch?.deadline ? `${new Date(activeBatch.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${new Date(activeBatch.deadline).toLocaleDateString('vi-VN')}` : 'thời hạn quy định';

  // Nhóm theo Tổ (dành cho Admin)
  const groupedByUnit = pendingCandidates.reduce((acc, c) => {
    const unit = c.unit || 'Chưa rõ Tổ';
    if (!acc[unit]) acc[unit] = [];
    acc[unit].push(c);
    return acc;
  }, {});

  let messageTemplate = '';

  if (scope === 'head') {
    messageTemplate = `Kính gửi các thầy cô trong Tổ ${departmentName},\n\nHiện tại trên hệ thống Đăng ký xét thăng hạng vẫn còn ${count} hồ sơ chưa hoàn thành hoặc đang bị trả lại yêu cầu bổ sung.\n\nĐề nghị các thầy cô có tên sau khẩn trương hoàn thiện và nhấn nút "Nộp cho Tổ trưởng" trước ${deadlineText}:\n${pendingCandidates.map((c, i) => `${i + 1}. ${c.fullName || c.name}`).join('\n')}\n\nTrân trọng!`;
  } else {
    let listStr = Object.keys(groupedByUnit).map(unit => {
      return `- ${unit} (${groupedByUnit[unit].length} hồ sơ):\n  ${groupedByUnit[unit].map(c => c.fullName || c.name).join(', ')}`;
    }).join('\n');
    
    messageTemplate = `Kính gửi các đồng chí Tổ trưởng chuyên môn,\n\nHiện tại trên hệ thống Đăng ký xét thăng hạng toàn trường vẫn còn ${count} hồ sơ chưa hoàn thành (đang lưu nháp hoặc bị trả lại).\n\nChi tiết theo Tổ:\n${listStr}\n\nĐề nghị các đ/c Tổ trưởng khẩn trương đôn đốc, nhắc nhở giáo viên thuộc tổ mình hoàn thiện và nộp hồ sơ trên hệ thống trước ${deadlineText}.\n\nTrân trọng!`;
  }

  if (count === 0) {
     messageTemplate = `Tuyệt vời! Tất cả giáo viên đã hoàn thành nộp hồ sơ.`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageTemplate);
    showAlert('Thành công', 'Đã sao chép tin nhắn vào khay nhớ tạm! Bạn có thể dán (Ctrl+V) vào nhóm Zalo.');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle className="text-blue-600" />
            Đôn đốc nộp hồ sơ (Qua Zalo)
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-4">
            <p className="text-slate-700 font-medium mb-2">
              Thống kê: <span className="text-rose-600 font-bold">{count}</span> hồ sơ chưa nộp (Nháp hoặc Bị trả lại).
            </p>
            {count > 0 && scope === 'head' && (
              <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-700 max-h-40 overflow-y-auto mb-4">
                <ul className="list-disc pl-5 space-y-1">
                  {pendingCandidates.map((c, idx) => (
                    <li key={c.id || idx}>{c.fullName || c.name} - Trạng thái: {c.status === 'draft' ? 'Lưu nháp' : 'Bị trả lại'}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {count > 0 && scope === 'school' && (
              <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-700 max-h-48 overflow-y-auto mb-4 space-y-3">
                {Object.keys(groupedByUnit).map(unit => (
                  <div key={unit}>
                    <div className="font-bold text-blue-800 border-b border-blue-200 pb-1 mb-1">{unit} ({groupedByUnit[unit].length})</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {groupedByUnit[unit].map((c, idx) => (
                        <li key={c.id || idx}>{c.fullName || c.name} <span className="text-slate-500 text-xs">- {c.status === 'draft' ? 'Lưu nháp' : 'Bị trả lại'}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">Nội dung tin nhắn mẫu:</label>
            <button 
              onClick={handleCopy}
              disabled={count === 0}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Copy size={16} /> Sao chép tin nhắn
            </button>
          </div>
          <textarea 
            readOnly
            className="w-full h-48 p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            value={messageTemplate}
          />
          <p className="text-xs text-slate-500 mt-2 italic">
            * Tính năng này giúp bạn copy nhanh mẫu tin nhắn để gửi vào nhóm Zalo của Tổ/Trường.
          </p>
        </div>
      </div>
    </div>
  );
};
