import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ACHIEVEMENT_LEVELS } from '../data/config';

export const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Điểm mặc định nếu database trống hoặc lỗi
  const defaultPoints = {
    "huan_chuong": 20,
    "danh_hieu_nn": 15,
    "giai_thuong_hcm": 15,
    "cstd_toan_quoc": 10,
    "bk_thu_tuong": 10,
    "cstd_cap_tinh": 10,
    "bk_tinh_uy_5nam": 5,
    "bk_bo_nganh": 5,
    "bk_tinh_uy_dotxuat": 5,
    "bk_ubnd_tinh": 5,
    "bk_ldld_tinhdoan": 3,
    "cstd_co_so": 3,
    "gk_dang_uy_xa": 1,
    "gk_so_nganh_xa": 1,
    "seniority_per_year": 1
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('points')
        .eq('id', 'scoring_config')
        .single();
        
      if (error) {
        console.warn("Could not load settings from Supabase, using defaults.");
        setSettings(defaultPoints);
      } else if (data && data.points) {
        setSettings({ ...defaultPoints, ...data.points });
      } else {
        setSettings(defaultPoints);
      }
    } catch (e) {
      console.warn("Exception loading settings, using defaults.");
      setSettings(defaultPoints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newPoints) => {
    try {
      setLoading(true);
      const updated = { ...settings, ...newPoints };
      
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 'scoring_config', points: updated });
        
      if (error) throw error;
      
      setSettings(updated);
      return { success: true };
    } catch (error) {
      console.error("Lỗi cập nhật cấu hình điểm:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, defaultPoints }}>
      {children}
    </SettingsContext.Provider>
  );
};
