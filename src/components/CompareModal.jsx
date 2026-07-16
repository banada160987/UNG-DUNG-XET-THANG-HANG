import React from 'react';
import { XCircle, Award, Calendar, CheckSquare, FileText, User } from 'lucide-react';

export const CompareModal = ({ candidates, onClose }) => {
  if (!candidates || candidates.length < 2) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-20 rounded-t-xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <User size={20} className="text-blue-500" />
            Bàn cân đối chiếu hồ sơ ({candidates.length} ứng viên)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-1 bg-white rounded-full shadow-sm hover:shadow">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-slate-100/50">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(0, 1fr))` }}>
            {candidates.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-4">
                <div className="text-center pb-4 border-b border-slate-100">
                  <h4 className="font-bold text-lg text-slate-800">{c.fullName}</h4>
                  <p className="text-sm text-slate-500">{c.unit}</p>
                  <p className="text-xs text-slate-400 mt-1">Đăng ký: {c.targetTitle}</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
                    <Award size={18} /> Điểm tổng: {c.score || 0}
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h5 className="font-semibold text-slate-700 text-sm flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-slate-400" /> Thâm niên
                    </h5>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm">
                      <p><b>QĐ Tuyển dụng:</b> {c.decisionRecruitment?.date ? new Date(c.decisionRecruitment.date).toLocaleDateString('vi-VN') : 'Chưa nhập'}</p>
                      <p className="mt-1"><b>QĐ Hết tập sự:</b> {c.decisionProbation?.date ? new Date(c.decisionProbation.date).toLocaleDateString('vi-VN') : 'Chưa nhập'}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-700 text-sm flex items-center gap-2 mb-2">
                      <Award size={16} className="text-slate-400" /> Thành tích nổi bật
                    </h5>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm max-h-48 overflow-y-auto">
                      {c.achievements && c.achievements.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {c.achievements.map((ach, i) => (
                            <li key={i}>{ach.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 italic">Không có thành tích</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-700 text-sm flex items-center gap-2 mb-2">
                      <CheckSquare size={16} className="text-slate-400" /> Trạng thái hồ sơ
                    </h5>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm flex flex-col gap-2">
                      <span className="font-medium text-slate-700">{c.status}</span>
                      {c.eligibility && c.eligibility.isValid ? (
                        <span className="text-emerald-600">Đủ điều kiện ban đầu</span>
                      ) : (
                        <span className="text-rose-600 font-medium">
                          Thiếu: {c.eligibility?.missing?.length || 0} loại giấy tờ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
