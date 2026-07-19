import React, { useMemo, useState } from 'react';
import { 
  XCircle, FileText, Download, CheckCircle, AlertTriangle, User, 
  Award, Briefcase, GraduationCap, Calendar, ShieldCheck, Activity, Star, Eye
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { exportCandidateToWord } from '../utils/exportWord';
import { showPrompt } from '../utils/alert';
import { getBadges } from './DepartmentInsights';
import { checkEligibility } from '../utils/validation';

export const DigitalTwinModal = ({ candidate, onClose, onReject }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, timeline, documents

  const badges = getBadges(candidate);
  const eligibility = checkEligibility(candidate);

  // 1. Phân tích độ hoàn thiện hồ sơ (Completion %)
  const completionPercent = useMemo(() => {
    let score = 0;
    let totalFields = 10;
    
    if (candidate.fullName) score++;
    if (candidate.dob) score++;
    if (candidate.cccd) score++;
    if (candidate.unit) score++;
    if (candidate.currentTitle) score++;
    if (candidate.targetTitle) score++;
    if (candidate.evalMinute) score++;
    if (candidate.decisionAppointment) score++;
    if (candidate.degrees?.length > 0) score++;
    if (candidate.achievements?.length > 0 || candidate.otherAchievements?.length > 0) score++;

    return Math.round((score / totalFields) * 100);
  }, [candidate]);

  // 2. Personal Radar Chart Data
  const radarData = useMemo(() => {
    let thiDua = candidate.achievements?.length || 0;
    let sangKien = 0, khac = 0;
    candidate.otherAchievements?.forEach(a => {
      if (a.name?.toLowerCase().includes('sáng kiến')) sangKien++;
      else khac++;
    });
    let chuyenMon = candidate.degrees?.length || 0;
    let boiDuong = candidate.certificates?.length || 0;

    return [
      { subject: 'Thi đua', A: thiDua, fullMark: 5 },
      { subject: 'Sáng kiến', A: sangKien, fullMark: 5 },
      { subject: 'Chuyên môn', A: chuyenMon, fullMark: 5 },
      { subject: 'Bồi dưỡng', A: boiDuong, fullMark: 5 },
      { subject: 'Khác', A: khac, fullMark: 5 },
    ];
  }, [candidate]);

  // 3. Career Timeline Builder
  const timeline = useMemo(() => {
    const events = [];
    
    if (candidate.dob) {
      events.push({ year: candidate.dob.split('-')[0], title: 'Sinh năm', type: 'birth', icon: User, color: 'bg-slate-200 text-slate-600' });
    }
    
    // Giả định năm bổ nhiệm từ số quyết định (nếu có regex tìm năm)
    if (candidate.decisionAppointment) {
      const dateStr = candidate.decisionAppointment.date || candidate.decisionAppointment.number || '';
      const yearMatch = typeof dateStr === 'string' ? dateStr.match(/\b(19|20)\d{2}\b/) : null;
      if (yearMatch) {
        events.push({ year: yearMatch[0], title: `Bổ nhiệm ${candidate.currentTitle}`, type: 'career', icon: Briefcase, color: 'bg-blue-100 text-blue-600' });
      }
    }

    candidate.degrees?.forEach(d => {
      if (d.year) events.push({ year: d.year, title: `Tốt nghiệp ${d.level}`, type: 'edu', icon: GraduationCap, color: 'bg-purple-100 text-purple-600' });
    });

    candidate.achievements?.forEach(a => {
      if (a.year) events.push({ year: a.year, title: `Thành tích: ${a.name || a.id}`, type: 'award', icon: Award, color: 'bg-amber-100 text-amber-600' });
    });

    candidate.otherAchievements?.forEach(a => {
      if (a.year) events.push({ year: a.year, title: `${a.name}`, type: 'other', icon: Star, color: 'bg-orange-100 text-orange-600' });
    });

    return events.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [candidate]);

  const handleRejectClick = async () => {
    const generalMsg = await showPrompt("Nhập nhận xét chung (tùy chọn):", "Nhập nhận xét...", "");
    if (generalMsg === null) return;
    onReject(candidate, generalMsg);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 flex flex-col h-[90vh]">
        
        {/* HEADER */}
        <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center shrink-0 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-black border-4 border-white shadow-sm">
              {candidate.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{candidate.fullName}</h2>
              <p className="text-slate-500 font-medium">{candidate.unit} • {candidate.currentTitle} ➔ <span className="text-indigo-600 font-bold">{candidate.targetTitle}</span></p>
              <div className="flex flex-wrap gap-2 mt-2">
                {badges.map(b => {
                  const Icon = b.icon;
                  return (
                    <span key={b.id} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${b.color}`}>
                      <Icon size={12} /> {b.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
              <XCircle size={24} />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => exportCandidateToWord(candidate)} className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-colors">
                <Download size={16} /> Xuất Hồ sơ
              </button>
              {onReject && (
                <button onClick={handleRejectClick} className="flex items-center gap-2 text-sm bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-100 font-bold transition-colors">
                  <AlertTriangle size={16} /> Yêu cầu Sửa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 px-6 shrink-0">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Activity size={16} className="inline mr-2" /> Digital Twin 360°
          </button>
          <button onClick={() => setActiveTab('timeline')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Calendar size={16} className="inline mr-2" /> Trục Sự Nghiệp
          </button>
          <button onClick={() => setActiveTab('documents')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'documents' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <FileText size={16} className="inline mr-2" /> Hồ Sơ Gốc
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CỘT 1: Độ hoàn thiện & AI Explainability */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Completion Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" /> Tình trạng khai báo
                  </h3>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-black text-slate-800">{completionPercent}%</span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Hoàn chỉnh</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${completionPercent}%` }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500"/> Lý lịch</div>
                    <div className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500"/> Văn bằng</div>
                    <div className="flex items-center gap-1"><CheckCircle size={12} className={candidate.achievements?.length > 0 ? "text-emerald-500" : "text-slate-300"}/> Thành tích</div>
                    <div className="flex items-center gap-1"><CheckCircle size={12} className={candidate.evalMinute ? "text-emerald-500" : "text-slate-300"}/> Nhận xét</div>
                  </div>
                </div>

                {/* AI Explainability Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-500" /> AI Đánh Giá Điều Kiện
                  </h3>
                  
                  <div className={`p-3 rounded-lg flex items-center gap-3 mb-4 ${eligibility.isValid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {eligibility.isValid ? <CheckCircle size={24} className="text-emerald-500" /> : <AlertTriangle size={24} className="text-rose-500" />}
                    <div>
                      <div className="font-bold">{eligibility.isValid ? 'ĐỦ ĐIỀU KIỆN' : 'CHƯA ĐỦ ĐIỀU KIỆN'}</div>
                      <div className="text-[10px] opacity-80">Độ tin cậy máy tính: 100%</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-600 mb-1">Cơ sở đánh giá:</p>
                    
                    {/* Bằng cấp */}
                    <div className="flex items-start gap-2">
                      {eligibility.missing && eligibility.missing.some(w => w.includes('Văn bằng')) ? <XCircle size={14} className="text-rose-500 mt-0.5 shrink-0" /> : <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />}
                      <span className={eligibility.missing && eligibility.missing.some(w => w.includes('Văn bằng')) ? 'text-rose-700' : 'text-slate-600'}>
                        Điều kiện Văn bằng: {candidate.degrees?.length > 0 ? 'Đã cung cấp đủ' : 'Chưa nhập văn bằng'}
                      </span>
                    </div>

                    {/* Chứng chỉ */}
                    <div className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Điều kiện C/C Bồi dưỡng: {candidate.certificates?.length || 0} chứng chỉ</span>
                    </div>

                    {/* Thành tích */}
                    <div className="flex items-start gap-2">
                      {eligibility.missing && eligibility.missing.some(w => w.includes('minh chứng')) ? <XCircle size={14} className="text-rose-500 mt-0.5 shrink-0" /> : <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />}
                      <span className={eligibility.missing && eligibility.missing.some(w => w.includes('minh chứng')) ? 'text-rose-700' : 'text-slate-600'}>
                        Minh chứng Đánh giá CBNV: {candidate.evalMinute ? 'Đã đính kèm' : 'Thiếu minh chứng'}
                      </span>
                    </div>

                    {/* Errors if any */}
                    {eligibility.missing && eligibility.missing.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-rose-600 font-medium">
                        <XCircle size={14} className="mt-0.5 shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* CỘT 2: Personal Radar & Highlights */}
              <div className="lg:col-span-2 space-y-6 flex flex-col">
                
                {/* Radar Chart */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 w-full flex items-center gap-2">
                    <Activity size={16} className="text-indigo-500" /> Hệ tọa độ Năng lực Cá nhân
                  </h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                        <Radar name="Chỉ số cá nhân" dataKey="A" stroke="#3b82f6" fill="#60a5fa" fillOpacity={0.6} />
                        <RechartsTooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Tổng điểm Quy đổi</h4>
                    <div className="text-4xl font-black text-amber-500">{candidate.score || 0}</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Số lượng Minh chứng</h4>
                    <div className="text-4xl font-black text-blue-500">
                      {(candidate.degrees?.length || 0) + (candidate.certificates?.length || 0) + (candidate.achievements?.length || 0) + (candidate.otherAchievements?.length || 0)}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto">
              <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                <Calendar size={20} className="text-blue-500" /> Trục thời gian Sự nghiệp
              </h3>
              
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                {timeline.map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${event.color}`}>
                        <Icon size={10} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{event.year}</span>
                        <h4 className="text-sm font-bold text-slate-800 mt-1">{event.title}</h4>
                      </div>
                    </div>
                  );
                })}
                {timeline.length === 0 && (
                  <p className="text-sm text-slate-500 italic pl-6">Chưa có đủ dữ liệu năm để vẽ trục thời gian.</p>
                )}
                
                <div className="relative pl-6 pt-4">
                  <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center border-2 border-white shadow-sm">
                    <Activity size={10} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Hiện tại</span>
                    <h4 className="text-sm font-bold text-indigo-700 mt-1">Đề nghị thăng {candidate.targetTitle}</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Fallback to raw data view for traditional checking */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">CCCD:</span> <span className="font-medium">{candidate.cccd}</span></div>
                  <div><span className="text-slate-500">Ngày sinh:</span> <span className="font-medium">{candidate.dob}</span></div>
                  <div><span className="text-slate-500">Giới tính:</span> <span className="font-medium">{candidate.gender === 'male' ? 'Nam' : 'Nữ'}</span></div>
                  <div><span className="text-slate-500">Số điện thoại:</span> <span className="font-medium">{candidate.phone}</span></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">Danh sách Thành tích</h3>
                {candidate.achievements?.length > 0 ? (
                  <ul className="space-y-3">
                    {candidate.achievements.map((a, i) => (
                      <li key={i} className="flex flex-col bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-amber-800 text-sm">{a.name || a.id}</span>
                          {a.link && (
                            <a href={a.link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition-colors">
                              <Eye size={12} /> Xem
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-amber-600/80">
                          <span>Quyết định: {a.decisionNumber}</span>
                          <span>Năm: {a.year}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500 italic">Không có thành tích nào.</p>}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">Văn bằng & Chứng chỉ</h3>
                
                <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2">1. Văn bằng chuyên môn</h4>
                {candidate.degrees?.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                    {candidate.degrees.map((d, i) => (
                      <li key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{d.level} - Năm: {d.year}</p>
                          <p className="text-xs text-slate-500">Nơi cấp: {d.issuer}</p>
                        </div>
                        {d.link && (
                          <a href={d.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <Eye size={12}/> Xem
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500 italic mb-4">Chưa cập nhật văn bằng.</p>}

                <h4 className="text-sm font-bold text-slate-700 mb-2">2. Chứng chỉ bồi dưỡng</h4>
                {candidate.certificates?.length > 0 ? (
                  <ul className="space-y-2">
                    {candidate.certificates.map((c, i) => (
                      <li key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{c.name}</p>
                          <p className="text-xs text-slate-500">Năm: {c.year} - Nơi cấp: {c.issuer}</p>
                        </div>
                        {c.link && (
                          <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <Eye size={12}/> Xem
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500 italic">Chưa cập nhật chứng chỉ.</p>}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">Các tài liệu khác (Hồ sơ giấy)</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">Sơ yếu lý lịch (HS02)</span>
                    {candidate.resumeDoc ? (
                      <span className="text-xs flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded"><CheckCircle size={14}/> Đã có</span>
                    ) : <span className="text-xs text-rose-500 italic">Thiếu</span>}
                  </div>
                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">Bản nhận xét đánh giá của thủ trưởng</span>
                    {candidate.reviewDoc ? (
                      <span className="text-xs flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded"><CheckCircle size={14}/> Đã có</span>
                    ) : <span className="text-xs text-rose-500 italic">Thiếu</span>}
                  </div>
                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">Biên bản đánh giá CBNV của Tổ</span>
                    {candidate.evalMinute ? (
                      <span className="text-xs flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded"><CheckCircle size={14}/> Đã có</span>
                    ) : <span className="text-xs text-rose-500 italic">Thiếu</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
