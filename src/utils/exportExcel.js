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
    
    // Xử lý thành tích chính
    const mainAchList = [];
    if (c.achievements && c.achievements.length > 0) {
      c.achievements.forEach(ach => {
        const official = ACHIEVEMENT_LEVELS.find(l => l.id === ach.id);
        const name = official ? official.name : ach.id;
        mainAchList.push(`${name} (${ach.decisionNo})`);
      });
    }

    // Xử lý thành tích khác
    const otherAchList = [];
    if (c.otherAchievements && c.otherAchievements.length > 0) {
      c.otherAchievements.forEach(ach => {
        const name = ach.name || ach.id;
        otherAchList.push(`${name} (${ach.decisionNo})`);
      });
    }

    // Xử lý chứng chỉ, bằng cấp
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
      "CCCD": c.cccd,
      "Ngày sinh": c.dob || "",
      "Giới tính": c.gender === 'male' ? 'Nam' : c.gender === 'female' ? 'Nữ' : c.gender || '',
      "Đơn vị": c.unit || "",
      "Số điện thoại": c.phone || "",
      "Chức danh đang giữ": c.currentTitle || "",
      "Chức danh đăng ký": c.targetTitle || "",
      "Điểm số": c.score || 0,
      "Trạng thái hồ sơ": STATUS_MAP[c.status] || c.status,
      "Thành tích chính": mainAchList.join('\n'),
      "Thành tích khác": otherAchList.join('\n'),
      "Bằng cấp chuyên môn": degList.join('\n'),
      "Chứng chỉ bồi dưỡng": certList.join('\n'),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Đặt chiều rộng cột (Column Widths)
  const colWidths = [
    { wch: 5 },   // STT
    { wch: 25 },  // Họ và tên
    { wch: 15 },  // CCCD
    { wch: 12 },  // Ngày sinh
    { wch: 10 },  // Giới tính
    { wch: 20 },  // Đơn vị
    { wch: 15 },  // Số điện thoại
    { wch: 25 },  // Chức danh đang giữ
    { wch: 25 },  // Chức danh đăng ký
    { wch: 10 },  // Điểm số
    { wch: 25 },  // Trạng thái hồ sơ
    { wch: 40 },  // Thành tích chính
    { wch: 40 },  // Thành tích khác
    { wch: 30 },  // Bằng cấp
    { wch: 30 }   // Chứng chỉ
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
