import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CandidateForm } from './CandidateForm';
import { StatusBadge } from '../components/StatusBadge';
import { AlertCircle, FileCheck, Search, Download, PenTool, HelpCircle, Award, BarChart2 } from 'lucide-react';
import { exportCandidateToWord } from '../utils/exportWord';
import { exportDetailedChecklistWord } from '../utils/exportDetailedChecklistWord';
import { calculateTotalScore, rankCandidates } from '../utils/ranking';
import { SignatureModal } from '../components/SignatureModal';
import { UserGuideModal } from '../components/UserGuideModal';
import { showAlert } from '../utils/alert';
import { useSettings } from '../contexts/SettingsContext';
import confetti from 'canvas-confetti';

export const TeacherDashboard = ({ cccd, onLogout }) => {
  const { settings } = useSettings();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [signature, setSignature] = useState(localStorage.getItem(`signature_${cccd}`) || null);
  const [teacherRank, setTeacherRank] = useState(null);
  const [totalRanked, setTotalRanked] = useState(null);
  const [stats, setStats] = useState({ totalAchievements: 0, score: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (candidate && settings) {
      // Calculate Stats
      let totalAchs = 0;
      if (candidate.achievements && Array.isArray(candidate.achievements)) {
        totalAchs += candidate.achievements.length;
      }
      if (candidate.otherAchievements && Array.isArray(candidate.otherAchievements)) {
        totalAchs += candidate.otherAchievements.length;
      }
      const score = calculateTotalScore(candidate, settings);
      setStats({ totalAchievements: totalAchs, score });

      // Calculate Rank if needed
      const calculateRank = async () => {
        if (settings.show_teacher_ranking && activeBatchId && ['admin_approved', 'ranked', 'finalized'].includes(candidate.status)) {
          const { data: allCands } = await supabase.from('candidates')
            .select('id, dob, gender, ethnicity, decisionRecruitment, decisionProbation, achievements')
            .eq('batch_id', activeBatchId)
            .in('status', ['admin_approved', 'ranked', 'finalized']);
            
          if (allCands) {
            const withScore = allCands.map(c => ({ ...c, score: calculateTotalScore(c, settings) }));
            if (settings.use_scoring !== false) {
              withScore.sort((a, b) => b.score - a.score);
            } else {
              withScore.sort(rankCandidates);
            }
            const rankIndex = withScore.findIndex(c => c.id === candidate.id);
            if (rankIndex !== -1) {
              setTeacherRank(rankIndex + 1);
              setTotalRanked(withScore.length);
            }
          }
        }
      };
      
      calculateRank();
    }
  }, [candidate, settings, activeBatchId]);

  const loadData = async () => {
    setLoading(true);
    const { data: batches } = await supabase.from('batches').select('*').eq('isActive', true).order('created_at', { ascending: false }).limit(1);
    
    if (!batches || batches.length === 0) {
      showAlert('Thông báo', "Hiện tại không có đợt xét nào đang mở.");
      setLoading(false);
      return;
    }
    
    const batch = batches[0];
    setActiveBatch(batch);
    setActiveBatchId(batch.id);

    const { data: cands } = await supabase.from('candidates').select('*').eq('batch_id', batch.id).eq('cccd', cccd);
    
    if (cands && cands.length > 0) {
      setCandidate(cands[0]);
    }
    
    setLoading(false);
  };

  const saveCandidate = async (formData, newStatus) => {
    setLoading(true);
    const payload = { ...formData, batch_id: activeBatchId, status: newStatus };
    
    if (candidate && candidate.id) {
      const { error } = await supabase.from('candidates').update(payload).eq('id', candidate.id);
      if (error) showAlert('Thông báo', 'Lỗi cập nhật');
    } else {
      const { error } = await supabase.from('candidates').insert([payload]);
      if (error) showAlert('Thông báo', 'Lỗi nộp hồ sơ');
    }
    
    await loadData();
    if(newStatus === 'draft') {
      showAlert('Thông báo', 'Đã lưu nháp thành công!');
    } else {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
      showAlert('Chúc mừng!', 'Đã nộp hồ sơ cho Tổ trưởng thành công!');
    }
  };

  const handleSaveDraft = async (formData) => {
    await saveCandidate(formData, 'draft');
  };

  const handleSubmitToHead = async (formData) => {
    const newStatus = 'submitted_to_head'; // Luôn nộp cho tổ trưởng
    await saveCandidate(formData, newStatus);
  };

  const handleSubmitToSecretary = (formData) => {
    saveCandidate(formData, 'head_approved');
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  const isPastDeadline = activeBatch && activeBatch.deadline && new Date() > new Date(activeBatch.deadline.includes('T') ? activeBatch.deadline : `${activeBatch.deadline}T23:59:59`);
  const isReadOnly = (candidate && !['draft', 'head_rejected', 'returned', 'admin_rejected'].includes(candidate.status)) || isPastDeadline;

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5 font-medium">Hệ thống Xét thăng hạng viên chức | Trường THPT Cao Bá Quát - Phường Tân An - Tỉnh Đắk Lắk</p>
            <h2 className="text-xl font-bold text-slate-800">
              Hồ sơ xét Thăng hạng
            </h2>
          </div>
          {candidate && <StatusBadge status={candidate.status} />}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 shadow-sm font-medium border border-blue-200"
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle size={16} />
            Hướng dẫn
          </button>
          {candidate && (
            <>
              <button 
                onClick={() => setShowSignature(true)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg shadow-sm font-medium border ${signature ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-700 border-slate-300'}`}
                title="Tạo chữ ký điện tử"
              >
                <PenTool size={16} />
                {signature ? 'Đã có chữ ký' : 'Tạo chữ ký'}
              </button>
              <button 
                onClick={() => exportCandidateToWord(candidate, signature)} 
                className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 shadow-sm font-medium"
                title="Tải Danh mục hồ sơ bản Word (Mẫu cũ)"
              >
                <Download size={16} />
                Xuất File Word (Mẫu cũ)
              </button>
              <button 
                onClick={() => exportDetailedChecklistWord(candidate)} 
                className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 shadow-sm font-medium"
                title="Tải Danh mục và Bìa bản Word (Mẫu mới)"
              >
                <Download size={16} />
                Xuất Danh Mục
              </button>
            </>
          )}
          <span className="text-sm font-medium text-slate-600">CCCD: {cccd}</span>
          <button onClick={onLogout} className="text-sm text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-medium">
            Thoát
          </button>
        </div>
      </header>

      {isPastDeadline && (
        <div className="max-w-4xl mx-auto mt-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertCircle size={32} className="shrink-0 mt-1" />
            <div>
              <div className="font-bold">Đã hết hạn nộp/sửa hồ sơ</div>
              <div className="text-sm">Đợt xét này đã kết thúc thời gian tiếp nhận vào {activeBatch.deadline.includes('T') ? new Date(activeBatch.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '23h59'} ngày {new Date(activeBatch.deadline).toLocaleDateString('vi-VN')}. Bạn chỉ có thể xem lại thông tin.</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {!activeBatchId ? (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-lg border border-amber-200 text-center">
            Hiện tại không có đợt xét nào đang mở. Vui lòng quay lại sau.
          </div>
        ) : (
          <>
            {(settings?.show_teacher_stats !== false || settings?.show_teacher_ranking === true) && candidate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {settings?.show_teacher_stats !== false && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <BarChart2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Thống kê hồ sơ</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-slate-800">{stats.totalAchievements} <span className="text-sm font-normal text-slate-500">thành tích</span></p>
                        {settings?.use_scoring !== false && (
                          <p className="text-sm font-medium text-emerald-600 mb-1">({stats.score} điểm)</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {settings?.show_teacher_ranking === true && ['admin_approved', 'ranked', 'finalized'].includes(candidate.status) && teacherRank !== null && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Vị thứ xét duyệt ưu tiên</p>
                      <p className="text-2xl font-bold text-slate-800">
                        Hạng {teacherRank} <span className="text-sm font-normal text-slate-500">/ {totalRanked}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {candidate?.status === 'head_rejected' && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg mb-6 flex items-start gap-3 shadow-sm">
                <AlertCircle className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Yêu cầu bổ sung hồ sơ</p>
                  <p className="text-sm mt-1">Tổ trưởng đã xem qua và yêu cầu bạn cập nhật lại thông tin. Vui lòng sửa lại các mục bị thiếu và nhấn nút "Nộp cho Tổ trưởng" để gửi lại.</p>
                </div>
              </div>
            )}

            {['admin_rejected', 'returned'].includes(candidate?.status) && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg mb-6 flex items-start gap-3 shadow-sm">
                <AlertCircle className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Yêu cầu bổ sung hồ sơ (Từ Thư ký/Ban Giám Hiệu)</p>
                  <p className="text-sm mt-1">Hồ sơ của bạn cần được bổ sung hoặc chỉnh sửa. Vui lòng xem chi tiết lỗi đánh dấu ở từng mục bên dưới, chỉnh sửa và nộp lại.</p>
                </div>
              </div>
            )}
            
            {candidate?.status === 'admin_reviewing' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6 flex items-center gap-3 shadow-sm">
                <Search className="shrink-0" />
                <div>
                  <p className="font-bold">Hồ sơ đang được rà soát</p>
                  <p className="text-sm">Tổ rà soát cấp Trường đang tiến hành thẩm định hồ sơ của bạn. Không thể sửa đổi thông tin lúc này.</p>
                </div>
              </div>
            )}
            
            {(candidate?.status === 'admin_approved' || candidate?.status === 'ranked' || candidate?.status === 'finalized') && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg mb-6 flex items-center gap-3 shadow-sm">
                <FileCheck className="shrink-0" />
                <div>
                  <p className="font-bold">Hồ sơ đã Đủ điều kiện</p>
                  <p className="text-sm">Chúc mừng, hồ sơ của bạn đã vượt qua khâu rà soát cấp Trường.</p>
                </div>
              </div>
            )}

            {!isReadOnly && !candidate?.status && (
               <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6 text-sm">
                 Hãy điền thông tin bên dưới. Bạn có thể nhấn <b>Lưu nháp</b> để lưu tạm và <b>Nộp cho Tổ trưởng</b> khi đã hoàn tất.
               </div>
            )}
            
            <CandidateForm 
              initialData={candidate} 
              fixedCccd={cccd} 
              onSave={handleSaveDraft}
              onSubmitToHead={handleSubmitToHead}
              onSubmitToSecretary={settings?.allow_direct_to_secretary ? handleSubmitToSecretary : undefined}
              allowSubmitToHead={settings?.allow_submit_to_head !== false}
              isReadOnly={isReadOnly}
            />
          </>
        )}
      </div>

      {showSignature && (
        <SignatureModal 
          cccd={cccd} 
          onSave={(sig) => {
            setSignature(sig);
            localStorage.setItem(`signature_${cccd}`, sig);
          }} 
          onClose={() => setShowSignature(false)} 
        />
      )}
      {showGuide && (
        <UserGuideModal role="teacher" onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
};
