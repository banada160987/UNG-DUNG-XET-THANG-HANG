import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign, PageOrientation, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

// Helper to create TextRun
const createText = (text, bold = false, italic = false, size = 26, color = "000000") => 
  new TextRun({ text: text || "", bold, italic, size, font: "Times New Roman", color });

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

export const exportProposalWord = async (candidates, quotas = {}) => {
  try {
    // Chỉ lấy những người trúng tuyển
    const passedCandidates = candidates.filter(c => {
      if (!c.eligibility?.isValid) return false;
      const quota = quotas[c.targetTitle] || 0;
      return quota > 0 && c.rank <= quota;
    });

    // Gom nhóm theo chức danh
    const grouped = {};
    passedCandidates.forEach(c => {
      if (!grouped[c.targetTitle]) grouped[c.targetTitle] = [];
      grouped[c.targetTitle].push(c);
    });

    const docChildren = [
      // HEADER (Quốc hiệu, Tiêu ngữ)
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  createPara([createText("SỞ GD&ĐT ĐẮK LẮK", false, false, 24)], AlignmentType.CENTER),
                  createPara([createText("TRƯỜNG THPT CAO BÁ QUÁT", true, false, 24)], AlignmentType.CENTER),
                  createPara([createText("-------", false, false, 24)], AlignmentType.CENTER),
                  createPara([createText("Số: ....../TTr-CBQ", false, false, 24)], AlignmentType.CENTER),
                ]
              }),
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                children: [
                  createPara([createText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true, false, 24)], AlignmentType.CENTER),
                  createPara([createText("Độc lập - Tự do - Hạnh phúc", true, false, 26)], AlignmentType.CENTER),
                  createPara([createText("-----------------", false, false, 24)], AlignmentType.CENTER),
                  createPara([createText("Buôn Ma Thuột, ngày ..... tháng ..... năm .....", false, italic=true, 24)], AlignmentType.RIGHT),
                ]
              })
            ]
          })
        ]
      }),
      new Paragraph({ text: "", spacing: { after: 300 } }),
      createPara([createText("TỜ TRÌNH", true, false, 32)], AlignmentType.CENTER),
      createPara([createText("Về việc đề nghị xét thăng hạng chức danh nghề nghiệp viên chức năm 2026", true, false, 28)], AlignmentType.CENTER, { after: 300 }),
      createPara([
        createText("Kính gửi: ", italic=true),
        createText("- Sở Giáo dục và Đào tạo Đắk Lắk;", true)
      ], AlignmentType.LEFT),
      createPara([
        createText("                 - Hội đồng xét thăng hạng chức danh nghề nghiệp.", true)
      ], AlignmentType.LEFT, { after: 200 }),
      
      createPara([createText("Căn cứ Luật Viên chức ngày 15 tháng 11 năm 2010; Luật sửa đổi, bổ sung một số điều của Luật Cán bộ, công chức và Luật Viên chức ngày 25 tháng 11 năm 2019;", false)], AlignmentType.JUSTIFIED),
      createPara([createText("Căn cứ Nghị định số 115/2020/NĐ-CP ngày 25 tháng 9 năm 2020 của Chính phủ quy định về tuyển dụng, sử dụng và quản lý viên chức;", false)], AlignmentType.JUSTIFIED),
      createPara([createText("Căn cứ Thông tư số 34/2021/TT-BGDĐT ngày 30/11/2021 của Bộ Giáo dục và Đào tạo quy định tiêu chuẩn, điều kiện thi hoặc xét thăng hạng chức danh nghề nghiệp giáo viên mầm non, phổ thông công lập;", false)], AlignmentType.JUSTIFIED),
      createPara([createText("Xét kết quả đánh giá hồ sơ và ưu tiên của Hội đồng kiểm tra, sát hạch Trường THPT Cao Bá Quát;", false)], AlignmentType.JUSTIFIED, { after: 200 }),
      createPara([createText(`Trường THPT Cao Bá Quát kính đề nghị Sở Giáo dục và Đào tạo xem xét, quyết định thăng hạng chức danh nghề nghiệp cho ${passedCandidates.length} viên chức đạt đủ tiêu chuẩn và nằm trong chỉ tiêu được giao. Danh sách cụ thể như sau:`, false)], AlignmentType.JUSTIFIED, { after: 200 }),
    ];

    Object.keys(grouped).forEach(title => {
      docChildren.push(createPara([createText(`Danh sách đề nghị ${title}`, true)], AlignmentType.LEFT, { after: 100 }));
      
      const tableRows = [
        new TableRow({
          children: [
            createCell([createText("STT", true, false, 24)], 10),
            createCell([createText("Họ và tên", true, false, 24)], 30),
            createCell([createText("Ngày sinh", true, false, 24)], 15),
            createCell([createText("Tổ chuyên môn", true, false, 24)], 25),
            createCell([createText("Thứ hạng ưu tiên", true, false, 24)], 20),
          ]
        })
      ];

      grouped[title].forEach((c, idx) => {
        tableRows.push(new TableRow({
          children: [
            createCell([createText((idx + 1).toString(), false, false, 24)], 10),
            createCell([createText(c.fullName, true, false, 24)], 30, false, AlignmentType.LEFT),
            createCell([createText(c.dob ? new Date(c.dob).toLocaleDateString('vi-VN') : '', false, false, 24)], 15),
            createCell([createText(c.unit, false, false, 24)], 25, false, AlignmentType.LEFT),
            createCell([createText(`Hạng ${c.rank}`, true, false, 24)], 20),
          ]
        }));
      });

      docChildren.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }));
      docChildren.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    });

    docChildren.push(
      createPara([createText("Kính trình Sở Giáo dục và Đào tạo xem xét, quyết định./.", false)], AlignmentType.JUSTIFIED, { after: 400 }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  createPara([createText("Nơi nhận:", true, italic=true, 22)], AlignmentType.LEFT, { after: 0 }),
                  createPara([createText("- Như trên;", false, false, 22)], AlignmentType.LEFT, { after: 0 }),
                  createPara([createText("- Lưu: VT.", false, false, 22)], AlignmentType.LEFT, { after: 0 }),
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  createPara([createText("HIỆU TRƯỞNG", true, false, 24)], AlignmentType.CENTER),
                  createPara([createText("(Ký, đóng dấu)", false, italic=true, 22)], AlignmentType.CENTER, { after: 1000 }),
                ]
              })
            ]
          })
        ]
      })
    );

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1440, bottom: 1440, left: 1728, right: 1152 } // ~2.5cm top/bottom, 3cm left, 2cm right
          }
        },
        children: docChildren
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `To_Trinh_Xet_Thang_Hang_${new Date().getFullYear()}.docx`);
    return true;
  } catch (error) {
    console.error("Export Error:", error);
    return false;
  }
};
