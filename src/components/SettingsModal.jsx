import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { ACHIEVEMENT_LEVELS } from '../data/config';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings, loading } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

    const handleChange = (id, value) => {
      setLocalSettings(prev => ({
        ...prev,
        [id]: (['use_scoring', 'allow_direct_to_secretary', 'allow_submit_to_head', 'show_teacher_stats', 'show_teacher_ranking'].includes(id)) ? value : parseFloat(value) || 0
      }));
    };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const result = await updateSettings(localSettings);
    if (result.success) {
      setMessage('Lưu cấu hình thành công!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setMessage('Lỗi khi lưu cấu hình.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Cấu hình Điểm số</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex gap-3 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>Cấu hình này sẽ được áp dụng cho toàn bộ quá trình tính điểm tổng của giáo viên trong đợt xét thăng hạng.</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={localSettings['use_scoring'] !== false} // Default true
                    onChange={(e) => handleChange('use_scoring', e.target.checked)}
                    className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 peer"
                  />
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Sử dụng tính năng chấm điểm</div>
                    <div className="text-sm text-slate-500 mt-0.5">Hiển thị điểm số, xếp hạng và Bàn cân dựa trên cấu hình điểm bên dưới. Nếu tắt, hệ thống chỉ xét duyệt theo thứ tự ưu tiên cơ bản.</div>
                  </div>
                </label>
              </div>

              {localSettings['use_scoring'] !== false && (
                <>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">Điểm Thành tích / Danh hiệu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ACHIEVEMENT_LEVELS.map(ach => (
                        <div key={ach.id} className="flex flex-col">
                          <label className="text-sm text-slate-600 mb-1 line-clamp-1" title={ach.name}>{ach.name}</label>
                          <input 
                            type="number" 
                            value={localSettings[ach.id] !== undefined ? localSettings[ach.id] : ''}
                            onChange={(e) => handleChange(ach.id, e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập điểm..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">Các cấu hình khác</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-sm text-slate-600 mb-1">Điểm thâm niên (mỗi năm)</label>
                        <input 
                          type="number" 
                          value={localSettings['seniority_per_year'] !== undefined ? localSettings['seniority_per_year'] : ''}
                          onChange={(e) => handleChange('seniority_per_year', e.target.value)}
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200 justify-center">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={localSettings['allow_submit_to_head'] !== false} // Default true
                            onChange={(e) => handleChange('allow_submit_to_head', e.target.checked)}
                            className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 peer"
                          />
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Cho phép GV nộp Tổ trưởng</div>
                            <div className="text-xs text-slate-500 mt-0.5">Hiển thị nút cho phép GV nộp hồ sơ lên Tổ trưởng/BM.</div>
                          </div>
                        </label>
                      </div>

                      <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200 justify-center">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={localSettings['allow_direct_to_secretary'] === true}
                            onChange={(e) => handleChange('allow_direct_to_secretary', e.target.checked)}
                            className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 peer"
                          />
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Cho phép GV nộp thẳng Thư ký</div>
                            <div className="text-xs text-slate-500 mt-0.5">Hiển thị nút cho phép GV nộp hồ sơ bỏ qua Tổ trưởng.</div>
                          </div>
                        </label>
                      </div>

                      <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200 justify-center">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={localSettings['show_teacher_stats'] !== false}
                            onChange={(e) => handleChange('show_teacher_stats', e.target.checked)}
                            className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 peer"
                          />
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Hiển thị thống kê cho Giáo viên</div>
                            <div className="text-xs text-slate-500 mt-0.5">Cho phép GV xem số lượng thành tích trên bảng điều khiển.</div>
                          </div>
                        </label>
                      </div>

                      <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200 justify-center">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={localSettings['show_teacher_ranking'] === true}
                            onChange={(e) => handleChange('show_teacher_ranking', e.target.checked)}
                            className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 peer"
                          />
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Hiển thị Xếp hạng cho Giáo viên</div>
                            <div className="text-xs text-slate-500 mt-0.5">Cho phép GV xem hạng ưu tiên của họ trong đợt xét.</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50 rounded-b-xl">
          <span className={`text-sm font-medium ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
            >
              Hủy
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-70"
            >
              <Save size={18} />
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
