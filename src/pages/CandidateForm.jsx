import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ACHIEVEMENT_LEVELS, TARGET_TITLES } from '../data/config';
import { Save, X, Plus, Trash2 } from 'lucide-react';

export const CandidateForm = ({ onSave, onCancel, initialData, fixedCccd }) => {
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState(initialData || {
    cccd: fixedCccd || '',
    fullName: '',
    dob: '',
    gender: 'Nam',
    ethnicity: 'Kinh',
    unit: '',
    currentTitle: '',
    targetTitle: 'Hạng II',
    decisionRecruitment: { date: '', number: '', issuer: '' },
    decisionProbation: { date: '', number: '', issuer: '' },
    decisionAppointment: { date: '', number: '', issuer: '' },
    decisionSalary: { date: '', number: '', issuer: '' },
    degrees: [],
    resumeDoc: false,
    certIT: false,
    certLanguage: false,
    reviewDoc: false,
    achievements: [],
    status: 'draft' // Luôn là nháp khi nộp
  });

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) {
      setDepartments(data);
      if (!formData.unit && data.length > 0) {
        setFormData(prev => ({ ...prev, unit: data[0].name }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDecisionChange = (type, field, value) => {
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        [field]: value
      }
    });
  };

  const addDegree = () => {
    setFormData({
      ...formData,
      degrees: [...formData.degrees, { level: 'Đại học', major: '', school: '', year: '', number: '' }]
    });
  };

  const updateDegree = (index, field, value) => {
    const newDegrees = [...formData.degrees];
    newDegrees[index][field] = value;
    setFormData({ ...formData, degrees: newDegrees });
  };

  const removeDegree = (index) => {
    setFormData({ ...formData, degrees: formData.degrees.filter((_, i) => i !== index) });
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
    setFormData({ ...formData, achievements: formData.achievements.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, status: 'draft' }); // Reset về draft khi sửa/lưu
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-slate-800">I. Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Số CCCD" name="cccd" value={formData.cccd} onChange={handleChange} required disabled={!!fixedCccd} />
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
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Tổ chuyên môn <span className="text-rose-500">*</span></label>
            <select name="unit" value={formData.unit} onChange={handleChange} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {departments.length === 0 && <option value="">Chưa có dữ liệu Tổ</option>}
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <Input label="Chức danh hiện giữ" name="currentTitle" value={formData.currentTitle} onChange={handleChange} required />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Chức danh đăng ký xét</label>
            <select name="targetTitle" value={formData.targetTitle} onChange={handleChange} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
              {TARGET_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* 2. Quyết định công tác */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-slate-800">II. Thông tin công tác</h3>
        <div className="space-y-6">
          <DecisionInputGroup title="Quyết định Tuyển dụng" type="decisionRecruitment" data={formData.decisionRecruitment} onChange={handleDecisionChange} />
          <DecisionInputGroup title="Quyết định Hết tập sự" type="decisionProbation" data={formData.decisionProbation} onChange={handleDecisionChange} />
          <DecisionInputGroup title="Quyết định Bổ nhiệm hạng" type="decisionAppointment" data={formData.decisionAppointment} onChange={handleDecisionChange} />
          <DecisionInputGroup title="Quyết định Nâng lương gần nhất" type="decisionSalary" data={formData.decisionSalary} onChange={handleDecisionChange} />
        </div>
      </section>

      {/* 3. Văn bằng */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">III. Văn bằng</h3>
          <button type="button" onClick={addDegree} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
            <Plus size={16} /> Thêm văn bằng
          </button>
        </div>
        
        {formData.degrees.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">Chưa có văn bằng nào được thêm.</p>
        ) : (
          <div className="space-y-4">
            {formData.degrees.map((deg, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                <div className="col-span-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Trình độ</label>
                  <select value={deg.level} onChange={(e) => updateDegree(index, 'level', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white">
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Chuyên ngành</label>
                  <input type="text" value={deg.major} onChange={(e) => updateDegree(index, 'major', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Trường cấp</label>
                  <input type="text" value={deg.school} onChange={(e) => updateDegree(index, 'school', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Năm cấp</label>
                  <input type="text" value={deg.year} onChange={(e) => updateDegree(index, 'year', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div className="col-span-1 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Số hiệu</label>
                    <input type="text" value={deg.number} onChange={(e) => updateDegree(index, 'number', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                  </div>
                  <button type="button" onClick={() => removeDegree(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Thành phần hồ sơ khác (Sơ yếu lý lịch, Chứng chỉ, Nhận xét) */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-slate-800">IV. Thành phần hồ sơ khác</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
          <Checkbox label="Đã có Sơ yếu lý lịch (Mẫu HS02-VC/BNV)" name="resumeDoc" checked={formData.resumeDoc} onChange={handleChange} />
          <Checkbox label="Đã có Bản nhận xét, đánh giá của thủ trưởng" name="reviewDoc" checked={formData.reviewDoc} onChange={handleChange} />
          <Checkbox label="Tin học (Có chứng chỉ hoặc xác nhận)" name="certIT" checked={formData.certIT} onChange={handleChange} />
          <Checkbox label="Ngoại ngữ (Có chứng chỉ hoặc xác nhận)" name="certLanguage" checked={formData.certLanguage} onChange={handleChange} />
        </div>
      </section>

      {/* 5. Thành tích */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">VII. Thành tích (Cập nhật đúng theo Kế hoạch 125)</h3>
          <button type="button" onClick={addAchievement} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
            <Plus size={16} /> Thêm thành tích
          </button>
        </div>

        {formData.achievements.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">Chưa khai báo thành tích nào.</p>
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
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Số Quyết định</label>
                  <input type="text" value={ach.decisionNo} onChange={(e) => updateAchievement(index, 'decisionNo', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <button type="button" onClick={() => removeAchievement(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mt-4 md:mt-0">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-slate-50 p-4 border-t border-slate-200 shadow-sm -mx-8 -mb-8 px-8">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50">
            <X size={18} /> Thoát
          </button>
        )}
        <button type="submit" className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Save size={18} /> Nộp hồ sơ
        </button>
      </div>
    </form>
  );
};

const DecisionInputGroup = ({ title, type, data, onChange }) => (
  <div className="flex flex-col gap-2">
    <h4 className="font-medium text-sm text-slate-700">{title}</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input type="text" placeholder="Số quyết định" value={data.number} onChange={e => onChange(type, 'number', e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      <input type="date" title="Ngày ký" value={data.date} onChange={e => onChange(type, 'date', e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      <input type="text" placeholder="Cơ quan ban hành" value={data.issuer} onChange={e => onChange(type, 'issuer', e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-slate-700">
      {label} {props.required && <span className="text-rose-500">*</span>}
    </label>
    <input className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" {...props} />
  </div>
);

const Checkbox = ({ label, name, checked, onChange }) => (
  <label className="flex items-center gap-2 mb-2 cursor-pointer group">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 peer" />
    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
  </label>
);
