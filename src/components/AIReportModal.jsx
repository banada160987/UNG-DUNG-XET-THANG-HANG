import React, { useState } from 'react';
import { X, Sparkles, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ACHIEVEMENT_LEVELS } from '../data/config';

export const AIReportModal = ({ candidates, onClose, unitName = "Toàn trường" }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || 'AIzaSyBr4fb8gUk02KzQ1E-23Tma5lq3R6naSKM');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  // Lấy dữ liệu rút gọn để tiết kiệm token
  const getPromptData = () => {
    const compactData = candidates.map(c => {
      const mainAchs = (c.achievements || []).map(a => {
        const lvl = ACHIEVEMENT_LEVELS.find(l => l.id === a.id);
        return lvl ? lvl.name : a.id;
      });
      const otherAchs = (c.otherAchievements || []).map(a => a.id || a.name);
      
      return {
        ho_ten: c.fullName,
        don_vi: c.unit,
        gioi_tinh: c.gender,
        hang_dang_ky: c.targetTitle,
        trang_thai: c.status,
        thanh_tich_chinh: mainAchs,
        thanh_tich_khac: otherAchs
      };
    });

    const prompt = `Vai trò: Bạn là Thư ký của trường THPT Cao Bá Quát. Bạn đang xem xét danh sách hồ sơ đăng ký thăng hạng chức danh nghề nghiệp giáo viên theo Kế hoạch số 125/KH-SGDĐT của Sở GD&ĐT Đắk Lắk.
Phạm vi dữ liệu: ${unitName}.

Nhiệm vụ: Hãy phân tích số liệu và viết một báo cáo phân tích bằng tiếng Việt thật chuyên nghiệp, súc tích để trình cho Tổ trưởng và Ban Giám Hiệu.

Dữ liệu danh sách giáo viên và thành tích của họ (định dạng JSON):
${JSON.stringify(compactData, null, 2)}

Yêu cầu nội dung báo cáo (trình bày bằng Markdown đẹp mắt):
1. Đánh giá tổng quan bức tranh thành tích của đơn vị.
2. Vinh danh cụ thể những cá nhân có thành tích xuất sắc nhất (dựa trên các bằng khen cấp cao).
3. Chỉ ra những điểm yếu/thiếu sót chung hoặc những loại thành tích mà đa số giáo viên còn thiếu.
4. Đưa ra nhận xét, đánh giá hoặc khuyến nghị ngắn gọn dành cho Ban Giám Hiệu.
`;
    return prompt;
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API Key để sử dụng tính năng này.');
      return;
    }
    
    localStorage.setItem('gemini_api_key', apiKey);
    setError('');
    setIsGenerating(true);
    setReport('');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: getPromptData()
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Có lỗi xảy ra khi gọi API');
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (generatedText) {
        setReport(generatedText);
      } else {
        throw new Error('Không nhận được phản hồi từ AI');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi phân tích: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-sm">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Trợ lý AI Phân tích Thành tích</h2>
              <p className="text-sm text-slate-500">Dữ liệu phân tích từ {candidates.length} hồ sơ ({unitName})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* Settings Section */}
          {!report && !isGenerating && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 max-w-2xl mx-auto mt-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Sẵn sàng phân tích hồ sơ</h3>
                <p className="text-slate-500 text-sm max-w-md">
                  AI sẽ đóng vai trò là thư ký trường THPT Cao Bá Quát, đọc toàn bộ danh sách thành tích của giáo viên và tổng hợp một báo cáo chi tiết.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Google Gemini API Key</label>
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Nhập API Key..."
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
                  />
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} />
                    API Key được lưu an toàn trên trình duyệt của bạn.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleGenerate}
                  disabled={!apiKey.trim() || candidates.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 shadow-md shadow-purple-500/20"
                >
                  <Sparkles size={18} />
                  Bắt đầu phân tích dữ liệu
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="animate-spin text-purple-500 mb-4" size={40} />
              <h3 className="text-lg font-medium text-slate-700">Đang phân tích dữ liệu thành tích...</h3>
              <p className="text-sm text-slate-500 mt-2">Vui lòng đợi vài giây để AI đọc và tổng hợp báo cáo</p>
            </div>
          )}

          {report && !isGenerating && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  Báo cáo Phân tích từ AI
                </h3>
                <button 
                  onClick={handleGenerate}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <RefreshCw size={14} /> Phân tích lại
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 prose prose-slate max-w-none text-sm md:text-base prose-headings:text-indigo-900 prose-a:text-purple-600 prose-strong:text-slate-800">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
