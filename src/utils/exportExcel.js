import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ACHIEVEMENT_LEVELS } from '../data/config';

const STATUS_MAP = {
  'draft': 'Nháp / Đang cập nhật',
  'submitted_to_head': 'Chờ Tổ trưởng duyệt',
  'head_approved': 'Tổ trưởng đã duyệt',
  'head_rejected': 'Tổ trưởng yêu cầu bổ sung',
  'admin_reviewing': 'Đang rà soát',
  'admin_approved': 'Đủ điều kiện',
  'admin_rejected': 'Không đủ điều kiện',
  'returned': 'Thư ký yêu cầu bổ sung',
  'ranked': 'Đã xếp hạng',
  'finalized': 'Hoàn tất'
};

export const exportStatisticsExcel = (candidates, unitName = "Toàn trường") => {
  // Map data to Excel rows
  const data = candidates.map((c, index) => {
    
    // Đếm thành tích
    let countUbnd = 0;
    let countLdld = 0;
    let countTinhDoan = 0;
    let countCstdTinh = 0;
    let countCstdCs = 0;
    let countGkSgd = 0;
    let countGkBanNganh = 0;
    
    // Tương thích ngược (Legacy)
    let countLegacyLdldTinhDoan = 0;
    let countLegacySgdBanNganh = 0;

    const mainAchList = [];
    if (c.achievements && c.achievements.length > 0) {
      c.achievements.forEach(ach => {
        const official = ACHIEVEMENT_LEVELS.find(l => l.id === ach.id);
        const name = official ? official.name : ach.id;
        mainAchList.push(`${name} (${ach.decisionNo || ''})`);

        // Matrix counters
        if (['bk_ubnd_tinh', 'bk_thu_tuong', 'bk_tinh_uy_5nam', 'bk_bo_nganh', 'bk_tinh_uy_dotxuat'].includes(ach.id)) countUbnd++;
        if (ach.id === 'bk_ldld') countLdld++;
        if (ach.id === 'bk_tinhdoan') countTinhDoan++;
        if (ach.id === 'bk_ldld_tinhdoan') countLegacyLdldTinhDoan++;
        if (['cstd_toan_quoc', 'cstd_cap_tinh'].includes(ach.id)) countCstdTinh++;
        if (ach.id === 'cstd_co_so') countCstdCs++;
        if (ach.id === 'gk_sgd') countGkSgd++;
        if (['gk_bannganh', 'gk_dang_uy_xa', 'gk_xa'].includes(ach.id)) countGkBanNganh++;
        if (ach.id === 'gk_so_nganh_xa') countLegacySgdBanNganh++;
      });
    }

    // Đếm thành tích khác (GVDG, GVCNG)
    let countGvdg = 0;
    let countGvcng = 0;
    const otherAchList = [];
    if (c.otherAchievements && c.otherAchievements.length > 0) {
      c.otherAchievements.forEach(ach => {
        const name = ach.name || ach.id || '';
        otherAchList.push(`${name} (${ach.decisionNo || ''})`);
        
        const nameLower = name.toLowerCase();
        if (nameLower.includes('dạy giỏi') || nameLower.includes('gvdg')) countGvdg++;
        if (nameLower.includes('chủ nhiệm') || nameLower.includes('gvcng')) countGvcng++;
      });
    }

    // Bằng cấp, chứng chỉ
    const certList = [];
    if (c.certificates && c.certificates.length > 0) {
      c.certificates.forEach(cert => {
        certList.push(`${cert.name} (${cert.year})`);
      });
    }
    const degList = [];
    if (c.degrees && c.degrees.length > 0) {
      c.degrees.forEach(deg => {
        degList.push(`${deg.level} - ${deg.major} (${deg.year})`);
      });
    }

    return {
      "STT": index + 1,
      "Họ và tên": c.fullName,
      "Ngáy sinh": c.dob || "",
      "Đơn vị": c.unit || "",
      "Chức danh đang giữ": c.currentTitle || "",
      "Điểm xét duyệt": c.score || 0,
      "Trạng thái": STATUS_MAP[c.status] || c.status,
      
      // Các cột ma trận
      "BK UBND/Bộ": countUbnd > 0 ? countUbnd : "",
      "BK LĐLĐ": countLdld > 0 || countLegacyLdldTinhDoan > 0 ? (countLdld || countLegacyLdldTinhDoan) : "",
      "BK Tỉnh đoàn": countTinhDoan > 0 ? countTinhDoan : "",
      "CSTĐ Tỉnh": countCstdTinh > 0 ? countCstdTinh : "",
      "CSTĐ Cơ sở": countCstdCs > 0 ? countCstdCs : "",
      "GK Sở GD": countGkSgd > 0 || countLegacySgdBanNganh > 0 ? (countGkSgd || countLegacySgdBanNganh) : "",
      "GK Ban Ngành": countGkBanNganh > 0 ? countGkBanNganh : "",
      "GVDG": countGvdg > 0 ? countGvdg : "",
      "GVCNG": countGvcng > 0 ? countGvcng : "",
      
      "Chi tiết TT chính": mainAchList.join('\n'),
      "Chi tiết TT khác": otherAchList.join('\n'),
      "Bằng cấp chuyên môn": degList.join('\n'),
      "Chứng chỉ bồi dưỡng": certList.join('\n'),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Đặt chiều rộng cột (Column Widths)
  const colWidths = [
    { wch: 5 },   // STT
    { wch: 25 },  // Họ và tên
    { wch: 12 },  // Ngày sinh
    { wch: 20 },  // Đơn vị
    { wch: 25 },  // Chức danh
    { wch: 10 },  // Điểm số
    { wch: 20 },  // Trạng thái
    { wch: 12 },  // BK UBND
    { wch: 10 },  // BK LĐLĐ
    { wch: 12 },  // BK Tỉnh đoàn
    { wch: 10 },  // CSTĐ Tỉnh
    { wch: 10 },  // CSTĐ CS
    { wch: 10 },  // GK Sở GD
    { wch: 12 },  // GK Ban Ngành
    { wch: 10 },  // GVDG
    { wch: 10 },  // GVCNG
    { wch: 30 },  // TT chính
    { wch: 30 },  // TT khác
    { wch: 20 },  // Bằng cấp
    { wch: 20 }   // Chứng chỉ
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSach");
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  saveAs(dataBlob, `ThongKe_XetThangHang_${unitName.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
};
