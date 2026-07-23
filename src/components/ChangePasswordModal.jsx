import React, { useState } from 'react';
import { KeyRound, X, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { hashPassword } from '../utils/security';
import { showAlert } from '../utils/alert';

export const ChangePasswordModal = ({ isOpen, onClose, role, identifier }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showAlert('Thông báo', 'Vui lòng nhập mật khẩu mới!');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Thông báo', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setSaving(true);
    try {
      const hashed = await hashPassword(newPassword.trim());
      let error = null;

      if (role === 'admin') {
        const { error: err } = await supabase
          .from('settings')
          .upsert({ id: 'admin_config', points: { password: hashed } }, { onConflict: 'id' });
        error = err;
      } else if (role === 'head') {
        const { error: err } = await supabase
          .from('heads')
          .update({ password: hashed })
          .eq('department', identifier);
        error = err;
      } else if (role === 'secretary') {
        const { error: err } = await supabase
          .from('secretaries')
          .update({ password: hashed })
          .eq('username', identifier);
        error = err;
      }

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);

    } catch (err) {
      console.error(err);
      showAlert('Lỗi', 'Đã có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <KeyRound size={20} className="text-blue-600" />
            Đổi mật khẩu
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-emerald-600">
              <CheckCircle size={48} className="mb-2" />
              <p className="font-bold">Đổi mật khẩu thành công!</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder="Ít nhất 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    'Đang xử lý...'
                  ) : (
                    <>
                      <Save size={18} /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};