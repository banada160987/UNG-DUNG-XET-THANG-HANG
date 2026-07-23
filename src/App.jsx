import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BatchManager } from './components/BatchManager';
import { DepartmentManager } from './components/DepartmentManager';
import { TeacherManager } from './components/TeacherManager';
import { Dashboard } from './pages/Dashboard';
import { CandidateList } from './pages/CandidateList';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { HeadDashboard } from './pages/HeadDashboard';
import { SecretaryDashboard } from './pages/SecretaryDashboard';
import { ActionHistory } from './components/ActionHistory';
import { AuditLogsViewer } from './components/AuditLogsViewer';
import { SecretaryManager } from './components/SecretaryManager';
import { supabase } from './utils/supabaseClient';
import { verifySessionToken } from './utils/security';

function App() {
  const [session, setSession] = useState(() => {
    const token = sessionStorage.getItem('cbq_session_token');
    return verifySessionToken(token);
  }); // { role, cccd?, department? }
  
  // Admin states
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Chỉ Admin mới cần tải danh sách chung
    if (session?.role === 'admin') {
      if (activeBatchId) fetchAdminCandidates();
      else setCandidates([]);
    }
  }, [activeBatchId, session]);

  const fetchAdminCandidates = async () => {
    setLoading(true);
    // Lấy TẤT CẢ hồ sơ để Admin rà soát, kể cả nháp hay chưa duyệt (để đôn đốc)
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('batch_id', activeBatchId)
      .order('created_at', { ascending: false });
      
    if (!error) setCandidates(data);
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cbq_session_token');
    setSession(null);
  };

  // NẾU CHƯA ĐĂNG NHẬP
  if (!session) {
    return <Login onLogin={setSession} />;
  }

  // NẾU LÀ GIÁO VIÊN
  if (session.role === 'teacher') {
    return <TeacherDashboard cccd={session.cccd} onLogout={handleLogout} />;
  }

  // NẾU LÀ TỔ TRƯỞNG
  if (session.role === 'head') {
    return <HeadDashboard department={session.department} onLogout={handleLogout} />;
  }

  // NẾU LÀ THƯ KÝ
  if (session.role === 'secretary') {
    return <SecretaryDashboard secretaryInfo={session.info} onLogout={handleLogout} />;
  }

  // NẾU LÀ QUẢN TRỊ VIÊN (ADMIN)
  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout}>
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow z-50">
          Đang đồng bộ dữ liệu...
        </div>
      )}
      
      {currentPage === 'settings' ? (
        <div className="space-y-6 pb-10">
          <BatchManager activeBatchId={activeBatchId} onSelectBatch={setActiveBatchId} />
          <DepartmentManager />
          <TeacherManager />
        </div>
      ) : currentPage === 'secretaries' ? (
        <SecretaryManager />
      ) : currentPage === 'history' ? (
        <div className="space-y-6">
          <AuditLogsViewer />
          <ActionHistory />
        </div>
      ) : (
        <>
          <BatchManager activeBatchId={activeBatchId} onSelectBatch={setActiveBatchId} />
          {!activeBatchId ? (
            <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
              Vui lòng tạo hoặc chọn một Đợt xét ở trên để bắt đầu rà soát.
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && <Dashboard candidates={candidates} onRefresh={fetchAdminCandidates} />}
              {currentPage === 'list' && <CandidateList candidates={candidates} onRefresh={fetchAdminCandidates} />}
            </>
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
