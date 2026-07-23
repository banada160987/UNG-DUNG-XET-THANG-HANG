import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ACHIEVEMENT_LEVELS } from '../data/config';

export const exportStatisticsExcel = async (candidates) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Danh sách');
  const sheet2 = workbook.addWorksheet('Chi tiết Thành tích khác');

  // Set default font
  workbook.eachSheet((worksheet) => {
    worksheet.properties.defaultRowHeight = 20;
  });

  // --- SHEET 1 CONFIG ---
  // Headers layout (Row 4 & Row 5)
  // Row 4 is primary header, Row 5 is sub header.
  
  const headersR4 = [
    'Stt', // A
    'Họ và tên', // B
    'Ngày tháng năm sinh', // C (Nam), D (Nữ)
    '', // D (merged with C)
    'Chức vụ, chức danh', // E
    'Trình độ chuyên môn', // F
    'Chứng chỉ bồi dưỡng tiêu chuẩn CDNN, hành nghề', // G
    'Ngày tuyển dụng', // H
    'Thời gian tập sự', // I
    'Thời gian giữ chức danh nghề nghiệp (kể cả tương đương)', // J
    'Ngày bổ nhiệm ngạch, CDNN hiện giữ', // K
    'Kết quả xếp loại viên chức trong thời gian tính để xét thăng hạng', // L
    'Chức danh nghề nghiệp, ngạch, lương hiện giữ', // M, N, O, P, Q
    '', '', '', '', 
    'Đăng ký thăng hạng', // R, S
    '',
    'Thành tích đạt được', // T to AI
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'Ghi chú' // AJ
  ];

  const headersR5 = [
    'Stt', 'Họ và tên',
    'Nam', 'Nữ',
    'Chức vụ, chức danh',
    'Trình độ chuyên môn',
    'Chứng chỉ bồi dưỡng tiêu chuẩn CDNN, hành nghề',
    'Ngày tuyển dụng',
    'Thời gian tập sự',
    'Thời gian giữ chức danh nghề nghiệp (kể cả tương đương)',
    'Ngày bổ nhiệm ngạch, CDNN hiện giữ',
    'Kết quả xếp loại viên chức trong thời gian tính để xét thăng hạng',
    
    // Chức danh nghề nghiệp... hiện giữ
    'Chức danh nghề nghiệp, ngạch, hạng',
    'Mã số',
    'Bậc lương',
    'Hệ số lương',
    'Nâng lương lần sau tính từ ngày',
    
    // Đăng ký thăng hạng
    'Chức danh nghề nghiệp, ngạch, hạng',
    'Mã số',
    
    // Thành tích
    'Huân chương các loại',
    'Danh hiệu vinh dự nhà nước: Anh hùng Lao động, Nhà giáo Nhân dân...',
    'Giải thưởng Hồ Chí Minh; Giải thưởng Nhà nước',
    'Bằng khen của Thủ tướng Chính phủ',
    'Danh hiệu Chiến sĩ thi đua toàn quốc',
    'Bằng khen của Ban Thường vụ Tỉnh ủy (khen thưởng đột xuất, chuyên đề, hằng năm)',
    'Bằng khen của Bộ, ban, ngành trung ương',
    'Bằng khen của Ủy ban nhân dân tỉnh (khen thưởng thành tích công trạng, đột xuất, phong trào)',
    'Danh hiệu Chiến sĩ thi đua cấp tỉnh',
    'Giấy khen của Ban Thường vụ Đảng ủy xã, phường',
    'Giấy khen của Thủ trưởng Sở, ban, ngành, Ủy ban Mặt trận Tổ quốc Việt Nam tỉnh và tương đương, Chủ tịch Ủy ban nhân dân cấp xã (khen thưởng đột xuất, thành tích công trạng)',
    'Giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi, giáo viên làm Tổng phụ trách Đội Thiếu niên tiền phong Hồ Chí Minh giỏi từ cấp huyện (đối với các quyết định ban hành trước ngày 01/7/2020)',
    'Giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi cấp tỉnh',
    'Giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi cấp trường',
    'Đạt giải trong Hội thi giáo viên dạy giỏi cấp tỉnh',
    'Thành tích khác',
    
    'Ghi chú'
  ];

  const headerRow4 = sheet.getRow(4);
  const headerRow5 = sheet.getRow(5);

  headersR4.forEach((val, idx) => {
    headerRow4.getCell(idx + 1).value = val;
  });
  headersR5.forEach((val, idx) => {
    headerRow5.getCell(idx + 1).value = val;
  });

  // Merging cells
  const mergeKeys = [
    'A', 'B', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'AJ' // These merge Row 4 & 5
  ];
  mergeKeys.forEach(key => {
    sheet.mergeCells(`${key}4:${key}5`);
  });
  
  // Merge groups
  sheet.mergeCells('C4:D4'); // Ngày sinh
  sheet.mergeCells('M4:Q4'); // CDNN hiện giữ
  sheet.mergeCells('R4:S4'); // CDNN đăng ký
  sheet.mergeCells('T4:AI4'); // Thành tích

  // Set column widths
  const colWidths = [
    4, 22, 10, 10, 15, 15, 18, 12, 12, 12, // A - J
    12, 15, 20, 12, 10, 10, 12, 20, 12, // K - S
    10, 12, 12, 12, 12, 15, 15, 15, 12, 12, 15, // T - AD
    15, 12, 12, 12, 12, 15 // AE - AJ
  ];
  colWidths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  // Style headers
  [headerRow4, headerRow5].forEach(row => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.font = { name: 'Times New Roman', bold: true, size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });
  headerRow5.height = 140; // Make enough room for long headers

  // Add titles
  sheet.mergeCells('A1:AJ1');
  const titleCell1 = sheet.getCell('A1');
  titleCell1.value = 'DANH SÁCH VIÊN CHỨC ĐỀ NGHỊ XÉT THĂNG HẠNG CHỨC DANH NGHỀ NGHIỆP';
  titleCell1.font = { name: 'Times New Roman', bold: true, size: 14 };
  titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('A2:AJ2');
  const titleCell2 = sheet.getCell('A2');
  titleCell2.value = '(Kèm theo Công văn số ....../........ ngày ..... tháng ..... năm ....... của .............)';
  titleCell2.font = { name: 'Times New Roman', italic: true, size: 12 };
  titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };

  // --- SHEET 2 CONFIG ---
  sheet2.columns = [
    { header: 'Stt', key: 'stt', width: 8 },
    { header: 'Họ và tên', key: 'name', width: 25 },
    { header: 'Đơn vị / Chức danh', key: 'unit', width: 35 },
    { header: 'Chi tiết thành tích khác', key: 'others', width: 80 }
  ];
  const s2Header = sheet2.getRow(1);
  s2Header.eachCell(cell => {
    cell.font = { name: 'Times New Roman', bold: true, size: 12 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
  let sheet2Index = 1;

  // Process data
  const groupedData = {};
  
  candidates.forEach(c => {
    if (!c.targetTitle) return;
    const t = c.targetTitle.toLowerCase();
    let groupKey = '';
    if (t.includes('ii') || t.includes('2')) {
      groupKey = 'Đăng ký xét thăng hạng từ hạng III lên hạng II';
    } else if (t.includes('i') || t.includes('1')) {
      groupKey = 'Đăng ký xét thăng hạng từ hạng II lên hạng I';
    } else {
      groupKey = `Đăng ký xét thăng hạng lên ${c.targetTitle}`;
    }

    if (!groupedData[groupKey]) groupedData[groupKey] = [];
    groupedData[groupKey].push(c);
  });

  const getRankCode = (title) => {
    if (!title) return '';
    const t = title.toLowerCase();
    if (t.includes('hạng iii') || t.includes('hạng 3')) return 'V.07.05.15';
    if (t.includes('hạng ii') || t.includes('hạng 2')) return 'V.07.05.14';
    if (t.includes('hạng i') || t.includes('hạng 1')) return 'V.07.05.13';
    return '';
  };
  
  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Add school header
  const schoolRow = sheet.addRow(['Trường THPT Cao Bá Quát']);
  sheet.mergeCells(`A${schoolRow.number}:AJ${schoolRow.number}`);
  schoolRow.getCell(1).font = { name: 'Times New Roman', bold: true, color: { argb: 'FFFF0000' } };
  schoolRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  schoolRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  
  Object.keys(groupedData).forEach(groupName => {
    const groupRow = sheet.addRow([groupName]);
    sheet.mergeCells(`A${groupRow.number}:AJ${groupRow.number}`);
    groupRow.getCell(1).font = { name: 'Times New Roman', bold: true, color: { argb: 'FFFF0000' } };
    groupRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    let groupStt = 1;
    groupedData[groupName].forEach(c => {
      const allAch = [...(c.achievements||[]), ...(c.otherAchievements||[])];
      const usedIndices = new Set();
      
      const count = (ids) => {
        if (!Array.isArray(ids)) ids = [ids];
        let cnt = 0;
        allAch.forEach((a, aIdx) => {
          if (!usedIndices.has(aIdx) && ids.includes(a.id)) {
            cnt++;
            usedIndices.add(aIdx);
          }
        });
        return cnt > 0 ? cnt : '';
      };

      // STANDARDIZED COLUMNS
      const huan_chuong = count('huan_chuong');
      const danh_hieu_nn = count('danh_hieu_nn');
      const giai_thuong_hcm = count('giai_thuong_hcm');
      const bk_thu_tuong = count('bk_thu_tuong');
      const cstd_toan_quoc = count('cstd_toan_quoc');
      const bk_tinh_uy = count(['bk_tinh_uy_5nam', 'bk_tinh_uy_dotxuat']);
      const bk_bo_nganh = count('bk_bo_nganh');
      const bk_ubnd_tinh = count('bk_ubnd_tinh');
      const cstd_cap_tinh = count('cstd_cap_tinh');
      const gk_dang_uy_xa = count('gk_dang_uy_xa');
      const gk_so_nganh_xa = count(['gk_so_nganh_xa', 'gk_sgd', 'gk_bannganh', 'gk_xa', 'bk_ldld_tinhdoan', 'bk_ldld', 'bk_tinhdoan']);
      
      const cstd_co_so = count('cstd_co_so'); // Extra? Mẫu ko có CSTĐ Cơ Sở ở nhóm ngoài. Nó có thể nằm trong "Thành tích khác" nếu ko có cột.
      
      // OTHER TEACHING ACHIEVEMENTS
      let gvdg_huyen = 0;
      let gvdg_tinh = 0;
      let gvdg_truong = 0;
      let dat_giai_tinh = 0;
      let th_khac_list = [];

      allAch.forEach((ach, aIdx) => {
        if (usedIndices.has(aIdx)) return;
        
        const name = (ach.id || '').toLowerCase();
        
        if ((name.includes('giải') && name.includes('tỉnh')) || (name.includes('hội thi') && name.includes('tỉnh'))) {
          dat_giai_tinh++;
          usedIndices.add(aIdx);
        }
        else if (name.includes('huyện')) {
          gvdg_huyen++;
          usedIndices.add(aIdx);
        }
        else if (name.includes('cấp tỉnh') || name.includes('tỉnh')) {
          gvdg_tinh++;
          usedIndices.add(aIdx);
        }
        else if (name.includes('trường')) {
          gvdg_truong++;
          usedIndices.add(aIdx);
        }
        else {
          th_khac_list.push('- ' + ach.id + (ach.year ? ` (${ach.year})` : ''));
        }
      });
      
      // Also add CSTĐ Cơ sở to "thành tích khác" if it's not mapped to a specific column
      if (cstd_co_so > 0) {
        th_khac_list.push(`- Danh hiệu Chiến sĩ thi đua cơ sở (${cstd_co_so} lần)`);
      }

      // Format degree
      const maxDegree = (c.degrees || []).reduce((highest, curr) => {
        const levels = ['Trung cấp', 'Đại học', 'Thạc sĩ', 'Tiến sĩ'];
        if (levels.indexOf(curr.level) > levels.indexOf(highest)) return curr.level;
        return highest;
      }, (c.degrees || [])[0]?.level || '');

      const certText = (c.certificates && c.certificates.length > 0) ? 'X' : '';
      
      const isMale = c.gender === 'Nam';
      const isFemale = c.gender === 'Nữ';
      
      // ROW DATA MATCHING 36 COLUMNS
      const rowData = [
        groupStt++, // A
        c.fullName, // B
        isMale ? formatDateString(c.dob) : '', // C
        isFemale ? formatDateString(c.dob) : '', // D
        c.unit || 'Giáo viên', // E
        maxDegree, // F
        certText, // G
        formatDateString(c.decisionRecruitment?.date), // H
        '', // I - Thời gian tập sự (thường để trống để tự điền hoặc tính)
        '', // J - Thời gian giữ chức danh
        formatDateString(c.decisionAppointment?.date), // K
        c.ratingSheets ? 'HTTNV trở lên' : '', // L
        
        c.currentTitle, // M
        getRankCode(c.currentTitle), // N
        '', // O - Bậc lương
        '', // P - Hệ số lương
        formatDateString(c.decisionSalary?.date), // Q
        
        c.targetTitle, // R
        getRankCode(c.targetTitle), // S
        
        huan_chuong, // T
        danh_hieu_nn, // U
        giai_thuong_hcm, // V
        bk_thu_tuong, // W
        cstd_toan_quoc, // X
        bk_tinh_uy, // Y
        bk_bo_nganh, // Z
        bk_ubnd_tinh, // AA
        cstd_cap_tinh, // AB
        gk_dang_uy_xa, // AC
        gk_so_nganh_xa, // AD
        gvdg_huyen || '', // AE
        gvdg_tinh || '', // AF
        gvdg_truong || '', // AG
        dat_giai_tinh || '', // AH
        
        th_khac_list.length > 0 ? th_khac_list.length : '', // AI - SL Thành tích khác
        c.note || '' // AJ
      ];

      const row = sheet.addRow(rowData);
      
      row.eachCell({ includeEmpty: true }, cell => {
        cell.font = { name: 'Times New Roman', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: cell.col === 2 ? 'left' : 'center', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      
      if (th_khac_list.length > 0) {
        sheet2.addRow({
          stt: sheet2Index++,
          name: c.fullName,
          unit: c.unit,
          others: th_khac_list.join('\n')
        }).eachCell(cell => {
          cell.font = { name: 'Times New Roman', size: 11 };
          cell.alignment = { vertical: 'middle', wrapText: true };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `DanhSachXetThangHang_BaoCaoSo.xlsx`);
};