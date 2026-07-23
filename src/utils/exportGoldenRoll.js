import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { ACHIEVEMENT_LEVELS } from '../data/config';

// Helper to create TextRun
const createText = (text, bold = false, italic = false, size = 26, color = "000000") => {
  const safeText = (text === undefined || text === null || String(text).trim() === "") ? " " : String(text);
  return new TextRun({ text: safeText, bold, italic, size, font: "Times New Roman", color });
};

// Helper to create Paragraph
const createPara = (children, alignment = AlignmentType.LEFT, spacing = { before: 60, after: 60, line: 240 }) => 
  new Paragraph({ children, alignment, spacing });

// Helper to create Cell
const createCell = (children, widthPercent, bold = false, align = AlignmentType.LEFT, valign = VerticalAlign.CENTER) => {
  return new TableCell({
    children: [createPara(children, align)],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    verticalAlign: valign,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });
};

// Helper to create Cell with multiple paragraphs
const createMultiParaCell = (paras, widthPercent, valign = VerticalAlign.CENTER) => {
  return new TableCell({
    children: paras.length > 0 ? paras : [createPara([createText(" ")])],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    verticalAlign: valign,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });
};

export const exportGoldenRollWord = async (candidates, unitName = "Toàn trường") => {
  try {
    // 1. Lọc và sắp xếp ứng viên
    const eligibleCandidates = candidates
      .filter(c => ['admin_approved', 'ranked', 'finalized'].includes(c.status))
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    // 2. Tạo nội dung Header bảng vàng
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 }, // 2cm, 2cm, 2cm, 3cm
          },
        },
        children: [
          // Header Quốc hiệu - Tiêu ngữ
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
              insideHorizontal: { style: BorderStyle.NONE, size: 0 },
              insideVertical: { style: BorderStyle.NONE, size: 0 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      createPara([createText("SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐẮK LẮK", false, false, 26)], AlignmentType.CENTER),
                      createPara([createText("TRƯỜNG THPT CAO BÁ QUÁT", true, false, 26)], AlignmentType.CENTER),
                      createPara([createText("-------", true, false, 26)], AlignmentType.CENTER, { before: 0, after: 0, line: 240 }),
                    ],
                    width: { size: 45, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      createPara([createText("CỘNG HÒA XÝHỘI CHỦ NGHĨA VIỆT NAM", true, false, 26)], AlignmentType.CENTER),
                      createPara([createText("Độc lập - Tự do - Hạnh phúc", true, false, 26)], AlignmentType.CENTER),
                      createPara([createText("---------------", true, false, 26)], AlignmentType.CENTER, { before: 0, after: 0, line: 240 }),
                    ],
                    width: { size: 55, type: WidthType.PERCENTAGE },
                  })
                ]
              })
            ]
          }),

          createPara([createText(" ")], AlignmentType.CENTER),
          
          // Tiêu đề chính
          createPara([createText("BẢNG VÀNG DANH DỰ", true, false, 36, "FF0000")], AlignmentType.CENTER),
          createPara([createText("VINH DANH CÁC CÁ NHÂN CÓ THÀNH TÍCH XUẤT SẮC TRONG CÔNG TÁC XÉT THĂNG HẠNG", true, false, 28, "0000FF")], AlignmentType.CENTER),
          createPara([createText(`Đơn vị: ${unitName}`, false, true, 26)], AlignmentType.CENTER),
          
          createPara([createText(" ")], AlignmentType.CENTER),

          // Bảng danh sách
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  createCell([createText("Vị thứ", true, false, 26)], 8, true, AlignmentType.CENTER),
                  createCell([createText("Họ và tên", true, false, 26)], 22, true, AlignmentType.CENTER),
                  createCell([createText("Đơn vị", true, false, 26)], 15, true, AlignmentType.CENTER),
                  createCell([createText("Chức danh đang giữ", true, false, 26)], 15, true, AlignmentType.CENTER),
                  createCell([createText("Điểm", true, false, 26)], 8, true, AlignmentType.CENTER),
                  createCell([createText("Thành tích nổi bật", true, false, 26)], 32, true, AlignmentType.CENTER),
                ],
                tableHeader: true
              }),
              // Data Rows
              ...eligibleCandidates.map((c, index) => {
                // Thu thập thành tích
                const achList = [];
                
                // Thành tích chính
                if (c.achievements && c.achievements.length > 0) {
                  c.achievements.forEach(ach => {
                    const official = ACHIEVEMENT_LEVELS.find(l => l.id === ach.id);
                    achList.push(`- ${official ? official.name : ach.id} (${ach.decisionNo})`);
                  });
                }
                
                // Thành tích khác
                if (c.otherAchievements && c.otherAchievements.length > 0) {
                  c.otherAchievements.forEach(ach => {
                    const name = ach.name || ach.id;
                    achList.push(`- ${name} (${ach.decisionNo})`);
                  });
                }

                // Nếu không có thành tích nào
                if (achList.length === 0) {
                  achList.push("- Không có thành tích");
                }

                const achParas = achList.map(text => createPara([createText(text, false, false, 22)], AlignmentType.LEFT, { before: 20, after: 20, line: 240 }));

                return new TableRow({
                  children: [
                    createCell([createText((index + 1).toString(), true, false, 26, "FF0000")], 8, false, AlignmentType.CENTER),
                    createCell([createText(c.fullName, true, false, 26)], 22, false, AlignmentType.LEFT),
                    createCell([createText(c.unit, false, false, 26)], 15, false, AlignmentType.CENTER),
                    createCell([createText(c.currentTitle, false, false, 26)], 15, false, AlignmentType.CENTER),
                    createCell([createText((c.score || 0).toString(), true, false, 26, "0000FF")], 8, false, AlignmentType.CENTER),
                    createMultiParaCell(achParas, 32, VerticalAlign.CENTER),
                  ]
                });
              })
            ]
          }),
          
          createPara([createText(" ")], AlignmentType.CENTER),
          
          // Chữ ký
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
              insideHorizontal: { style: BorderStyle.NONE, size: 0 },
              insideVertical: { style: BorderStyle.NONE, size: 0 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [createPara([createText(" ")], AlignmentType.CENTER)],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      createPara([createText(`Đắk Lắk, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`, false, true, 26)], AlignmentType.CENTER),
                      createPara([createText("HIỆU TRƯỞNG", true, false, 26)], AlignmentType.CENTER),
                      createPara([createText(" ")], AlignmentType.CENTER),
                      createPara([createText(" ")], AlignmentType.CENTER),
                      createPara([createText(" ")], AlignmentType.CENTER),
                      createPara([createText(" ")], AlignmentType.CENTER),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  })
                ]
              })
            ]
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Bang_Vang_Danh_Du_${new Date().getTime()}.docx`);

  } catch (error) {
    console.error("Lỗi khi xuất Bảng vàng:", error);
    alert("Đã xảy ra lỗi khi tạo file Word Bảng vàng. Vui lòng kiểm tra lại console.");
  }
};
