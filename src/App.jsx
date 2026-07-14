import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CandidateList } from './pages/CandidateList';
import { CandidateForm } from './pages/CandidateForm';
import { useLocalStorage } from './utils/storage';

function App() {
  const [currentPage, setCurrentPage] = useState('list');
  const [candidates, setCandidates] = useLocalStorage('candidates_db', []);
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (id) => {
    setEditingId(id);
    setCurrentPage('add');
  };

  const handleSave = (data) => {
    if (data.id) {
      // Cập nhật
      setCandidates(candidates.map(c => c.id === data.id ? data : c));
    } else {
      // Thêm mới
      setCandidates([...candidates, { ...data, id: Date.now().toString() }]);
    }
    setCurrentPage('list');
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={(page) => {
      setCurrentPage(page);
      if (page !== 'add') setEditingId(null);
    }}>
      {currentPage === 'dashboard' && (
        <Dashboard candidates={candidates} />
      )}
      {currentPage === 'list' && (
        <CandidateList 
          candidates={candidates} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {currentPage === 'add' && (
        <CandidateForm 
          onSave={handleSave} 
          onCancel={() => setCurrentPage('list')}
          initialData={candidates.find(c => c.id === editingId)}
        />
      )}
    </Layout>
  );
}

export default App;
