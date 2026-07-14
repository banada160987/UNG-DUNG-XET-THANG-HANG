import React, { useState } from 'react';
import { ACHIEVEMENT_LEVELS, TARGET_TITLES } from '../data/config';
import { Save, X, Plus, Trash2 } from 'lucide-react';

export const CandidateForm = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    fullName: '',
    dob: '',
    gender: 'Nam',
    ethnicity: 'Kinh',
    unit: '',
    currentTitle: '',
    targetTitle: 'Hạng II',
    dateRecruitment: '',
    dateProbationEnd: '',
    dateAppointment: '',
    dateSalaryRaise: '',
    degreeBachelor: false,
    degreeMaster: false,
    degreePhD: false,
    degreeOther: false,
    certIT: false,
    certLanguage: false,
    reviewDoc: false,
    achievements: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [
        ...formData.achievements,
        { id: 'cstd_co_so', year: new Date().getFullYear(), type: 'cá nhân', decisionNo: '' }
      ]
    });
  };

  const updateAchievement = (index, field, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index][field] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const removeAchievement = (index) => {
    const newAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: newAchievements });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      {/* 1. Thông tin cá nhân */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-slate-800">1. Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Họ tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
          <Input label="Ngày sinh" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Giới tính</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          
          <Input label="Dân tộc" name="ethnicity" value={formData.ethnicity} onChange={handleChange} />
          <Input label="Đơn vị công tác" name="unit" value={formData.unit} onChange={handleChange} required />
          <Input label="Chức danh hiện giữ" name="currentTitle" value={formData.currentTitle} onChange={handleChange} required />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Chức danh đăng ký xét</label>
            <select name="targetTitle" value={formData.targetTitle} onChange={handleChange} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
              {TARGET_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* 2. Thông tin công tác */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-slate-800">2. Thông tin công tác & Văn bằng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input label="Ngày tuyển dụng" name="dateRecruitment" type="date" value={formData.dateRecruitment} onChange={handleChange} />
          <Input label="Ngày hết tập sự" name="dateProbationEnd" type="date" value={formData.dateProbationEnd} onChange={handleChange} />
          <Input label="Ngày bổ nhiệm hạng" name="dateAppointment" type="date" value={formData.dateAppointment} onChange={handleChange} />
          <Input label="Ngày nâng lương gần nhất" name="dateSalaryRaise" type="date" value={formData.dateSalaryRaise} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Văn bằng</h4>
            <Checkbox label="Đại học" name="degreeBachelor" checked={formData.degreeBachelor} onChange={handleChange} />
            <Checkbox label="Thạc sĩ" name="degreeMaster" checked={formData.degreeMaster} onChange={handleChange} />
            <Checkbox label="Tiến sĩ" name="degreePhD" checked={formData.degreePhD} onChange={handleChange} />
            <Checkbox label="Khác" name="degreeOther" checked={formData.degreeOther} onChange={handleChange} />
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Chứng chỉ</h4>
            <Checkbox label="Tin học (hoặc XN)" name="certIT" checked={formData.certIT} onChange={handleChange} />
            <Checkbox label="Ngoại ngữ (hoặc XN)" name="certLanguage" checked={formData.certLanguage} onChange={handleChange} />
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Hồ sơ khác</h4>
            <Checkbox label="Bản nhận xét của thủ trưởng" name="reviewDoc" checked={formData.reviewDoc} onChange={handleChange} />
          </div>
        </div>
      </section>

      {/* 3. Thành tích */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">3. Thành tích</h3>
          <button type="button" onClick={addAchievement} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium">
            <Plus size={16} /> Thêm thành tích
          </button>
        </div>

        {formData.achievements.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">Chưa có thành tích nào được thêm.</p>
        ) : (
          <div className="space-y-4">
            {formData.achievements.map((ach, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex-1 w-full">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Loại thành tích</label>
                  <select 
                    value={ach.id} 
                    onChange={(e) => updateAchievement(index, 'id', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {ACHIEVEMENT_LEVELS.map(lvl => (
                      <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-24">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Năm</label>
                  <input type="number" value={ach.year} onChange={(e) => updateAchievement(index, 'year', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Cá nhân/Tập thể</label>
                  <select value={ach.type} onChange={(e) => updateAchievement(index, 'type', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white">
                    <option value="cá nhân">Cá nhân</option>
                    <option value="tập thể">Tập thể</option>
                  </select>
                </div>
                <div className="w-full md:w-48">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Số QĐ / Ghi chú</label>
                  <input type="text" value={ach.decisionNo} onChange={(e) => updateAchievement(index, 'decisionNo', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm" placeholder="VD: 123/QĐ-UBND" />
                </div>
                <button type="button" onClick={() => removeAchievement(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-4 md:mt-0">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-slate-50 p-4 border-t border-slate-200 shadow-sm -mx-8 -mb-8 px-8">
        <button type="button" onClick={onCancel} className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors">
          <X size={18} /> Hủy
        </button>
        <button type="submit" className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
          <Save size={18} /> Lưu hồ sơ
        </button>
      </div>
    </form>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-slate-700">
      {label} {props.required && <span className="text-rose-500">*</span>}
    </label>
    <input 
      className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
      {...props} 
    />
  </div>
);

const Checkbox = ({ label, name, checked, onChange }) => (
  <label className="flex items-center gap-2 mb-2 cursor-pointer group">
    <div className="relative flex items-center">
      <input 
        type="checkbox" 
        name={name} 
        checked={checked} 
        onChange={onChange}
        className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 transition-all cursor-pointer peer"
      />
    </div>
    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
  </label>
);
