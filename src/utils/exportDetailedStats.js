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

export const exportDetailedStatsWord = async (stats, unitName = "Toàn trường") => {
  try {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 }, // 2cm, 2cm, 2cm, 3cm
          },
        },
        children: [
          // Header Nghị định 30
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
                      createPara([createText("SỞ GD&ĐT ĐẮK LẮK", false, false, 26)], AlignmentType.CENTER),
                      createPara([createText("TRƯỜNG THPT CAO BÁ QUÁT", true, false, 26)], AlignmentType.CENTER),
                      createPara([createText("────────", true, false, 26)], AlignmentType.CENTER, { before: 0, after: 0, line: 240 }),
                    ],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      createPara([createText("CỘNG HÒA XÝHỘI CHỦ NGHĨA VIỆT NAM", true, false, 26)], AlignmentType.CENTER),
                      createPara([createText("Độc lập - Tự do - Hạnh phúc", true, false, 28)], AlignmentType.CENTER),
                      createPara([createText("───────────────", true, false, 26)], AlignmentType.CENTER, { before: 0, after: 0, line: 240 }),
                    ],
                    width: { size: 60, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),

          // Date
          createPara([
            createText(`Đắk Lắk, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`, false, true, 28)
          ], AlignmentType.RIGHT, { before: 120, after: 240 }),

          // Title
          createPara([createText("BÁO CÁO", true, false, 32)], AlignmentType.CENTER, { before: 120, after: 120 }),
          createPara([createText("Thống kê chi tiết thành tích đăng ký thăng hạng", true, false, 28)], AlignmentType.CENTER, { before: 0, after: 240 }),

          // Scope
          createPara([createText(`Đơn vị / Phạm vi: ${unitName}`, true, false, 28)]),
          createPara([
            createText(`Tổng số hồ sơ: ${stats.total} | Đã duyệt: ${stats.evaluated} | Chờ duyệt: ${stats.pending} | Tỷ lệ Nữ: ${stats.total > 0 ? Math.round((stats.females / stats.total) * 100) : 0}%`, false, false, 28)
          ], AlignmentType.LEFT, { before: 60, after: 240 }),

          // 1. Thống kê Danh hiệu & Thành tích chuẩn
          createPara([createText("I. Thống kê Danh hiệu & Thành tích chuẩn (Mục VI)", true, false, 28)], AlignmentType.LEFT, { before: 240, after: 120 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell([createText("Tên Danh hiệu / Thành tích", true)], 70, true, AlignmentType.CENTER),
                  createCell([createText("Số lượng", true)], 30, true, AlignmentType.CENTER),
                ],
              }),
              ...ACHIEVEMENT_LEVELS.filter(lvl => stats.officialCount[lvl.id] && stats.officialCount[lvl.id].count > 0).map(lvl => {
                const data = stats.officialCount[lvl.id];
                const userCounts = {};
                data.users.forEach(u => { userCounts[u] = (userCounts[u] || 0) + 1; });
                const usersText = Object.entries(userCounts).map(([u, c]) => `${u} ${c > 1 ? `(${c})` : ''}`).join(', ');

                return new TableRow({
                  children: [
                    createMultiParaCell([
                      createPara([createText(lvl.name, true)]),
                      createPara([createText(usersText, false, true, 24, "555555")]),
                    ], 70),
                    createCell([createText(data.count.toString(), true)], 30, true, AlignmentType.CENTER),
                  ],
                });
              })
            ],
          }),

          // 2. Thống kê Danh hiệu & Thành tích bổ sung
          createPara([createText("II. Thống kê Danh hiệu & Thành tích bổ sung", true, false, 28)], AlignmentType.LEFT, { before: 360, after: 120 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell([createText("Tên thành tích", true)], 70, true, AlignmentType.CENTER),
                  createCell([createText("Số lượng", true)], 30, true, AlignmentType.CENTER),
                ],
              }),
              ...Object.values(stats.otherStats).filter(data => data.count > 0).map(data => {
                const userCounts = {};
                data.users.forEach(u => { userCounts[u] = (userCounts[u] || 0) + 1; });
                const usersText = Object.entries(userCounts).map(([u, c]) => `${u} ${c > 1 ? `(${c})` : ''}`).join(', ');

                return new TableRow({
                  children: [
                    createMultiParaCell([
                      createPara([createText(data.name, true)]),
                      createPara([createText(usersText, false, true, 24, "555555")]),
                    ], 70),
                    createCell([createText(data.count.toString(), true)], 30, true, AlignmentType.CENTER),
                  ],
                });
              })
            ],
          }),

          // 3. Chi tiết Thành tích Khác
          createPara([createText("III. Chi tiết Thành tích Khác (Mục VIII)", true, false, 28)], AlignmentType.LEFT, { before: 360, after: 120 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell([createText("Họ và tên", true)], 30, true, AlignmentType.CENTER),
                  createCell([createText("Tên thành tích", true)], 45, true, AlignmentType.CENTER),
                  createCell([createText("Số QĐ", true)], 25, true, AlignmentType.CENTER),
                ],
              }),
              ...stats.otherAchs.map(ach => {
                return new TableRow({
                  children: [
                    createMultiParaCell([
                      createPara([createText(ach.name, true)]),
                      createPara([createText(ach.unit, false, true, 24)]),
                    ], 30),
                    createCell([createText(ach.achName)], 45),
                    createCell([createText(ach.decisionNo)], 25, false, AlignmentType.CENTER),
                  ],
                });
              }),
              ...(stats.otherAchs.length === 0 ? [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [createPara([createText("Không có thành tích khác nào được ghi nhận.", false, true)], AlignmentType.CENTER)],
                      columnSpan: 3,
                      margins: { top: 100, bottom: 100 },
                    })
                  ]
                })
              ] : [])
            ],
          }),

          // Signatures
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
                      createPara([createText("NGƯỜI LẬP BẢNG", true, false, 28)], AlignmentType.CENTER, { before: 400 }),
                      createPara([createText("(Ký, ghi rõ họ tên)", false, true, 24)], AlignmentType.CENTER),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      createPara([createText("HIỆU TRƯỞNG", true, false, 28)], AlignmentType.CENTER, { before: 400 }),
                      createPara([createText("(Ký, ghi rõ họ tên và đóng dấu)", false, true, 24)], AlignmentType.CENTER),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `BaoCao_ThongKeThanhTich_${unitName.replace(/\s+/g, '_')}_${new Date().getTime()}.docx`);
    return true;
  } catch (error) {
    console.error('Lỗi khi xuất file Word:', error);
    return false;
  }
};
