// Danh sách các chức danh đăng ký
export const TARGET_TITLES = [
  'Giáo viên mầm non hạng II',
  'Giáo viên mầm non hạng I',
  'Giáo viên tiểu học hạng II',
  'Giáo viên tiểu học hạng I',
  'Giáo viên THCS hạng II',
  'Giáo viên THCS hạng I',
  'Giáo viên THPT hạng II',
  'Giáo viên THPT hạng I',
];

// Danh mục thành tích đúng theo quy định xếp hạng
export const ACHIEVEMENT_LEVELS = [
  { id: 'huan_chuong', name: 'Huân chương các loại', score: 1 },
  { id: 'danh_hieu_nn', name: 'Danh hiệu vinh dự nhà nước (Anh hùng LĐ, NGND, NGƯT...)', score: 2 },
  { id: 'giai_thuong_hcm', name: 'Giải thưởng Hồ Chí Minh; Giải thưởng Nhà nước', score: 3 },
  { id: 'cstd_toan_quoc', name: 'Danh hiệu Chiến sĩ thi đua toàn quốc', score: 4 },
  { id: 'bk_thu_tuong', name: 'Bằng khen của Thủ tướng Chính phủ', score: 5 },
  { id: 'cstd_cap_tinh', name: 'Danh hiệu Chiến sĩ thi cấp tỉnh', score: 6 },
  { id: 'bk_tinh_uy_5nam', name: 'Bằng khen của Ban Thường vụ Tỉnh ủy (hoàn thành XS 5 năm liền)', score: 7 },
  { id: 'bk_bo_nganh', name: 'Bằng khen của Bộ, ban, ngành trung ương', score: 8 },
  { id: 'bk_tinh_uy_dotxuat', name: 'Bằng khen của BTV Tỉnh ủy (đột xuất, chuyên đề, hằng năm)', score: 9 },
  { id: 'bk_ubnd_tinh', name: 'Bằng khen của UBND tỉnh (công trạng, đột xuất, phong trào)', score: 10 },
  
  // Legacy grouped ID for compatibility
  { id: 'bk_ldld_tinhdoan', name: 'Bằng khen LĐLĐ, tỉnh Đoàn', score: 11 },
  // Split IDs for precise reporting
  { id: 'bk_ldld', name: 'Bằng khen Liên đoàn Lao động', score: 11 },
  { id: 'bk_tinhdoan', name: 'Bằng khen Tỉnh đoàn', score: 11 },
  
  { id: 'cstd_co_so', name: 'Danh hiệu Chiến sĩ thi đua cơ sở', score: 12 },
  { id: 'gk_dang_uy_xa', name: 'Giấy khen của Ban Thường vụ Đảng uỷ xã, phường', score: 13 },
  
  // Legacy grouped ID for compatibility
  { id: 'gk_so_nganh_xa', name: 'Giấy khen của Thủ trưởng Sở, ban, ngành, UB MTTQ tỉnh, Chủ tịch UBND cấp xã', score: 14 },
  // Split IDs for precise reporting
  { id: 'gk_sgd', name: 'Giấy khen Sở Giáo dục và Đào tạo', score: 14 },
  { id: 'gk_bannganh', name: 'Giấy khen Ban, ngành, đoàn thể, UB MTTQ tỉnh', score: 14 },
  { id: 'gk_xa', name: 'Giấy khen Chủ tịch UBND cấp xã', score: 14 }
];
