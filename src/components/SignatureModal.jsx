import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { XCircle, Check, Trash2 } from 'lucide-react';
import { showAlert } from '../utils/alert';

export const SignatureModal = ({ onClose, onSave }) => {
  const sigCanvas = useRef({});

  const clear = () => {
    sigCanvas.current.clear();
  };

  const save = () => {
    if (sigCanvas.current.isEmpty()) {
      showAlert('Thông báo', "Vui lòng ký trước khi lưu.");
      return;
    }
    const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Ký điện tử</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col items-center">
          <p className="text-sm text-slate-500 mb-2">Sử dụng chuột hoặc ngón tay (trên màn hình cảm ứng) để ký vào ô bên dưới:</p>
          <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 w-full overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                className: 'signature-canvas w-full h-48 cursor-crosshair'
              }}
            />
          </div>
          
          <div className="flex gap-2 w-full mt-4 justify-between">
            <button 
              onClick={clear}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Trash2 size={16} /> Xóa ký lại
            </button>
            <button 
              onClick={save}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Check size={16} /> Lưu chữ ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
