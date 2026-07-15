import React from 'react';
import { XCircle, FileText, Download } from 'lucide-react';
import { CandidateForm } from '../pages/CandidateForm';
import { exportCandidateToWord } from '../utils/exportWord';

export const CandidateDetailsModal = ({ candidate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-20 rounded-t-xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <FileText size={20} className="text-blue-500" />
            Chi tiết hồ sơ: {candidate.fullName} ({candidate.cccd})
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => exportCandidateToWord(candidate)} 
              className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 shadow-sm font-medium"
              title="Tải Danh mục hồ sơ bản Word"
            >
              <Download size={16} />
              Xuất Bìa & Danh Mục
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-1 bg-white rounded-full shadow-sm hover:shadow">
              <XCircle size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-slate-100/50">
          <CandidateForm 
            initialData={candidate} 
            isReadOnly={true} 
            onSave={() => {}} 
            onSubmitToHead={() => {}} 
            onCancel={() => {}} 
          />
        </div>
      </div>
    </div>
  );
};
