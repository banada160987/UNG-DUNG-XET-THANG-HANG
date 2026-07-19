import React from 'react';
import { X, Trophy, ArrowUp, ArrowDown, ShieldAlert, CheckCircle, Scale } from 'lucide-react';
import { compareCandidatesWithReason } from '../utils/ranking';

export const ExplainRankingModal = ({ candidate, rankedList, onClose }) => {
  const currentIndex = rankedList.findIndex(c => c.id === candidate.id);
  const prevCandidate = currentIndex > 0 ? rankedList[currentIndex - 1] : null;
  const nextCandidate = currentIndex < rankedList.length - 1 ? rankedList[currentIndex + 1] : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Giải thích Thứ hạng (AI)</h2>
              <p className="text-sm text-slate-500">Cơ sở đánh giá theo Kế hoạch 125</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 bg-slate-50/30">
          
          <div className="bg-white border-2 border-blue-500 shadow-lg shadow-blue-500/10 rounded-2xl p-6 relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-md border-4 border-white">
              #{currentIndex + 1}
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black uppercase">
                {candidate.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{candidate.fullName}</h3>
                <p className="text-slate-500 text-sm">Chức danh hiện tại: {candidate.currentTitle || "Giáo viên"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <ArrowUp size={18} className="text-rose-500" /> Tại sao đứng dưới hạng #{currentIndex}?
              </h4>
              
              {prevCandidate ? (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm opacity-90">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div className="font-bold text-slate-800">{prevCandidate.fullName}</div>
                    <div className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded">#{currentIndex}</div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-rose-100 p-1.5 rounded text-rose-600 mt-0.5">
                      <ShieldAlert size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">Lý do thua:</div>
                      <div className="text-sm text-slate-600 mt-1">
                        {compareCandidatesWithReason(candidate, prevCandidate).reason}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-emerald-700 text-sm flex items-center gap-2 font-medium">
                  <Trophy size={18} /> Đây là người xuất sắc nhất (Hạng 1).
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <ArrowDown size={18} className="text-emerald-500" /> Tại sao đứng trên hạng #{currentIndex + 2}?
              </h4>
              
              {nextCandidate ? (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm opacity-90">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div className="font-bold text-slate-800">{nextCandidate.fullName}</div>
                    <div className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded">#{currentIndex + 2}</div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-1.5 rounded text-emerald-600 mt-0.5">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">Lý do thắng:</div>
                      <div className="text-sm text-slate-600 mt-1">
                        {compareCandidatesWithReason(nextCandidate, candidate).reason}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-500 text-sm italic">
                  Không có người xếp sau.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
