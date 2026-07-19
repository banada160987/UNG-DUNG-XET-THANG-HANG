import React, { useMemo, useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend
} from 'recharts';
import { Trophy, Medal, Star, Shield, Award, Lightbulb, GraduationCap, Target, Users, BookOpen, Clock, AlertTriangle, FileText, CheckCircle, Activity, Sparkles, Eye } from 'lucide-react';
import { ACHIEVEMENT_LEVELS } from '../data/config';

// Logic cấp danh hiệu
export const getBadges = (candidate) => {
  const badges = [];
  
  // 1. Học giả (Thạc sĩ, Tiến sĩ)
  const hasHighDegree = candidate.degrees?.some(d => d.level.toLowerCase().includes('thạc sĩ') || d.level.toLowerCase().includes('tiến sĩ'));
  if (hasHighDegree) badges.push({ id: 'hoc_gia', name: 'Học giả', icon: GraduationCap, color: 'bg-purple-100 text-purple-700' });

  // 2. Cây sáng kiến (Từ 2 sáng kiến/Nghiên cứu trở lên)
  const numInitiatives = candidate.otherAchievements?.filter(a => a.name?.toLowerCase().includes('sáng kiến') || a.name?.toLowerCase().includes('nghiên cứu')).length || 0;
  if (numInitiatives >= 2) badges.push({ id: 'cay_sang_kien', name: 'Cây sáng kiến', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700' });

  // 3. Bậc thầy thi đua (Từ 3 bằng khen/CSTĐ trở lên)
  const numAwards = candidate.achievements?.length || 0;
  if (numAwards >= 3) badges.push({ id: 'bac_thay_thi_dua', name: 'Bậc thầy thi đua', icon: Trophy, color: 'bg-red-100 text-red-700' });

  // 4. Bàn tay vàng CNTT (Có chứng chỉ/bồi dưỡng CNTT)
  const hasIT = candidate.certificates?.some(c => c.name?.toLowerCase().includes('tin học') || c.name?.toLowerCase().includes('cntt'));
  if (hasIT) badges.push({ id: 'tien_phong_cntt', name: 'Tiên phong CNTT', icon: Activity, color: 'bg-cyan-100 text-cyan-700' });

  // 5. Người đa tài (Có thành tích ở cả Bằng khen, Sáng kiến, Bằng cấp)
  if (numAwards > 0 && numInitiatives > 0 && candidate.degrees?.length > 0) {
    badges.push({ id: 'nguoi_da_tai', name: 'Người đa tài', icon: Star, color: 'bg-indigo-100 text-indigo-700' });
  }

  // 6. Cán bộ mẫu mực (Có thành tích Đảng/Đoàn thể)
  const hasParty = candidate.otherAchievements?.some(a => a.name?.toLowerCase().includes('đảng') || a.name?.toLowerCase().includes('đoàn') || a.name?.toLowerCase().includes('công đoàn'));
  if (hasParty) badges.push({ id: 'mau_muc', name: 'Gương mẫu mực', icon: Shield, color: 'bg-rose-100 text-rose-700' });

  return badges;
};

export const DepartmentInsights = ({ department, candidates, quota = 0 }) => {
  const [showMissing, setShowMissing] = useState(false);

  // 1. Dữ liệu Tổng quan & Progress
  const total = candidates.length;
  const submittedCount = candidates.filter(c => c.status !== 'draft').length;
  const approvedCount = candidates.filter(c => ['head_approved', 'admin_reviewing', 'admin_approved', 'ranked', 'finalized'].includes(c.status)).length;
  const returnedCount = candidates.filter(c => c.status === 'head_rejected' || c.status === 'returned').length;
  const missingCount = candidates.filter(c => c.status === 'draft').length;
  const progressPercent = total === 0 ? 0 : Math.round((approvedCount / total) * 100);

  // 2. Dữ liệu Radar Chart
  const radarData = useMemo(() => {
    let thiDua = 0, sangKien = 0, chuyenMon = 0, boiDuong = 0, khac = 0;
    candidates.forEach(c => {
      thiDua += (c.achievements?.length || 0);
      c.otherAchievements?.forEach(a => {
        if (a.name?.toLowerCase().includes('sáng kiến')) sangKien++;
        else khac++;
      });
      chuyenMon += (c.degrees?.length || 0);
      boiDuong += (c.certificates?.length || 0);
    });
    return [
      { subject: 'Thi đua khen thưởng', A: thiDua, fullMark: Math.max(thiDua, 10) },
      { subject: 'Sáng kiến KN', A: sangKien, fullMark: Math.max(sangKien, 10) },
      { subject: 'Năng lực Chuyên môn', A: chuyenMon, fullMark: Math.max(chuyenMon, 10) },
      { subject: 'Bồi dưỡng / CC', A: boiDuong, fullMark: Math.max(boiDuong, 10) },
      { subject: 'Hoạt động khác', A: khac, fullMark: Math.max(khac, 10) },
    ];
  }, [candidates]);

  // 3. Dữ liệu Top 3 Podium
  const top3 = useMemo(() => {
    return [...candidates].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);
  }, [candidates]);

  // 4. Dự đoán Chỉ tiêu (Top N)
  const topQuota = useMemo(() => {
    return [...candidates]
      .filter(c => ['head_approved', 'admin_reviewing', 'admin_approved', 'ranked', 'finalized'].includes(c.status))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [candidates]);

  // 5. Cây thành tích
  const achievementTree = useMemo(() => {
    const counts = {};
    candidates.forEach(c => {
      c.achievements?.forEach(a => {
        const official = ACHIEVEMENT_LEVELS.find(l => l.id === a.id);
        const name = official ? official.name : a.id;
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.replace('Danh hiệu ', '').replace('Bằng khen của ', 'BK '), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Lấy top 5 loại thành tích
  }, [candidates]);

  // Render Podium
  const renderPodiumItem = (cand, rank) => {
    if (!cand) return <div className="flex-1"></div>;
    const isFirst = rank === 1;
    const height = isFirst ? 'h-32' : rank === 2 ? 'h-24' : 'h-16';
    const bgClass = isFirst ? 'bg-gradient-to-t from-amber-200 to-amber-100 border-amber-300' : 
                    rank === 2 ? 'bg-gradient-to-t from-slate-200 to-slate-100 border-slate-300' : 
                    'bg-gradient-to-t from-orange-200 to-orange-100 border-orange-300';
    const textColor = isFirst ? 'text-amber-600' : rank === 2 ? 'text-slate-600' : 'text-orange-600';
    const Icon = isFirst ? Trophy : Medal;

    return (
      <div className="flex flex-col items-center justify-end flex-1 px-1">
        <div className="text-center mb-2">
          <div className={`mx-auto bg-white shadow-sm p-1.5 rounded-full w-10 h-10 flex items-center justify-center mb-1 ${textColor}`}>
            <Icon size={20} />
          </div>
          <div className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1" title={cand.fullName}>{cand.fullName}</div>
          <div className="text-[10px] text-slate-500">{cand.score} điểm</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{cand.achievements?.length || 0} thành tích</div>
        </div>
        <div className={`w-full ${bgClass} ${height} rounded-t-lg border-t-4 shadow-inner relative flex justify-center`}>
          <span className={`absolute top-2 font-black text-2xl opacity-30 ${textColor}`}>{rank}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-amber-500" size={24} />
        <h2 className="text-xl font-bold text-slate-800">Bức Tranh Tổ Chuyên Môn - {department}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT 1: Tổng quan & Bục vinh quang */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tổng quan */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Tiến độ hồ sơ
            </h3>
            
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-3xl font-black text-slate-800">{progressPercent}%</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Hoàn thành</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-600">{approvedCount}/{total}</div>
                <div className="text-[10px] text-slate-500">Đã chốt / Tổng số</div>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                <div className="text-xl font-bold">{approvedCount}</div>
                <div className="text-xs font-medium">Đủ ĐK</div>
              </div>
              <div className="bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-100 cursor-pointer hover:bg-rose-100" onClick={() => setShowMissing(!showMissing)}>
                <div className="text-xl font-bold">{missingCount + returnedCount}</div>
                <div className="text-xs font-medium flex items-center gap-1">Chưa đạt <Eye size={12}/></div>
              </div>
            </div>

            {showMissing && (missingCount + returnedCount > 0) && (
              <div className="mt-3 p-3 bg-white border border-rose-200 rounded-lg shadow-inner max-h-40 overflow-y-auto">
                <div className="text-xs font-bold text-rose-700 mb-2">Giáo viên chưa hoàn thiện:</div>
                <ul className="text-xs space-y-1">
                  {candidates.filter(c => c.status === 'draft' || c.status === 'head_rejected' || c.status === 'returned').map(c => (
                    <li key={c.id} className="flex items-center gap-1 text-slate-600">
                      <AlertTriangle size={10} className="text-rose-500" />
                      <span className="truncate">{c.fullName}</span>
                      <span className="text-rose-500 italic ml-auto">({c.status === 'draft' ? 'Chưa khai' : 'Cần sửa'})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bục vinh quang */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Award size={16} className="text-amber-500" /> Ngôi sao của Tổ
            </h3>
            <div className="flex items-end justify-center h-48 mt-8">
              {renderPodiumItem(top3[1], 2)}
              {renderPodiumItem(top3[0], 1)}
              {renderPodiumItem(top3[2], 3)}
            </div>
          </div>
        </div>

        {/* CỘT 2: Radar Chart & Phân bố thành tích */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            
            {/* Radar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Target size={16} className="text-indigo-500" /> Năng lực Cốt lõi
              </h3>
              <p className="text-xs text-slate-500 mb-4">Biểu đồ mạng nhện phân tích điểm mạnh của toàn bộ giáo viên trong tổ.</p>
              <div className="flex-1 min-h-[250px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar name="Chỉ số" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                    <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cây thành tích & Dự đoán chỉ tiêu */}
            <div className="space-y-6 flex flex-col">
              
              {/* Dự đoán chỉ tiêu */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={16} className="text-emerald-500" /> Khả năng Đạt chỉ tiêu
                </h3>
                <div className="text-xs bg-slate-50 p-2 rounded mb-3 flex justify-between items-center">
                  <span className="text-slate-600">Chỉ tiêu đề nghị:</span>
                  <span className="font-bold text-lg text-emerald-600">{quota > 0 ? quota : 'Chưa định mức'}</span>
                </div>
                
                {quota > 0 ? (
                  <div className="space-y-2">
                    {topQuota.slice(0, quota + 2).map((c, idx) => {
                      const isTop = idx < quota;
                      return (
                        <div key={c.id} className={`flex items-center justify-between p-2 rounded text-xs border ${isTop ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          <div className="flex items-center gap-2 truncate">
                            <span className={`font-bold w-5 text-center ${isTop ? 'text-emerald-600' : 'text-slate-400'}`}>
                              #{idx + 1}
                            </span>
                            <span className="truncate">{c.fullName}</span>
                          </div>
                          <div className="font-bold whitespace-nowrap ml-2">{c.score} đ</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Ban giám hiệu chưa cấu hình chỉ tiêu cho đợt này.</p>
                )}
              </div>

              {/* Cây thành tích Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-orange-500" /> Phân bố Thành tích
                </h3>
                {achievementTree.length > 0 ? (
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={achievementTree} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                        <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="count" fill="#fb923c" radius={[0, 4, 4, 0]} barSize={12}>
                          {achievementTree.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#fb923c', '#38bdf8', '#a78bfa', '#34d399', '#fb7185'][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic flex h-full items-center justify-center">Chưa có dữ liệu thành tích.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
