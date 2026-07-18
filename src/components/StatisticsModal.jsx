import React, { useMemo, useState } from 'react';
import { X, BarChart2, Award, FileText, CheckCircle, Clock, Download } from 'lucide-react';
import { exportDetailedStatsWord } from '../utils/exportDetailedStats';
import { ACHIEVEMENT_LEVELS } from '../data/config';

export const StatisticsModal = ({ candidates, onClose, unitName }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const stats = useMemo(() => {
    const total = candidates.length;
    const evaluated = candidates.filter(c => c.status === 'admin_approved' || c.status === 'admin_rejected').length;
    const pending = total - evaluated;
    
    let males = 0;
    let females = 0;
    
    // Đếm thành tích chuẩn
    const officialCount = {};
    ACHIEVEMENT_LEVELS.forEach(lvl => {
      officialCount[lvl.id] = { count: 0, users: [] };
    });

    const otherStats = {
      skkn: { name: 'Sáng kiến kinh nghiệm', count: 0, users: [] },
      gvcng: { name: 'Giáo viên chủ nhiệm giỏi', count: 0, users: [] },
      gvdg: { name: 'Giáo viên dạy giỏi', count: 0, users: [] },
      ht_khen: { name: 'Hiệu trưởng khen', count: 0, users: [] },
      cd_nganh: { name: 'Công đoàn ngành khen', count: 0, users: [] },
      td_bmt: { name: 'Thành đoàn BMT khen', count: 0, users: [] },
      cd_truong: { name: 'Công đoàn trường khen', count: 0, users: [] },
      dt_khen: { name: 'Đoàn trường khen', count: 0, users: [] },
    };

    // Danh sách thành tích khác
    const otherAchs = [];

    candidates.forEach(c => {
      if (c.gender === 'Nam') males++;
      else if (c.gender === 'Nữ') females++;

      const processAchText = (ach) => {
        const text = typeof ach === 'string' ? ach : (ach.id || ach.name || '');
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('sáng kiến') || lowerText.includes('skkn')) {
          otherStats.skkn.count++;
          otherStats.skkn.users.push(c.fullName);
        } else if (lowerText.includes('chủ nhiệm') || lowerText.includes('gvcng')) {
          otherStats.gvcng.count++;
          otherStats.gvcng.users.push(c.fullName);
        } else if (lowerText.includes('dạy giỏi') || lowerText.includes('gvdg')) {
          otherStats.gvdg.count++;
          otherStats.gvdg.users.push(c.fullName);
        } else if (lowerText.includes('hiệu trưởng') || lowerText.includes('ht khen')) {
          otherStats.ht_khen.count++;
          otherStats.ht_khen.users.push(c.fullName);
        } else if (lowerText.includes('công đoàn ngành') || lowerText.includes('cđ ngành')) {
          otherStats.cd_nganh.count++;
          otherStats.cd_nganh.users.push(c.fullName);
        } else if (lowerText.includes('công đoàn trường') || lowerText.includes('cđ trường') || lowerText.includes('công đoàn')) {
           if (lowerText.includes('ngành')) {
             otherStats.cd_nganh.count++;
             otherStats.cd_nganh.users.push(c.fullName);
           } else {
             otherStats.cd_truong.count++;
             otherStats.cd_truong.users.push(c.fullName);
           }
        } else if (lowerText.includes('thành đoàn') || lowerText.includes('bmt')) {
          otherStats.td_bmt.count++;
          otherStats.td_bmt.users.push(c.fullName);
        } else if (lowerText.includes('đoàn trường') || lowerText.includes('đtn trường') || lowerText.includes('đoàn thanh niên')) {
          otherStats.dt_khen.count++;
          otherStats.dt_khen.users.push(c.fullName);
        } else {
          otherAchs.push({
            name: c.fullName,
            unit: c.unit,
            achName: ach.id || ach.name,
            decisionNo: ach.decisionNo
          });
        }
      };

      if (c.achievements) {
        c.achievements.forEach(ach => {
          if (officialCount[ach.id] !== undefined) {
            officialCount[ach.id].count++;
            officialCount[ach.id].users.push(c.fullName);
          } else {
            processAchText(ach);
          }
        });
      }

      if (c.otherAchievements) {
        c.otherAchievements.forEach(processAchText);
      }
    });

    return {
      total, evaluated, pending, males, females, officialCount, otherStats, otherAchs
    };
  }, [candidates]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <BarChart2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Thống kê Thành tích Chi tiết</h2>
              <p className="text-sm text-slate-500">Dữ liệu tổng hợp từ {stats.total} hồ sơ {unitName ? `- ${unitName}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                setIsExporting(true);
                await exportDetailedStatsWord(stats, unitName);
                setIsExporting(false);
              }}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Download size={18} />
              {isExporting ? 'Đang xuất...' : 'Xuất Word'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-sm font-medium mb-1">Tổng hồ sơ</div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-sm font-medium mb-1">Đã duyệt</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.evaluated}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-sm font-medium mb-1">Chờ duyệt</div>
              <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-sm font-medium mb-1">Tỷ lệ Nữ</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.females / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Award size={18} className="text-blue-500" />
              <h3 className="font-semibold text-slate-800">Thống kê Danh hiệu & Thành tích chuẩn (Mục VI)</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-5 font-medium">Tên Danh hiệu / Thành tích</th>
                    <th className="py-3 px-5 font-medium w-32 text-center">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ACHIEVEMENT_LEVELS.map(lvl => {
                    const data = stats.officialCount[lvl.id];
                    if (data.count === 0) return null; // Chỉ hiển thị các thành tích có người đạt
                    return (
                      <tr key={lvl.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-5 text-slate-800">
                          <div className="font-medium">{lvl.name}</div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                            {(() => {
                              const userCounts = {};
                              data.users.forEach(u => {
                                userCounts[u] = (userCounts[u] || 0) + 1;
                              });
                              return Object.entries(userCounts).map(([u, c], i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                                  {u} {c > 1 ? `(${c})` : ''}
                                </span>
                              ));
                            })()}
                          </div>
                        </td>
                        <td className="py-3 px-5 text-center align-top">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold mt-0.5">
                            {data.count}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {Object.values(stats.officialCount).every(v => v.count === 0) && (
                    <tr>
                      <td colSpan="2" className="py-8 text-center text-slate-500 italic">
                        Chưa có dữ liệu thành tích chuẩn nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Award size={18} className="text-purple-500" />
              <h3 className="font-semibold text-slate-800">Thống kê Danh hiệu & Thành tích bổ sung</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-5 font-medium">Tên thành tích</th>
                    <th className="py-3 px-5 font-medium text-center w-24">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(stats.otherStats).filter(([_, data]) => data.count > 0).map(([key, data]) => {
                    return (
                      <tr key={key} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-5 text-slate-700">
                          <span className="font-medium text-slate-800 block mb-1">{data.name}</span>
                          {data.users.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(() => {
                                const userCounts = {};
                                data.users.forEach(u => {
                                  userCounts[u] = (userCounts[u] || 0) + 1;
                                });
                                return Object.entries(userCounts).map(([u, c], i) => (
                                  <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                    {u} {c > 1 ? `(${c})` : ''}
                                  </span>
                                ));
                              })()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-5 text-center align-top">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold mt-0.5">
                            {data.count}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {Object.values(stats.otherStats).every(v => v.count === 0) && (
                    <tr>
                      <td colSpan="2" className="py-8 text-center text-slate-500 italic">
                        Chưa có thành tích bổ sung nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <FileText size={18} className="text-amber-500" />
              <h3 className="font-semibold text-slate-800">Chi tiết Thành tích Khác (Mục VIII)</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-5 font-medium w-48">Họ và tên</th>
                    <th className="py-3 px-5 font-medium">Tên thành tích</th>
                    <th className="py-3 px-5 font-medium w-40">Số QĐ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.otherAchs.map((ach, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 text-slate-800">
                        <div className="font-medium">{ach.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{ach.unit}</div>
                      </td>
                      <td className="py-3 px-5 text-slate-700">{ach.achName}</td>
                      <td className="py-3 px-5 text-slate-600">{ach.decisionNo}</td>
                    </tr>
                  ))}
                  {stats.otherAchs.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-slate-500 italic">
                        Không có thành tích khác nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
