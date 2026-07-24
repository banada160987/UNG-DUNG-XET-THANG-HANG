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
  
  { id: 'cstd_co_so', name: 'Danh hiệu Chiến sĩ thi đua cơ sở', score: 11 },
  { id: 'gk_dang_uy_xa', name: 'Giấy khen của Ban Thường vụ Đảng uỷ xã, phường', score: 12 },
  
  // Mức 13: Giấy khen Sở, ban, ngành, MTTQ...
  { id: 'gk_so_nganh_xa', name: 'Giấy khen của Thủ trưởng Sở, ban, ngành, UB MTTQ tỉnh, Chủ tịch UBND cấp xã', score: 13 },
  { id: 'gk_sgd', name: 'Giấy khen Sở Giáo dục và Đào tạo', score: 13 },
  { id: 'gk_bannganh', name: 'Giấy khen Ban, ngành, đoàn thể, UB MTTQ tỉnh', score: 13 },
  { id: 'gk_congdoannganh', name: 'Giấy khen Công đoàn ngành Giáo dục', score: 13 },
  { id: 'gk_thanhdoan', name: 'Giấy khen Thành đoàn', score: 13 },
  { id: 'gk_xa', name: 'Giấy khen Chủ tịch UBND cấp xã', score: 13 },

  // Nhóm Bằng khen Đoàn thể cấp tỉnh (Theo yêu cầu: ngang mức Bằng khen UBND Tỉnh - score 10)
  { id: 'bk_ldld_tinhdoan', name: 'Bằng khen LĐLĐ, tỉnh Đoàn (Tương đương Mức 10: Bằng khen cấp Tỉnh)', score: 10 },
  { id: 'bk_ldld', name: 'Bằng khen Liên đoàn Lao động (Tương đương Mức 10: Bằng khen cấp Tỉnh)', score: 10 },
  { id: 'bk_tinhdoan', name: 'Bằng khen Tỉnh đoàn (Tương đương Mức 10: Bằng khen cấp Tỉnh)', score: 10 }
];

// Danh sách các thành tích bổ sung chuẩn hóa (dùng cho Dropdown)
export const OTHER_ACHIEVEMENT_TYPES = [
  { id: 'other_gvdg_tinh', name: 'Chứng nhận Giáo viên dạy giỏi cấp Tỉnh' },
  { id: 'other_gvdg_truong', name: 'Chứng nhận Giáo viên dạy giỏi cấp Trường' },
  { id: 'other_gvcng_tinh', name: 'Chứng nhận Giáo viên chủ nhiệm lớp giỏi cấp Tỉnh' },
  { id: 'other_gvcng_truong', name: 'Chứng nhận Giáo viên chủ nhiệm lớp giỏi cấp Trường' },
  { id: 'other_skkn_tinh', name: 'Sáng kiến kinh nghiệm cấp Tỉnh' },
  { id: 'other_gk_hieu_truong', name: 'Giấy khen của Hiệu trưởng' },
  { id: 'other_gk_cd_truong', name: 'Giấy khen của Công đoàn Trường' },
  { id: 'other_gk_doan_truong', name: 'Giấy khen của Đoàn Thanh niên Trường' },
  { id: 'khac', name: 'Thành tích khác (Tự nhập tay)' }
];
