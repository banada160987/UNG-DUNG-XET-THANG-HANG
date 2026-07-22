import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export const exportStatisticsExcel = async (candidates) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Danh sách');

  // Set default font
  sheet.properties.defaultRowHeight = 25;

  // Header rows
  sheet.mergeCells('A1:F1');
  sheet.getCell('A1').value = {
    richText: [
      { font: { name: 'Times New Roman', size: 11 }, text: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐẮK LẮK\n' },
      { font: { name: 'Times New Roman', size: 11, bold: true, underline: true }, text: 'ĐƠN VỊ: TRƯỜNG THPT CAO BÁ QUÁT' }
    ]
  };
  sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  sheet.mergeCells('N1:W1');
  sheet.getCell('N1').value = {
    richText: [
      { font: { name: 'Times New Roman', size: 11, bold: true }, text: 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM\n' },
      { font: { name: 'Times New Roman', size: 12, bold: true, underline: true }, text: 'Độc lập - Tự do - Hạnh phúc' }
    ]
  };
  sheet.getCell('N1').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  sheet.mergeCells('A2:W2');
  sheet.getCell('A2').value = 'DANH SÁCH VIÊN CHỨC ĐĂNG KÝ THĂNG HẠNG CHỨC DANH NGHỀ NGHIỆP VIÊN CHỨC NĂM 2026';
  sheet.getCell('A2').font = { name: 'Times New Roman', bold: true, size: 12 };
  sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('A3:W3');
  sheet.getCell('A3').value = '(Kèm theo Công văn số ......../SGDĐT-TCCB ngày .../.../2026 của Sở Giáo dục và Đào tạo)';
  sheet.getCell('A3').font = { name: 'Times New Roman', italic: true, size: 11 };
  sheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

  // Define Columns and Headers
  const headerRow4 = sheet.getRow(4);
  const headerRow5 = sheet.getRow(5);

  const columns = [
    { header: 'Stt', key: 'stt', width: 5 },
    { header: 'Họ và tên', key: 'name', width: 22 },
    { header: 'Nam', key: 'dob_nam', width: 12 },
    { header: 'Nữ', key: 'dob_nu', width: 12 },
    { header: 'Chức vụ, chức danh', key: 'jobTitle', width: 15 },
    { header: 'Huân chương các loại', key: 'huan_chuong', width: 10 },
    { header: 'Danh hiệu vinh dự nhà nước: Anh hùng Lao động, Nhà giáo Nhân dân...', key: 'danh_hieu_nn', width: 12 },
    { header: 'Giải thưởng Hồ Chí Minh; Giải thưởng Nhà nước', key: 'giai_thuong_hcm', width: 12 },
    { header: 'Danh hiệu Chiến sĩ thi đua toàn quốc', key: 'cstd_toan_quoc', width: 12 },
    { header: 'Bằng khen của Thủ tướng Chính phủ', key: 'bk_thu_tuong', width: 12 },
    { header: 'Danh hiệu Chiến sĩ thi đua cấp tỉnh', key: 'cstd_cap_tinh', width: 12 },
    { header: 'Bằng khen của Ban Thường vụ Tỉnh uỷ (khen thưởng đột xuất, chuyên đề, hàng năm)', key: 'bk_tinh_uy', width: 15 },
    { header: 'Bằng khen của Bộ, ban, ngành trung ương', key: 'bk_bo_nganh', width: 15 },
    { header: 'Bằng khen của Uỷ ban nhân dân tỉnh (khen thưởng thành tích công trạng, đột xuất, phong trào)', key: 'bk_ubnd_tinh', width: 15 },
    { header: 'Danh hiệu Chiến sĩ thi đua cơ sở', key: 'cstd_co_so', width: 12 },
    { header: 'Giấy khen của Ban Thường vụ Đảng ủy xã, phường', key: 'gk_dang_uy_xa', width: 12 },
    { header: 'Giấy khen của Thủ trưởng Sở, ban, ngành, Uỷ ban Mặt trận Tổ quốc Việt Nam tỉnh và tương đương, Chủ tịch Uỷ ban nhân dân cấp xã...', key: 'gk_so_nganh_xa', width: 15 },
    { header: 'Giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi từ cấp tỉnh', key: 'gvdg_tinh', width: 12 },
    { header: 'Giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi... cấp huyện', key: 'gvdg_huyen', width: 12 },
    { header: 'Giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi cấp trường', key: 'gvdg_truong', width: 12 },
    { header: 'Đạt giải trong Hội thi giáo viên dạy giỏi cấp tỉnh', key: 'gvdg_giai_tinh', width: 12 },
    { header: 'Thành tích khác', key: 'other', width: 15 },
    { header: 'Ghi chú', key: 'note', width: 10 },
  ];

  sheet.columns = columns.map(c => ({ key: c.key, width: c.width }));

  // Set values
  columns.forEach((col, index) => {
    const colNumber = index + 1;
    if (col.key === 'dob_nam') {
      headerRow5.getCell(colNumber).value = 'Nam';
    } else if (col.key === 'dob_nu') {
      headerRow5.getCell(colNumber).value = 'Nữ';
    } else {
      headerRow4.getCell(colNumber).value = col.header;
    }
  });

  sheet.mergeCells('C4:D4');
  headerRow4.getCell(3).value = 'Ngày tháng năm sinh';

  // Merge vertical for others
  const mergeKeys = ['A', 'B', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
  mergeKeys.forEach(key => {
    sheet.mergeCells(`${key}4:${key}5`);
  });

  // Style headers
  [headerRow4, headerRow5].forEach(row => {
    row.eachCell(cell => {
      cell.font = { name: 'Times New Roman', bold: true, size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });
  
  headerRow4.height = 120;

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

    if (!groupedData[groupKey]) groupedData[groupKey] = { manager: [], staff: [] };
    
    const isManager = ['ban giám hiệu', 'lãnh đạo'].some(k => (c.unit || '').toLowerCase().includes(k));
    if (isManager) {
      groupedData[groupKey].manager.push(c);
    } else {
      groupedData[groupKey].staff.push(c);
    }
  });

  // Add school header
  const schoolRow = sheet.addRow(['Trường THPT Cao Bá Quát']);
  sheet.mergeCells(`A${schoolRow.number}:W${schoolRow.number}`);
  schoolRow.getCell(1).font = { name: 'Times New Roman', bold: true, color: { argb: 'FFFF0000' } };
  schoolRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  schoolRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  
  Object.keys(groupedData).forEach(groupName => {
    const groupRow = sheet.addRow([groupName]);
    sheet.mergeCells(`A${groupRow.number}:W${groupRow.number}`);
    groupRow.getCell(1).font = { name: 'Times New Roman', bold: true, color: { argb: 'FFFF0000' } };
    groupRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    const renderCandidates = (list, title) => {
      if (list.length === 0) return;
      const titleRow = sheet.addRow([title]);
      sheet.mergeCells(`A${titleRow.number}:W${titleRow.number}`);
      titleRow.getCell(1).font = { name: 'Times New Roman', bold: true };
      titleRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      list.forEach((c, idx) => {
        const allAch = [...(c.achievements||[]), ...(c.otherAchievements||[])];
        const count = (ids) => {
          if (!Array.isArray(ids)) ids = [ids];
          let cnt = 0;
          allAch.forEach(a => {
            if (ids.includes(a.id)) cnt++;
          });
          return cnt > 0 ? cnt : '';
        };

        const cnt_tinh_uy = count(['bk_tinh_uy_5nam', 'bk_tinh_uy_dotxuat']);
        const cnt_gk_so = count(['gk_so_nganh_xa', 'gk_sgd', 'gk_bannganh', 'gk_xa']);
        
        let gvdg_tinh = '';
        let gvdg_huyen = '';
        let gvdg_truong = '';
        let gvdg_giai_tinh = '';

        allAch.forEach(a => {
           const name = (a.name || '').toLowerCase();
           if (name.includes('giáo viên dạy giỏi') || name.includes('chủ nhiệm') || name.includes('tổng phụ trách')) {
              if (name.includes('tỉnh')) gvdg_tinh = 'x';
              if (name.includes('huyện') || name.includes('thành phố')) gvdg_huyen = 'x';
              if (name.includes('trường')) gvdg_truong = 'x';
           }
        });

        let dob = '';
        if (c.dob) {
           try {
              dob = format(new Date(c.dob), 'dd/MM/yyyy');
           } catch(e) {}
        }
        
        const rowData = {
          stt: idx + 1,
          name: (c.fullName || c.name || '').toUpperCase(),
          dob_nam: c.gender === 'Nam' ? dob : '',
          dob_nu: c.gender === 'Nữ' ? dob : '',
          jobTitle: c.currentTitle,
          huan_chuong: count('huan_chuong'),
          danh_hieu_nn: count('danh_hieu_nn'),
          giai_thuong_hcm: count('giai_thuong_hcm'),
          cstd_toan_quoc: count('cstd_toan_quoc'),
          bk_thu_tuong: count('bk_thu_tuong'),
          cstd_cap_tinh: count('cstd_cap_tinh'),
          bk_tinh_uy: cnt_tinh_uy,
          bk_bo_nganh: count('bk_bo_nganh'),
          bk_ubnd_tinh: count('bk_ubnd_tinh'),
          cstd_co_so: count('cstd_co_so'),
          gk_dang_uy_xa: count('gk_dang_uy_xa'),
          gk_so_nganh_xa: cnt_gk_so,
          gvdg_tinh,
          gvdg_huyen,
          gvdg_truong,
          gvdg_giai_tinh,
          other: '',
          note: ''
        };
        const r = sheet.addRow(rowData);
        r.eachCell(cell => {
           cell.font = { name: 'Times New Roman', size: 11 };
           cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
           cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        r.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    };

    renderCandidates(groupedData[groupName].manager, 'VIÊN CHỨC QUẢN LÝ');
    renderCandidates(groupedData[groupName].staff, 'VIÊN CHỨC KHÔNG QUẢN LÝ');
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'ThongKeXetThangHang.xlsx');
};
