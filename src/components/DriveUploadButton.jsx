import React, { useState } from 'react';
import { Upload, Paperclip, Loader2 } from 'lucide-react';
import { uploadToDrive } from '../utils/driveUpload';
import { showAlert } from '../utils/alert';

export const DriveUploadButton = ({ onUploadSuccess, currentLink, disabled, compact = false, filePrefix = "" }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Thông báo', "File quá lớn! Vui lòng chọn file dưới 5MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const link = await uploadToDrive(file, filePrefix);
      onUploadSuccess(link);
    } catch (err) {
      setError(err.message || "Lỗi tải file");
      showAlert('Thông báo', "Lỗi khi tải file lên Drive: " + (err.message || "Không xác định"));
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <label className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 cursor-pointer'}`}>
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          <span>{uploading ? 'Đang tải...' : 'Upload'}</span>
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading || disabled} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
        {currentLink && (
          <a href={currentLink} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
            <Paperclip size={12} /> Đã đính kèm
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!disabled && (
        <label className={`flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-50 border border-dashed rounded-lg cursor-pointer hover:bg-slate-100 transition-colors ${error ? 'border-rose-400' : 'border-slate-300'}`}>
          {uploading ? (
            <>
              <Loader2 size={16} className="text-blue-500 animate-spin" />
              <span className="text-sm font-medium text-slate-600">Đang tải lên Drive... (vui lòng chờ)</span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-slate-600">Tải minh chứng (Dưới 5MB)</span>
            </>
          )}
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading || disabled} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      )}
      
      {currentLink && (
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
          <Paperclip size={16} className="text-emerald-500" />
          <a href={currentLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-700 hover:underline truncate">
            Đã đính kèm minh chứng trên Drive
          </a>
        </div>
      )}
    </div>
  );
};
