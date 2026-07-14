import { supabase } from './supabaseClient';

export const logAction = async (candidate_id, actor_role, actor_name, action, notes = '') => {
  try {
    await supabase.from('candidate_logs').insert([{
      candidate_id,
      actor_role,
      actor_name,
      action,
      notes
    }]);
  } catch (error) {
    console.error("Lỗi ghi log:", error);
  }
};
