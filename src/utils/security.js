import { supabase } from './supabaseClient';

/**
 * MÃ£ hÃ³a máº­t kháº©u báº±ng SHA-256 (Web Crypto API)
 */
export const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Láº¥y IP cÃ´ng khai cá»§a thiáº¿t bá»‹
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
 * Ghi láº¡i lá»‹ch sá»­ Ä‘Äƒng nháº­p vÃ o báº£ng access_logs
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
    console.error("Lá»—i khi ghi access log:", error);
  }
};

/**
 * Xá»­ lÃ½ tháº¥t báº¡i Ä‘Äƒng nháº­p: tÄƒng failed_attempts vÃ  khÃ³a tÃ i khoáº£n náº¿u cáº§n
 * @param {string} table TÃªn báº£ng ('teachers', 'heads', 'secretaries')
 * @param {string} idField Cá»™t khÃ³a chÃ­nh ('cccd', 'department', 'username')
 * @param {string} idValue GiÃ¡ trá»‹ khÃ³a chÃ­nh
 * @param {number} currentFailedAttempts Sá»‘ láº§n sai hiá»‡n táº¡i
 * @returns {Promise<boolean>} true náº¿u tÃ i khoáº£n bá»‹ khÃ³a sau láº§n sai nÃ y
 */
export const handleFailedAttempt = async (table, idField, idValue, currentFailedAttempts) => {
  const newAttempts = currentFailedAttempts + 1;
  let updates = { failed_attempts: newAttempts };
  let isLocked = false;

  // Náº¿u sai 5 láº§n trá»Ÿ lÃªn => khÃ³a 15 phÃºt
  if (newAttempts >= 5) {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    updates.locked_until = lockedUntil;
    isLocked = true;
  }

  await supabase.from(table).update(updates).eq(idField, idValue);
  return isLocked;
};

/**
 * Xá»­ lÃ½ thÃ nh cÃ´ng Ä‘Äƒng nháº­p: reset failed_attempts vÃ  locked_until
 */
export const handleSuccessfulLogin = async (table, idField, idValue) => {
  await supabase.from(table).update({
    failed_attempts: 0,
    locked_until: null
  }).eq(idField, idValue);
};

/**
 * Kiá»ƒm tra xem tÃ i khoáº£n cÃ³ Ä‘ang bá»‹ khÃ³a hay khÃ´ng
 * @returns {number|null} Sá»‘ phÃºt bá»‹ khÃ³a cÃ²n láº¡i, hoáº·c null náº¿u khÃ´ng bá»‹ khÃ³a
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
 * T?o token don gi?n cho phiên làm vi?c (mã hóa base64 v?i timestamp d? có th?i h?n)
 */
export const generateSessionToken = (userPayload) => {
  const payload = {
    ...userPayload,
    exp: Date.now() + 8 * 60 * 60 * 1000 // 8 hours
  };
  return btoa(JSON.stringify(payload));
};

/**
 * Ki?m tra tính h?p l? c?a token
 */
export const verifySessionToken = (tokenStr) => {
  if (!tokenStr) return null;
  try {
    const payload = JSON.parse(atob(tokenStr));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
};

/**
 * Ghi log Audit (Nh?t ký h? th?ng)
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
    console.error("L?i khi ghi audit log:", error);
  }
};
