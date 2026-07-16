import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Cấu hình chung cho toàn bộ dialog
const baseConfig = {
  confirmButtonColor: '#2563eb', // blue-600
  cancelButtonColor: '#94a3b8',  // slate-400
  confirmButtonText: 'Đồng ý',
  cancelButtonText: 'Hủy',
  reverseButtons: true,
  customClass: {
    popup: 'rounded-2xl shadow-xl border border-slate-100',
    title: 'text-xl font-bold text-slate-800',
    htmlContainer: 'text-slate-600',
    actions: 'mt-6',
    confirmButton: 'px-6 py-2.5 font-medium rounded-xl',
    cancelButton: 'px-6 py-2.5 font-medium rounded-xl'
  }
};

/**
 * Hiển thị thông báo (Alert)
 * @param {string} title Tiêu đề
 * @param {string} text Nội dung
 * @param {'success' | 'error' | 'warning' | 'info' | 'question'} icon Icon
 */
export const showAlert = (title, text = '', icon = 'info') => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon,
  });
};

/**
 * Hiển thị hộp thoại Xác nhận (Confirm)
 * @param {string} title Tiêu đề
 * @param {string} text Nội dung
 * @param {'warning' | 'question' | 'info' | 'error' | 'success'} icon Icon
 * @returns {Promise<boolean>} True nếu người dùng bấm Đồng ý, False nếu Hủy
 */
export const showConfirm = async (title, text, icon = 'warning') => {
  const result = await MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon,
    showCancelButton: true,
  });
  return result.isConfirmed;
};

/**
 * Hiển thị hộp thoại Nhập liệu (Prompt)
 * @param {string} title Tiêu đề
 * @param {string} inputPlaceholder Placeholder cho input
 * @param {string} defaultValue Giá trị mặc định
 * @returns {Promise<string|null>} Giá trị nhập vào, hoặc null nếu Hủy
 */
export const showPrompt = async (title, inputPlaceholder = '', defaultValue = '') => {
  const result = await MySwal.fire({
    ...baseConfig,
    title,
    input: 'text',
    inputPlaceholder,
    inputValue: defaultValue,
    showCancelButton: true,
    inputValidator: (value) => {
      // Cho phép null/empty tùy trường hợp
    }
  });
  return result.isConfirmed ? result.value : null;
};
