import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign, PageOrientation } from 'docx';
import { saveAs } from 'file-saver';
import { ACHIEVEMENT_LEVELS, OTHER_ACHIEVEMENT_TYPES } from '../data/config';

// Helper to create TextRun
const createText = (text, bold = false, italic = false, size = 22, color = "000000") => {
  const safeText = (text === undefined || text === null || String(text).trim() === "") ? " " : String(text);
  return new TextRun({ text: safeText, bold, italic, size, font: "Times New Roman", color });
};

// Helper to create Paragraph
const createPara = (children, alignment = AlignmentType.CENTER, spacing = { before: 60, after: 60, line: 240 }) => 
  new Paragraph({ children, alignment, spacing });

// Helper to create Cell
const createCell = (children, widthPercent, bold = false, align = AlignmentType.CENTER, valign = VerticalAlign.CENTER, rowSpan = 1, columnSpan = 1) => {
  return new TableCell({
    children: [createPara(children, align)],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    verticalAlign: valign,
    rowSpan,
    columnSpan,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });
};

// Helper to create multi-paragraph cell for lists
const createMultiParaCell = (paras, widthPercent, valign = VerticalAlign.CENTER, rowSpan = 1, columnSpan = 1) => {
  return new TableCell({
    children: paras.length > 0 ? paras : [createPara([createText("")])],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    verticalAlign: valign,
    rowSpan,
    columnSpan,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });
};

const textIncludes = (obj, keywords) => {
  const text = typeof obj === 'string' ? obj : ((obj.id || '') + ' ' + (obj.name || ''));
  const lower = text.toLowerCase().normalize('NFC');
  return keywords.some(k => lower.includes(k.toLowerCase().normalize('NFC')));
};

export const exportStatisticsWord = async (candidates, unitName = "Toàn trường") => {
  try {
    const table1Rows = [];
    const table2Rows = [];
    const table3Rows = [];
    const table4Rows = [];

    // Header logic for Tables
    // TABLE 1
    table1Rows.push(new TableRow({
      children: [
        createCell([createText("Stt", true)], 5, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Họ tên", true)], 20, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Sơ yếu\nlí lịch", true)], 8, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Bản\nnhận\nxét", true)], 8, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Phiếu\nđánh\ngiá", true)], 8, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Các\nquyết\nđịnh", true)], 8, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Văn bằng chứng chỉ", true)], 43, true, AlignmentType.CENTER, VerticalAlign.CENTER, 1, 5)
      ]
    }));
    table1Rows.push(new TableRow({
      children: [
        createCell([createText("CCBD\nhạng II", true)], 9),
        createCell([createText("ĐH", true)], 9),
        createCell([createText("Anh\nvăn", true)], 9),
        createCell([createText("Tin học", true)], 8),
        createCell([createText("DTTS", true)], 8)
      ]
    }));

    // TABLE 2
    table2Rows.push(new TableRow({
      children: [
        createCell([createText("Stt", true)], 5, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Họ tên", true)], 20, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("DANH HIỆU THI ĐUA", true)], 75, true, AlignmentType.CENTER, VerticalAlign.CENTER, 1, 8)
      ]
    }));
    table2Rows.push(new TableRow({
      children: [
        createCell([createText("BK\nUBNDT", true)], 9),
        createCell([createText("BK\nLĐTĐT", true)], 9),
        createCell([createText("BK\nTỈNH\nĐOÀN", true)], 10),
        createCell([createText("CSTĐ\nTỈNH", true)], 9),
        createCell([createText("CSTĐ\nCS", true)], 9),
        createCell([createText("GK SỞ\nGIÁO\nDỤC", true)], 10),
        createCell([createText("GK\nBAN,\nNGÀNH", true)], 10),
        createCell([createText("GVDG", true)], 9)
      ]
    }));

    // TABLE 3
    table3Rows.push(new TableRow({
      children: [
        createCell([createText("Stt", true)], 5, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Họ tên", true)], 20, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("DANH HIỆU THI ĐUA", true)], 75, true, AlignmentType.CENTER, VerticalAlign.CENTER, 1, 3)
      ]
    }));
    table3Rows.push(new TableRow({
      children: [
        createCell([createText("GVCNG", true)], 10),
        createCell([createText("SKKN", true)], 25),
        createCell([createText("Khác", true)], 40)
      ]
    }));

    // TABLE 4
    table4Rows.push(new TableRow({
      children: [
        createCell([createText("Stt", true)], 5, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("Họ tên", true)], 20, true, AlignmentType.CENTER, VerticalAlign.CENTER, 2),
        createCell([createText("DANH HIỆU THI ĐUA CẤP TRƯỜNG", true)], 75, true, AlignmentType.CENTER, VerticalAlign.CENTER, 1, 6)
      ]
    }));
    table4Rows.push(new TableRow({
      children: [
        createCell([createText("HT\nKHEN", true)], 10),
        createCell([createText("CĐ\nKHEN", true)], 10),
        createCell([createText("ĐTN\nKHEN", true)], 10),
        createCell([createText("GVDG", true)], 10),
        createCell([createText("GVCNG", true)], 10),
        createCell([createText("Khác", true)], 25)
      ]
    }));

    candidates.forEach((cand, idx) => {
      const stt = (idx + 1).toString();
      const name = (cand.fullName || '').toUpperCase(); // 1) Viết hoa tên

      // T1 Data
      const t1 = {
        resume: cand.resumeDoc ? 'X' : '',
        review: cand.reviewDoc ? 'X' : '',
        eval: cand.ratingSheets ? 'X' : '',
        decision: (cand.decisionRecruitment?.date || cand.decisionProbation?.date || cand.decisionAppointment?.date || cand.decisionSalary?.date) ? 'X' : '',
        ccbd: 'X', // auto
        dh: (cand.degrees || []).some(d => d.level === 'Tiến sĩ') ? 'X(TS)' : (cand.degrees || []).some(d => d.level === 'Thạc sĩ') ? 'X(ThS)' : (cand.degrees || []).some(d => d.level === 'Đại học') ? 'X' : '',
        anh: cand.certLanguage ? 'X' : '',
        tin: cand.certIT ? 'X' : '',
        dtts: cand.certEthnic ? 'X' : ''
      };

      // Achievements counting
      const counts = {
        bk_ubndt: 0, bk_ldld: 0, bk_tinhdoan: 0, cstd_tinh: 0, cstd_cs: 0,
        gk_so: 0, gk_ban: 0, gvdg: 0, gvcng: 0, skkn: [],
        ht_khen: 0, cd_khen: 0, dtn_khen: 0, khac: []
      };

      const mapAchievement = (ach) => {
        const textStr = typeof ach === 'string' ? ach : (ach.id || ach.name || '');
        if (!textStr) return;
        
        // Cập nhật mapping ID chuẩn
        if (['bk_ubnd_tinh', 'bk_ldld_tinhdoan', 'bk_ldld', 'bk_tinhdoan'].includes(ach.id) || textIncludes(ach, ['ubnd tỉnh'])) counts.bk_ubndt++;
        else if (ach.id === 'cstd_cap_tinh' || textIncludes(ach, ['cstđ cấp tỉnh'])) counts.cstd_tinh++;
        else if (ach.id === 'cstd_co_so' || textIncludes(ach, ['cstđ cơ sở'])) counts.cstd_cs++;
        else if (['gk_sgd', 'gk_so_nganh_xa'].includes(ach.id) || textIncludes(ach, ['sở giáo dục'])) counts.gk_so++;
        else if (['gk_bannganh', 'gk_xa', 'gk_dang_uy_xa', 'gk_congdoannganh', 'gk_thanhdoan'].includes(ach.id)) counts.gk_ban++;
        else if (['other_gvdg_tinh', 'other_gvdg_truong'].includes(ach.id) || textIncludes(ach, ['gvdg', 'dạy giỏi'])) counts.gvdg++;
        else if (['other_gvcng_tinh', 'other_gvcng_truong'].includes(ach.id) || textIncludes(ach, ['gvcng', 'chủ nhiệm'])) counts.gvcng++;
        else if (ach.id === 'other_skkn_tinh' || textIncludes(ach, ['skkn', 'sáng kiến'])) counts.skkn.push('Sáng kiến kinh nghiệm cấp Tỉnh');
        else if (ach.id === 'other_gk_hieu_truong' || textIncludes(ach, ['hiệu trưởng', 'trường khen'])) counts.ht_khen++;
        else if (ach.id === 'other_gk_cd_truong' || textIncludes(ach, ['cđ trường', 'công đoàn trường'])) counts.cd_khen++;
        else if (ach.id === 'other_gk_doan_truong' || textIncludes(ach, ['đtn', 'đoàn trường'])) counts.dtn_khen++;
        else {
          const achObj = typeof ach === 'object' ? ACHIEVEMENT_LEVELS.find(lvl => lvl.id === ach.id) : null;
          const otherObj = typeof ach === 'object' ? OTHER_ACHIEVEMENT_TYPES.find(lvl => lvl.id === ach.id) : null;
          if (achObj) counts.khac.push(achObj.name);
          else if (otherObj && otherObj.id !== 'khac') counts.khac.push(otherObj.name);
          else counts.khac.push(textStr);
        }
      };

      (cand.achievements || []).forEach(mapAchievement);
      (cand.otherAchievements || []).forEach(mapAchievement);

      const formatCount = (c) => c > 0 ? c.toString() : '';
      const formatCountX = (c) => c > 0 ? 'X' : '';
      
      // 3) Xuống dòng mỗi danh hiệu bằng cách tạo nhiều Paragraph
      const formatSkknParas = () => counts.skkn.map(k => createPara([createText(`- ${k}`, false, false, 22)], AlignmentType.LEFT));
      const formatKhacParas = () => counts.khac.map(k => createPara([createText(`- ${k}`, false, false, 22)], AlignmentType.LEFT));

      table1Rows.push(new TableRow({
        children: [
          createCell([createText(stt)], 5, true),
          createCell([createText(name, true)], 20, false, AlignmentType.LEFT),
          createCell([createText(t1.resume)], 8),
          createCell([createText(t1.review)], 8),
          createCell([createText(t1.eval)], 8),
          createCell([createText(t1.decision)], 8),
          createCell([createText(t1.ccbd)], 9),
          createCell([createText(t1.dh)], 9),
          createCell([createText(t1.anh)], 9),
          createCell([createText(t1.tin)], 8),
          createCell([createText(t1.dtts)], 8)
        ]
      }));

      table2Rows.push(new TableRow({
        children: [
          createCell([createText(stt)], 5, true),
          createCell([createText(name, true)], 20, false, AlignmentType.LEFT),
          createCell([createText(formatCount(counts.bk_ubndt))], 9),
          createCell([createText(formatCount(counts.bk_ldld))], 9),
          createCell([createText(formatCount(counts.bk_tinhdoan))], 10),
          createCell([createText(formatCount(counts.cstd_tinh))], 9),
          createCell([createText(formatCount(counts.cstd_cs))], 9),
          createCell([createText(formatCount(counts.gk_so))], 10),
          createCell([createText(formatCount(counts.gk_ban))], 10),
          createCell([createText(formatCountX(counts.gvdg))], 9)
        ]
      }));

      // 4) Chuẩn hoá định dạng cho dễ hiểu
      table3Rows.push(new TableRow({
        children: [
          createCell([createText(stt)], 5, true),
          createCell([createText(name, true)], 20, false, AlignmentType.LEFT),
          createCell([createText(formatCountX(counts.gvcng))], 10),
          createMultiParaCell(formatSkknParas(), 25, VerticalAlign.TOP),
          createMultiParaCell(formatKhacParas(), 40, VerticalAlign.TOP)
        ]
      }));

      table4Rows.push(new TableRow({
        children: [
          createCell([createText(stt)], 5, true),
          createCell([createText(name, true)], 20, false, AlignmentType.LEFT),
          createCell([createText(formatCount(counts.ht_khen))], 10),
          createCell([createText(formatCount(counts.cd_khen))], 10),
          createCell([createText(formatCount(counts.dtn_khen))], 10),
          createCell([createText(formatCountX(counts.gvdg))], 10),
          createCell([createText(formatCountX(counts.gvcng))], 10),
          createMultiParaCell(formatKhacParas(), 25, VerticalAlign.TOP)
        ]
      }));
    });

    const createWordTable = (rows) => new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 700, bottom: 700, left: 1000, right: 1000 }
          }
        },
        children: [
          new Paragraph({ children: [createText("THỐNG KÊ MINH CHỨNG XÉT THĂNG HẠNG", true, false, 32)], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
          new Paragraph({ children: [createText(unitName !== "Toàn trường" ? `Tổ ${unitName}` : "Toàn trường", true, false, 28)], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
          createWordTable(table1Rows),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          createWordTable(table2Rows),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          createWordTable(table3Rows),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          createWordTable(table4Rows),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          new Paragraph({
            children: [createText("Người thống kê", true)],
            alignment: AlignmentType.RIGHT,
            indent: { right: 1000 }
          }),
          new Paragraph({
            children: [createText(unitName !== "Toàn trường" ? "TTCM" : "ADMIN", true)],
            alignment: AlignmentType.RIGHT,
            indent: { right: 1200 }
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Thong_Ke_Minh_Chung_${unitName}_${new Date().getFullYear()}.docx`);
    return true;
  } catch (error) {
    console.error("Export Error:", error);
    return false;
  }
};
