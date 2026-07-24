import { supabase } from './supabaseClient';

/**
 * Mã hóa mật khẩu bằng SHA-256 (Web Crypto API)
 */
export const hashPassword = async (password) => {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }
  } catch (e) {
    console.warn("Web Crypto API failed, using fallback hash", e);
  }
  
  // Fallback for non-secure contexts (HTTP)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }
  return Math.abs(hash).toString(16) + "fb"; // Append 'fb' to denote fallback
};

/**
 * Lấy IP công khai của thiết bị
 */
export const getDeviceIp = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return 'Unknown';
    const data = await res.json();
    return data.ip || 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
};

/**
 * Ghi lại lịch sử đăng nhập vào bảng access_logs
 */
export const logAccess = async (username, role, status) => {
  try {
    const ip = await getDeviceIp();
    const userAgent = navigator.userAgent;

    await supabase.from('access_logs').insert([{
      username: username,
      role: role,
      ip_address: ip,
      user_agent: userAgent,
      status: status
    }]);
  } catch (error) {
    console.error("Lỗi khi ghi access log:", error);
  }
};

/**
 * Xử lý thất bại đăng nhập: tăng failed_attempts và khóa tài khoản nếu cần
 * @param {string} table Tên bảng ('teachers', 'heads', 'secretaries')
 * @param {string} idField Cột khóa chính ('cccd', 'department', 'username')
 * @param {string} idValue Giá trị khóa chính
 * @param {number} currentFailedAttempts Số lần sai hiện tại
 * @returns {Promise<boolean>} true nếu tài khoản bị khóa sau lần sai này
 */
export const handleFailedAttempt = async (table, idField, idValue, currentFailedAttempts) => {
  const newAttempts = currentFailedAttempts + 1;
  let updates = { failed_attempts: newAttempts };
  let isLocked = false;

  // Nếu sai 5 lần trở lên => khóa 15 phút
  if (newAttempts >= 5) {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    updates.locked_until = lockedUntil;
    isLocked = true;
  }

  await supabase.from(table).update(updates).eq(idField, idValue);
  return isLocked;
};

/**
 * Xử lý thành công đăng nhập: reset failed_attempts và locked_until
 */
export const handleSuccessfulLogin = async (table, idField, idValue) => {
  await supabase.from(table).update({
    failed_attempts: 0,
    locked_until: null
  }).eq(idField, idValue);
};

/**
 * Kiểm tra xem tài khoản có đang bị khóa hay không
 * @returns {number|null} Số phút bị khóa còn lại, hoặc null nếu không bị khóa
 */
export const getRemainingLockMinutes = (lockedUntil) => {
  if (!lockedUntil) return null;
  const lockTime = new Date(lockedUntil).getTime();
  const now = Date.now();
  if (lockTime > now) {
    return Math.ceil((lockTime - now) / 60000);
  }
  return null;
};

/**
 * Tạo token đơn giản cho phiên làm việc (mã hóa base64 với timestamp để có thời hạn)
 */
export const generateSessionToken = (userPayload) => {
  const payload = {
    ...userPayload,
    exp: Date.now() + 8 * 60 * 60 * 1000 // 8 hours
  };
  const jsonStr = JSON.stringify(payload);
  return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
  }));
};

/**
 * Kiểm tra tính hợp lệ của token
 */
export const verifySessionToken = (tokenStr) => {
  if (!tokenStr) return null;
  try {
    const jsonStr = decodeURIComponent(atob(tokenStr).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonStr);
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
};

/**
 * Ghi log Audit (Nhật ký hệ thống)
 */
export const logAudit = async (actor, actionType, targetId, oldData, newData) => {
  try {
    await supabase.from('audit_logs').insert([{
      actor: actor,
      action_type: actionType,
      target_id: targetId,
      old_data: oldData,
      new_data: newData
    }]);
  } catch (error) {
    console.error("Lỗi khi ghi audit log:", error);
  }
};
