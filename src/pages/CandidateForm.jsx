import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ACHIEVEMENT_LEVELS, TARGET_TITLES } from '../data/config';
import { Save, X, Plus, Trash2, Send, Upload, Paperclip, AlertCircle, ScanText, Loader2, MessageSquarePlus } from 'lucide-react';
import { DriveUploadButton } from '../components/DriveUploadButton';
import { performOCR } from '../utils/ocr';
import { showPrompt } from '../utils/alert';

export const CommentContext = createContext({});

export const CandidateForm = ({ onSave, onSubmitToHead, onCancel, initialData, fixedCccd, isReadOnly, mode, onCommentChange }) => {
  const [departments, setDepartments] = useState([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  const getInitialState = () => {
    const defaultData = {
      cccd: fixedCccd || '',
      fullName: '',
      dob: '',
      gender: 'Nam',
      ethnicity: 'Kinh',
      phone: '',
      workplace: '',
      unit: '',
      currentTitle: '',
      targetTitle: 'Hạng II',
      decisionRecruitment: { date: '', number: '', issuer: '', link: '' },
      decisionProbation: { date: '', number: '', issuer: '', link: '' },
      decisionAppointment: { date: '', number: '', issuer: '', link: '' },
      decisionSalary: { date: '', number: '', issuer: '', link: '' },
      degrees: [],
      resumeDoc: false,
      certIT: false,
      certLanguage: false,
      certEthnic: false,
      reviewDoc: false,
      achievements: [],
      otherAchievements: [],
      files: [],
      status: 'draft',
      feedback_message: ''
    };

    if (!initialData) return defaultData;

    const predefinedIds = ACHIEVEMENT_LEVELS.map(l => l.id);
    const achievements = [];
    const otherAchievements = [];
    (initialData.achievements || []).forEach(a => {
      if (predefinedIds.includes(a.id)) achievements.push(a);
      else otherAchievements.push(a);
    });

    return {
      ...defaultData,
      ...initialData,
      achievements,
      otherAchievements
    };
  };

  const [formData, setFormData] = useState(getInitialState());

  const [uploading, setUploading] = useState(false);

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
      degrees: [...formData.degrees, { level: 'Đại học', major: '', school: '', year: '', number: '', link: '' }]
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
        { id: 'cstd_co_so', year: new Date().getFullYear(), type: 'cá nhân', decisionNo: '', link: '' }
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

  const addOtherAchievement = () => {
    setFormData({
      ...formData,
      otherAchievements: [...formData.otherAchievements, { id: '', year: new Date().getFullYear(), type: 'cá nhân', decisionNo: '', link: '' }]
    });
  };

  const updateOtherAchievement = (index, field, value) => {
    const newAchievements = [...formData.otherAchievements];
    newAchievements[index][field] = value;
    setFormData({ ...formData, otherAchievements: newAchievements });
  };

  const removeOtherAchievement = (index) => {
    setFormData({ ...formData, otherAchievements: formData.otherAchievements.filter((_, i) => i !== index) });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Thông báo', "File quá lớn! Vui lòng chọn file dưới 5MB.");
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage.from('evidence_files').upload(filePath, file);
    
    if (error) {
      showAlert('Thông báo', "Lỗi tải file: " + error.message);
    } else {
      const { data } = supabase.storage.from('evidence_files').getPublicUrl(filePath);
      if (data) {
        setFormData(prev => ({
          ...prev,
          files: [...(prev.files || []), { name: file.name, url: data.publicUrl, path: filePath }]
        }));
      }
    }
    setUploading(false);
  };

  const removeFile = async (index) => {
    if (!confirm("Bạn muốn xóa file này?")) return;
    const fileToRemove = formData.files[index];
    
    // Tùy chọn: Xóa file trên Storage thực tế
    if (fileToRemove.path) {
      await supabase.storage.from('evidence_files').remove([fileToRemove.path]);
    }

    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const getSubmitData = () => {
    const dataToSubmit = { ...formData };
    dataToSubmit.achievements = [...formData.achievements, ...(formData.otherAchievements || [])];
    delete dataToSubmit.otherAchievements;
    return dataToSubmit;
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    onSave(getSubmitData()); 
  };

  const handleSubmitFinal = (e) => {
    e.preventDefault();
    if(confirm('Bạn có chắc chắn muốn nộp hồ sơ này cho Tổ trưởng? Bạn sẽ không thể sửa nếu chưa bị trả lại.')){
      onSubmitToHead(getSubmitData());
    }
  };

  const filePrefix = formData.cccd ? `${formData.cccd}_${formData.fullName}` : "";

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setOcrLoading(true);
    setOcrProgress(0);
    try {
      const data = await performOCR(file, (progress) => {
        setOcrProgress(progress);
      });
      
      if (Object.keys(data).length === 0) {
        showAlert('Thông báo', "Không nhận diện được thông tin. Vui lòng thử ảnh rõ nét hơn.");
      } else {
        setFormData(prev => ({
          ...prev,
          ...data
        }));
        showAlert('Thông báo', `Đã nhận diện thành công:\nCCCD: ${data.cccd || 'Không tìm thấy'}\nHọ Tên: ${data.fullName || 'Không tìm thấy'}\nNgày Sinh: ${data.dob || 'Không tìm thấy'}`);
      }
    } catch (error) {
      showAlert('Thông báo', "Có lỗi xảy ra khi quét OCR. Vui lòng nhập tay.");
    } finally {
      setOcrLoading(false);
      e.target.value = null; // reset input
    }
  };

  const feedbackData = (() => {
    try {
      const parsed = JSON.parse(formData.feedback_message || '{}');
      if (parsed.general !== undefined || parsed.fields !== undefined) {
        return parsed;
      }
    } catch(e) {}
    return { general: formData.feedback_message || '', fields: {} };
  })();

  const handleCommentChange = (fieldName, comment) => {
    if (onCommentChange) onCommentChange(fieldName, comment);
  };

  return (
    <CommentContext.Provider value={{ fields: feedbackData.fields || {}, mode, onCommentChange: handleCommentChange }}>
    <form className="space-y-8 pb-10">
      {formData.status === 'returned' && feedbackData.general && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-rose-500 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-rose-800">Hồ sơ cần chỉnh sửa</h3>
            <p className="text-rose-700 text-sm mt-1 whitespace-pre-wrap">{feedbackData.general}</p>
          </div>
        </div>
      )}

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 mb-4 gap-2">
          <h3 className="text-lg font-semibold text-slate-800">I. Thông tin cá nhân</h3>
          {!isReadOnly && (
            <div>
              <input type="file" id="ocr-upload" accept="image/*" className="hidden" onChange={handleOcrUpload} />
              <label 
                htmlFor="ocr-upload" 
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${ocrLoading ? 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
              >
                {ocrLoading ? <Loader2 size={16} className="animate-spin" /> : <ScanText size={16} />}
                {ocrLoading ? `Đang nhận diện... ${ocrProgress}%` : 'Quét ảnh tự động điền (AI)'}
              </label>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Số CCCD" name="cccd" value={formData.cccd} onChange={handleChange} required disabled={!!fixedCccd || isReadOnly} />
          <Input label="Họ tên" name="fullName" value={formData.fullName} onChange={handleChange} required disabled={isReadOnly} />
          <Input label="Ngày sinh" name="dob" type="date" value={formData.dob} onChange={handleChange} required disabled={isReadOnly} />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Giới tính</label>
            <select name="gender" value={formData.gender} onChange={handleChange} disabled={isReadOnly} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500">
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          
          <Input label="Dân tộc" name="ethnicity" value={formData.ethnicity} onChange={handleChange} disabled={isReadOnly} />
          <Input label="SĐT (Có Zalo)" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxxxxx" required disabled={isReadOnly} />
          
          <Input label="Đơn vị công tác (Trường)" name="workplace" value={formData.workplace} onChange={handleChange} placeholder="Trường THPT..." required disabled={isReadOnly} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Tổ chuyên môn <span className="text-rose-500">*</span></label>
            <select name="unit" value={formData.unit} onChange={handleChange} disabled={isReadOnly} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-500">
              {departments.length === 0 && <option value="">Chưa có dữ liệu Tổ</option>}
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <Input label="Chức danh hiện giữ" name="currentTitle" value={formData.currentTitle} onChange={handleChange} required disabled={isReadOnly} />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Chức danh đăng ký xét</label>
            <select name="targetTitle" value={formData.targetTitle} onChange={handleChange} disabled={isReadOnly} className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500">
              {TARGET_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* 2. Quyết định công tác */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-slate-800">II. Thông tin công tác</h3>
        <div className="space-y-6">
          <DecisionInputGroup title="Quyết định Tuyển dụng" type="decisionRecruitment" data={formData.decisionRecruitment} onChange={handleDecisionChange} disabled={isReadOnly} filePrefix={filePrefix} />
          <DecisionInputGroup title="Quyết định Hết tập sự" type="decisionProbation" data={formData.decisionProbation} onChange={handleDecisionChange} disabled={isReadOnly} filePrefix={filePrefix} />
          <DecisionInputGroup title="Quyết định Bổ nhiệm hạng" type="decisionAppointment" data={formData.decisionAppointment} onChange={handleDecisionChange} disabled={isReadOnly} filePrefix={filePrefix} />
          <DecisionInputGroup title="Quyết định Nâng lương gần nhất" type="decisionSalary" data={formData.decisionSalary} onChange={handleDecisionChange} disabled={isReadOnly} filePrefix={filePrefix} />
        </div>
      </section>

      {/* 3. Văn bằng */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">III. Văn bằng</h3>
          {!isReadOnly && (
            <button type="button" onClick={addDegree} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
              <Plus size={16} /> Thêm văn bằng
            </button>
          )}
        </div>
        
        {formData.degrees.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">Chưa có văn bằng nào được thêm.</p>
        ) : (
          <div className="space-y-4">
            {formData.degrees.map((deg, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                <div className="col-span-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Trình độ</label>
                  <select disabled={isReadOnly} value={deg.level} onChange={(e) => updateDegree(index, 'level', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white disabled:bg-slate-100">
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Chuyên ngành</label>
                  <input disabled={isReadOnly} type="text" value={deg.major} onChange={(e) => updateDegree(index, 'major', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Trường cấp</label>
                  <input disabled={isReadOnly} type="text" value={deg.school} onChange={(e) => updateDegree(index, 'school', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Năm cấp</label>
                  <input disabled={isReadOnly} type="text" value={deg.year} onChange={(e) => updateDegree(index, 'year', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                </div>
                <div className="col-span-1 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Số hiệu</label>
                    <input disabled={isReadOnly} type="text" value={deg.number} onChange={(e) => updateDegree(index, 'number', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-6 flex items-center justify-between mt-2 pt-2 border-t border-slate-200 border-dashed">
                  <div className="flex-1">
                    <DriveUploadButton 
                      disabled={isReadOnly} 
                      currentLink={deg.link} 
                      onUploadSuccess={(url) => updateDegree(index, 'link', url)} 
                      compact={true} 
                      filePrefix={filePrefix}
                    />
                  </div>
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeDegree(index)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-1 text-sm font-medium">
                      <Trash2 size={16} /> Xóa
                    </button>
                  )}
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
          <Checkbox disabled={isReadOnly} label="Đã có Sơ yếu lý lịch (Mẫu HS02-VC/BNV)" name="resumeDoc" checked={formData.resumeDoc} onChange={handleChange} />
          <Checkbox disabled={isReadOnly} label="Đã có Bản nhận xét, đánh giá của thủ trưởng" name="reviewDoc" checked={formData.reviewDoc} onChange={handleChange} />
          <Checkbox disabled={isReadOnly} label="Tin học (Có chứng chỉ hoặc xác nhận)" name="certIT" checked={formData.certIT} onChange={handleChange} />
          <Checkbox disabled={isReadOnly} label="Ngoại ngữ (Có chứng chỉ hoặc xác nhận)" name="certLanguage" checked={formData.certLanguage} onChange={handleChange} />
          <Checkbox disabled={isReadOnly} label="Tiếng dân tộc thiểu số (Có chứng chỉ hoặc xác nhận)" name="certEthnic" checked={formData.certEthnic} onChange={handleChange} />
        </div>
      </section>

      {/* 5. Thành tích */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">VII. Thành tích (Cập nhật đúng theo Kế hoạch)</h3>
          {!isReadOnly && (
            <button type="button" onClick={addAchievement} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
              <Plus size={16} /> Thêm thành tích
            </button>
          )}
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
                    disabled={isReadOnly}
                    value={ach.id} 
                    title={ACHIEVEMENT_LEVELS.find(lvl => lvl.id === ach.id)?.name || ""}
                    onChange={(e) => updateAchievement(index, 'id', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100"
                  >
                    {ACHIEVEMENT_LEVELS.map(lvl => (
                      <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-24">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Năm</label>
                  <input disabled={isReadOnly} type="number" value={ach.year} onChange={(e) => updateAchievement(index, 'year', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Cá nhân/Tập thể</label>
                  <select disabled={isReadOnly} value={ach.type} onChange={(e) => updateAchievement(index, 'type', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white disabled:bg-slate-100">
                    <option value="cá nhân">Cá nhân</option>
                    <option value="tập thể">Tập thể</option>
                  </select>
                </div>
                <div className="w-full md:w-48">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Số Quyết định</label>
                  <input disabled={isReadOnly} type="text" value={ach.decisionNo} title={ach.decisionNo} onChange={(e) => updateAchievement(index, 'decisionNo', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                </div>
                
                <div className="w-full mt-2 pt-2 border-t border-slate-200 border-dashed flex justify-between items-center md:hidden">
                  <DriveUploadButton 
                    disabled={isReadOnly} 
                    currentLink={ach.link} 
                    onUploadSuccess={(url) => updateAchievement(index, 'link', url)} 
                    compact={true} 
                    filePrefix={filePrefix}
                  />
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeAchievement(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <div className="hidden md:flex flex-col gap-2 min-w-[250px] items-end pb-1">
                  <DriveUploadButton 
                    disabled={isReadOnly} 
                    currentLink={ach.link} 
                    onUploadSuccess={(url) => updateAchievement(index, 'link', url)} 
                    compact={true} 
                    filePrefix={filePrefix}
                  />
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeAchievement(index)} className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                      <Trash2 size={12} /> Xóa thành tích
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5.5. Thành tích khác */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">VIII. Các thành tích khác (Nếu có)</h3>
          {!isReadOnly && (
            <button type="button" onClick={addOtherAchievement} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
              <Plus size={16} /> Thêm thành tích
            </button>
          )}
        </div>

        {formData.otherAchievements.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">Chưa khai báo thành tích khác.</p>
        ) : (
          <div className="space-y-4">
            {formData.otherAchievements.map((ach, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex-1 w-full">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Tên thành tích</label>
                  <input 
                    disabled={isReadOnly}
                    type="text"
                    placeholder="VD: Giáo viên dạy giỏi..."
                    value={ach.id} 
                    title={ach.id}
                    onChange={(e) => updateOtherAchievement(index, 'id', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100"
                  />
                </div>
                <div className="w-full md:w-24">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Năm</label>
                  <input disabled={isReadOnly} type="number" value={ach.year} onChange={(e) => updateOtherAchievement(index, 'year', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Cá nhân/Tập thể</label>
                  <select disabled={isReadOnly} value={ach.type} onChange={(e) => updateOtherAchievement(index, 'type', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white disabled:bg-slate-100">
                    <option value="cá nhân">Cá nhân</option>
                    <option value="tập thể">Tập thể</option>
                  </select>
                </div>
                <div className="w-full md:w-48">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Số Quyết định</label>
                  <input disabled={isReadOnly} type="text" value={ach.decisionNo} title={ach.decisionNo} onChange={(e) => updateOtherAchievement(index, 'decisionNo', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-100" />
                </div>
                
                <div className="w-full mt-2 pt-2 border-t border-slate-200 border-dashed flex justify-between items-center md:hidden">
                  <DriveUploadButton 
                    disabled={isReadOnly} 
                    currentLink={ach.link} 
                    onUploadSuccess={(url) => updateOtherAchievement(index, 'link', url)} 
                    compact={true} 
                    filePrefix={filePrefix}
                  />
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeOtherAchievement(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <div className="hidden md:flex flex-col gap-2 min-w-[250px] items-end pb-1">
                  <DriveUploadButton 
                    disabled={isReadOnly} 
                    currentLink={ach.link} 
                    onUploadSuccess={(url) => updateOtherAchievement(index, 'link', url)} 
                    compact={true} 
                    filePrefix={filePrefix}
                  />
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeOtherAchievement(index)} className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                      <Trash2 size={12} /> Xóa thành tích
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Đã Xóa phần đính kèm file chung */}

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex justify-end gap-3 sticky bottom-0 bg-slate-50 p-4 border-t border-slate-200 shadow-sm -mx-8 -mb-8 px-8 z-10">
          <button type="button" onClick={handleSaveDraft} className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 shadow-sm transition-colors">
            <Save size={18} /> Lưu nháp
          </button>
          
          <button type="button" onClick={handleSubmitFinal} className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
            <Send size={18} /> Nộp cho Tổ trưởng
          </button>
        </div>
      )}
    </form>
    </CommentContext.Provider>
  );
};

export const DecisionInputGroup = ({ title, type, data, onChange, disabled, filePrefix }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-end">
      <h4 className="font-medium text-sm text-slate-700">{title}</h4>
      <DriveUploadButton 
        disabled={disabled} 
        currentLink={data.link} 
        onUploadSuccess={(url) => onChange(type, 'link', url)} 
        compact={true} 
        filePrefix={filePrefix}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input disabled={disabled} type="text" placeholder="Số quyết định" value={data.number} onChange={e => onChange(type, 'number', e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" />
      <input disabled={disabled} type="date" title="Ngày ký" value={data.date} onChange={e => onChange(type, 'date', e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" />
      <input disabled={disabled} type="text" placeholder="Cơ quan ban hành" value={data.issuer} onChange={e => onChange(type, 'issuer', e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" />
    </div>
  </div>
);

export const Input = ({ label, ...props }) => {
  const { fields = {}, mode, onCommentChange } = useContext(CommentContext);
  const error = fields[props.name];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
        {mode === 'review' && (
          <button 
            type="button" 
            onClick={async () => {
              const current = fields[props.name] || '';
              const cmt = await showPrompt(`Nhập nhận xét cho [${label}]:`, "Nhập nhận xét...", current);
              if (cmt !== null) onCommentChange(props.name, cmt);
            }}
            className="text-slate-400 hover:text-blue-500 transition-colors"
            title="Thêm bình luận/báo lỗi"
          >
            <MessageSquarePlus size={16} />
          </button>
        )}
      </div>
      <input 
        className={`border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 ${error ? 'border-rose-400 bg-rose-50' : 'border-slate-300'}`} 
        {...props} 
      />
      {error && <span className="text-rose-500 text-xs mt-0.5">{error}</span>}
    </div>
  );
};

export const Checkbox = ({ label, name, checked, onChange, disabled }) => {
  const { fields = {}, mode, onCommentChange } = useContext(CommentContext);
  const error = fields[name];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className={`flex items-center gap-2 group ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
          <input disabled={disabled} type="checkbox" name={name} checked={checked} onChange={onChange} className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 peer disabled:bg-slate-100" />
          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
        </label>
        {mode === 'review' && (
          <button 
            type="button" 
            onClick={async () => {
              const current = fields[name] || '';
              const cmt = await showPrompt(`Nhập nhận xét cho [${label}]:`, "Nhập nhận xét...", current);
              if (cmt !== null) onCommentChange(name, cmt);
            }}
            className="text-slate-400 hover:text-blue-500 transition-colors"
            title="Thêm bình luận/báo lỗi"
          >
            <MessageSquarePlus size={16} />
          </button>
        )}
      </div>
      {error && <span className="text-rose-500 text-xs mt-0.5">{error}</span>}
    </div>
  );
};
