import React, { useState } from 'react';
import { XCircle, FileText, Download, MessageSquareWarning } from 'lucide-react';
import { CandidateForm } from '../pages/CandidateForm';
import { exportCandidateToWord } from '../utils/exportWord';
import { exportDetailedChecklistWord } from '../utils/exportDetailedChecklistWord';
import { showPrompt } from '../utils/alert';
import { getBadges } from './DepartmentInsights';

export const CandidateDetailsModal = ({ candidate, onClose, onReject }) => {
  const [fieldComments, setFieldComments] = useState({});

  const badges = getBadges(candidate);

  const handleCommentChange = (fieldName, comment) => {
    setFieldComments(prev => {
      const next = { ...prev };
      if (!comment) {
        delete next[fieldName];
      } else {
        next[fieldName] = comment;
      }
      return next;
    });
  };

  const handleRejectClick = async () => {
    const generalMsg = await showPrompt("Nhập nhận xét chung (tùy chọn):", "Nhập nhận xét...", "");
    if (generalMsg === null && Object.keys(fieldComments).length === 0) return; // Cancel
    
    const feedbackObj = {
      general: generalMsg || "Vui lòng xem các lỗi đánh dấu đỏ ở từng mục",
      fields: fieldComments
    };
    onReject(candidate, JSON.stringify(feedbackObj));
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-20 rounded-t-xl flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <FileText size={20} className="text-blue-500" />
              Chi tiết hồ sơ: {candidate.fullName} ({candidate.cccd})
            </h3>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 ml-7">
                {badges.map(b => {
                  const Icon = b.icon;
                  return (
                    <span key={b.id} className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md shadow-sm border border-white/50 ${b.color}`} title={b.name}>
                      <Icon size={12} /> {b.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => exportCandidateToWord(candidate)} 
              className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 shadow-sm font-medium"
              title="Tải Danh mục hồ sơ bản Word (Mẫu cũ)"
            >
              <Download size={16} />
              Xuất File Word (Mẫu cũ)
            </button>
            <button 
              onClick={() => exportDetailedChecklistWord(candidate)} 
              className="flex items-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 shadow-sm font-medium"
              title="Tải Danh mục và Bìa bản Word (Mẫu mới)"
            >
              <Download size={16} />
              Xuất Danh Mục
            </button>
            {onReject && (
              <button 
                onClick={handleRejectClick}
                className="flex items-center gap-2 text-sm bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-200 shadow-sm font-medium"
                title="Từ chối hồ sơ kèm nhận xét"
              >
                <MessageSquareWarning size={16} />
                Từ chối & Trả hồ sơ
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-1 bg-white rounded-full shadow-sm hover:shadow">
              <XCircle size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-slate-100/50">
          <CandidateForm 
            initialData={candidate} 
            isReadOnly={true} 
            mode={onReject ? 'review' : 'view'}
            onCommentChange={handleCommentChange}
            onSave={() => {}} 
            onSubmitToHead={() => {}} 
            onCancel={() => {}} 
          />
        </div>
      </div>
    </div>
  );
};
