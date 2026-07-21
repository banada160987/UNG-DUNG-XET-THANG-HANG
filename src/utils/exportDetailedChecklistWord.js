import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, BorderStyle, AlignmentType, VerticalAlign
} from "docx";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { ACHIEVEMENT_LEVELS } from "../data/config";

const createText = (text, bold = false, italic = false, size = 26, color = "000000") => 
  new TextRun({ text: text || "", bold, italic, size, font: "Times New Roman", color });

const createPara = (children, alignment = AlignmentType.LEFT, spacing = { before: 120, after: 120, line: 276 }) => 
  new Paragraph({ children, alignment, spacing });

const createCell = (children, widthPercent, bold = false, align = AlignmentType.LEFT, valign = VerticalAlign.CENTER) => {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: Array.isArray(children) ? children : [createPara([createText(children, bold)], align, { before: 100, after: 100, line: 276 })],
    verticalAlign: valign,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });
};

const createRow = (col1, col2, col3, col4, col5, bold = false) => {
  return new TableRow({
    children: [
      createCell(col1, 5, bold, AlignmentType.CENTER, VerticalAlign.TOP),
      createCell(col2, 40, bold, AlignmentType.LEFT, VerticalAlign.TOP),
      createCell(col3, 5, bold, AlignmentType.CENTER, VerticalAlign.TOP),
      createCell(col4, 5, bold, AlignmentType.CENTER, VerticalAlign.TOP),
      createCell(col5, 45, bold, AlignmentType.LEFT, VerticalAlign.TOP),
    ],
  });
};

export const exportDetailedChecklistWord = async (candidate) => {
  const {
    fullName = "",
    unit = "",
    workplace = "",
    resumeDoc = false,
    reviewDoc = false,
    ratingSheets = false,
    certIT = false,
    certLanguage = false,
    certEthnic = false,
    degrees = [],
    certificates = [],
    achievements = [],
    otherAchievements = [],
    decisionRecruitment,
    decisionProbation,
    decisionAppointment,
    decisionSalary,
    files = []
  } = candidate;

  // Helpers
  const formatDecision = (name, obj) => {
    if (!obj || !obj.number) return null;
    let suffix = ` số ${obj.number}`;
    if (obj.date) {
      try {
        const d = new Date(obj.date);
        suffix += ` ngày ${format(d, 'dd/MM/yyyy')}`;
      } catch (e) {
        suffix += ` ngày ${obj.date}`;
      }
    }
    return `- 01 Bản sao ${name}${suffix}`;
  };

  const getAchName = (id) => {
    const found = ACHIEVEMENT_LEVELS.find(lvl => lvl.id === id);
    return found ? found.name : id;
  };

  // 1. Group official achievements by ID
  const groupedAchievements = {};
  achievements.forEach(ach => {
    const key = ach.id;
    if (!groupedAchievements[key]) groupedAchievements[key] = [];
    groupedAchievements[key].push(ach);
  });

  const achRows = [];
  Object.keys(groupedAchievements).forEach(key => {
    const list = groupedAchievements[key];
    const achName = getAchName(key);
    
    // Header for the group
    if (list.length === 1) {
       achRows.push(createPara([createText(`* ${achName}:`, true)]));
    } else {
       achRows.push(createPara([createText(`* ${achName}: ${list.length} bản sao, cụ thể:`, true)]));
    }

    list.forEach(item => {
       let suffix = "";
       if (item.year) suffix += ` năm ${item.year}`;
       if (item.decisionNo) suffix += ` số QĐ: ${item.decisionNo}`;
       if (item.date) {
           try {
               suffix += ` ngày ${format(new Date(item.date), 'dd/MM/yyyy')}`;
           } catch(e) {}
       }
       achRows.push(createPara([createText(`- 01 Bản sao ${achName}${suffix}`)]));
    });
  });

  // 2. Separate otherAchievements based on keywords
  // "Giám khảo", "chấm", "sáng kiến", "SKKN", "thành viên", "hội đồng" -> 5a
  // others -> 7
  const spec5aKeywords = ["giám khảo", "chấm", "sáng kiến", "skkn", "thành viên", "hội đồng", "hướng dẫn", "bồi dưỡng"];
  const list5a = [];
  const list7 = [];
  
  (otherAchievements || []).forEach(ach => {
      const lower = (ach || "").toLowerCase();
      let match = false;
      for (let k of spec5aKeywords) {
          if (lower.includes(k)) {
              match = true;
              break;
          }
      }
      if (match) {
          list5a.push(ach);
      } else {
          list7.push(ach);
      }
  });

  // Table rows construction
  const tableRows = [];

  // Header
  tableRows.push(new TableRow({
    children: [
      createCell("Stt", 5, true, AlignmentType.CENTER),
      createCell("Hồ sơ, tài liệu", 40, true, AlignmentType.CENTER),
      createCell("Có", 5, true, AlignmentType.CENTER),
      createCell("Không", 5, true, AlignmentType.CENTER),
      createCell("Minh chứng cụ thể", 45, true, AlignmentType.CENTER),
    ]
  }));

  // Row 1: Sơ yếu lý lịch
  tableRows.push(createRow(
    "1",
    "Sơ yếu lý lịch của viên chức theo mẫu HS02-VC/BNV ban hành kèm theo Thông tư số 07/2019/TT-BNV của Bộ Nội vụ được lập chậm nhất là 30 ngày trước thời hạn cuối cùng nộp hồ sơ dự xét thăng hạng chức danh nghề nghiệp và có xác nhận của cơ quan, đơn vị sử dụng hoặc quản lý viên chức",
    resumeDoc ? "X" : "",
    !resumeDoc ? "X" : "",
    resumeDoc ? [createPara([createText("+ 01 Bản sơ yếu lý lịch của viên chức theo mẫu HS02-VC/BNV có xác nhận của Hiệu trưởng.")])] : []
  ));

  // Row 2: Bản nhận xét
  tableRows.push(createRow(
    "2",
    "Bản nhận xét, đánh giá của người đứng đầu đơn vị sự nghiệp công lập sử dụng viên chức đối với trường hợp viên chức không giữ chức vụ quản lý hoặc của người đứng đầu cơ quan có thẩm quyền bổ nhiệm viên chức quản lý đơn vị sự nghiệp công lập về các tiêu chuẩn, điều kiện đăng ký dự xét thăng hạng CDNN của viên chức theo quy định; không trong thời hạn xử lý kỷ luật; không trong thời gian thực hiện các quy định liên quan đến kỷ luật theo quy định của Đảng và của pháp luật.",
    reviewDoc ? "X" : "",
    !reviewDoc ? "X" : "",
    reviewDoc ? [createPara([createText("+ 01 Bản nhận xét, đánh giá của Hiệu trưởng về các tiêu chuẩn, điều kiện đăng ký dự xét thăng hạng CDNN của viên chức theo quy định")])] : []
  ));

  // Row 3: Phiếu đánh giá
  tableRows.push(createRow(
    "3",
    "Phiếu đánh giá, xếp loại các năm trong thời gian công tác được tính xét thăng hạng",
    ratingSheets ? "X" : "",
    !ratingSheets ? "X" : "",
    ratingSheets ? [createPara([createText("+ Các Quyết định đánh giá, xếp loại viên chức các năm tương ứng.")])] : []
  ));

  // Row 4: Tiêu chuẩn đào tạo
  tableRows.push(createRow("4", "Tiêu chuẩn về trình độ đào tạo, bồi dưỡng", "", "", []));

  // Row 4a
  const degreeParas = degrees.map(d => createPara([createText(`- 01 Bản sao Bằng ${d.level} ${d.major}`)]));
  if (certIT) degreeParas.push(createPara([createText("+ Bản sao Chứng chỉ Tin học ứng dụng")]));
  if (certLanguage) degreeParas.push(createPara([createText("+ Bản sao Chứng chỉ Ngoại ngữ")]));
  if (certEthnic) degreeParas.push(createPara([createText("+ Bản sao Chứng chỉ Tiếng dân tộc thiểu số")]));

  tableRows.push(createRow(
    "a",
    "- Bản sao các văn bằng, chứng chỉ",
    (degrees.length > 0 || certIT || certLanguage || certEthnic) ? "X" : "",
    "",
    degreeParas
  ));

  // Row 4b
  const certParas = certificates.map(c => createPara([createText(`+ Bản sao ${c.name}`)]));
  tableRows.push(createRow(
    "b",
    "- Bản sao chứng chỉ bồi dưỡng theo tiêu chuẩn chức danh nghề nghiệp.",
    certificates.length > 0 ? "X" : "",
    "",
    certParas
  ));

  // Row 5: Năng lực chuyên môn
  tableRows.push(createRow("5", "Tiêu chuẩn năng lực chuyên môn, nghiệp vụ; tiêu chuẩn nhiệm vụ từng chức danh thăng hạng", "", "", []));

  // Row 5a
  const para5a = list5a.map(a => createPara([createText(`+ 01 bản sao ${a}`)]));
  tableRows.push(createRow(
    "a",
    "Khả năng, chủ động, sáng tạo, ứng dụng, linh hoạt, hỗ trợ, hướng dẫn, thực hiện nhiệm vụ chuyên môn, ... Đối với các tiêu chuẩn không có minh chứng là các văn bằng, chứng chỉ, chứng nhận, quyết định, bằng khen, giấy khen, đề tài, đề án hoặc sản phẩm được ứng dụng trong giáo dục, giảng dạy học sinh và tài liệu có liên quan thì minh chứng là biên bản đánh giá, nhận xét về khả năng đáp ứng các tiêu chuẩn đó của tổ chuyên môn, tổ bộ môn hoặc tương đương và có xác nhận của người đứng đầu cơ sở giáo dục trực tiếp quản lý, sử dụng viên chức",
    list5a.length > 0 ? "X" : "",
    "",
    para5a
  ));

  // Row 5b
  tableRows.push(createRow(
    "b",
    "Danh hiệu thi đua, hình thức khen thưởng (chiến sĩ thi đua, bằng khen, chứng nhận giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi, giáo viên làm tổng phụ trách Đội giỏi, quyết định, giấy khen, ...), đề tài, đề án hoặc sản phẩm được ứng dụng trong hoạt động chuyên môn, tài liệu liên quan",
    achievements.length > 0 ? "X" : "",
    "",
    achRows
  ));

  // Row 6
  const decisions = [];
  const recStr = formatDecision("Quyết định tuyển dụng", decisionRecruitment);
  if (recStr) decisions.push(createPara([createText(recStr)]));
  const proStr = formatDecision("Quyết định hết tập sự", decisionProbation);
  if (proStr) decisions.push(createPara([createText(proStr)]));
  const appStr = formatDecision("Quyết định bổ nhiệm chức danh nghề nghiệp", decisionAppointment);
  if (appStr) decisions.push(createPara([createText(appStr)]));
  const salStr = formatDecision("Quyết định nâng lương gần nhất", decisionSalary);
  if (salStr) decisions.push(createPara([createText(salStr)]));

  tableRows.push(createRow(
    "6",
    "Thời gian giữ hạng: Bản sao các quyết định tuyển dụng, xét hết tập sự, bổ nhiệm ngạch, bổ nhiệm chức danh nghề nghiệp, nâng lương, thâm niên hiện hưởng, hợp đồng lao động, hợp đồng làm việc, ...",
    decisions.length > 0 ? "X" : "",
    "",
    decisions
  ));

  // Row 7
  const para7 = list7.map(a => createPara([createText(`+ 01 bản sao ${a}`)]));
  tableRows.push(createRow(
    "7",
    "Minh chứng các thành tích đạt được trong hoạt động nghề nghiệp đã được cấp có thẩm quyền công nhận theo Đề án (để xét ưu tiên khi số lượng viên chức đăng ký nhiều hơn chỉ tiêu thăng hạng được phê duyệt).",
    list7.length > 0 ? "x" : "",
    "",
    para7
  ));

  // Row 8
  const fileParas = (files || []).map(f => createPara([createText(`- File: ${f.name}`)]));
  tableRows.push(createRow(
    "8",
    "Các giấy tờ khác có liên quan (ghi rõ)",
    fileParas.length > 0 ? "x" : "",
    "",
    fileParas
  ));

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1700 }, // 1 inch top/bottom/right, 1.2 inch left
          }
        },
        children: [
          createPara([createText("DANH MỤC HỒ SƠ MINH CHỨNG XÉT THĂNG HẠNG", true, false, 28)], AlignmentType.CENTER, { before: 200, after: 400 }),
          
          createPara([createText("Họ và tên viên chức: ", false, false, 26), createText(fullName, true)], AlignmentType.LEFT, { before: 100, after: 100 }),
          createPara([createText("Đơn vị: ", false, false, 26), createText(workplace || unit, false, false, 26)], AlignmentType.LEFT, { before: 100, after: 100 }),
          createPara([createText("Cơ quan quản lý cấp trên: ", false, false, 26), createText("Sở Giáo dục và Đào tạo Đắk Lắk.", false, false, 26)], AlignmentType.LEFT, { before: 100, after: 100 }),
          createPara([createText("Hồ sơ đăng ký xét thăng hạng chức danh nghề nghiệp được đóng thành tập và sắp xếp các thành phần của hồ sơ theo đúng thứ tự như sau:", false, false, 26)], AlignmentType.LEFT, { before: 100, after: 300 }),
          
          table,
          
          createPara([createText("Ghi chú:", true, true)], AlignmentType.LEFT, { before: 200, after: 100 }),
          createPara([createText("- Cá nhân, đơn vị chịu trách nhiệm về thành phần, hồ sơ, minh chứng.", false, true)], AlignmentType.LEFT, { before: 0, after: 0 }),
          createPara([createText("- Hồ sơ phải được niêm phong.", false, true)], AlignmentType.LEFT, { before: 0, after: 300 }),
          
          new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
              },
              rows: [
                  new TableRow({
                      children: [
                          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [] }),
                          new TableCell({ 
                              width: { size: 50, type: WidthType.PERCENTAGE }, 
                              children: [
                                  createPara([createText("Người lập", true)], AlignmentType.CENTER),
                                  createPara([], AlignmentType.CENTER, { before: 1000, after: 1000 }), // Space for signature
                                  createPara([createText(fullName, true)], AlignmentType.CENTER)
                              ]
                          })
                      ]
                  })
              ]
          })
        ],
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Danh_Muc_Ho_So_${fullName.replace(/\s+/g, '_')}.docx`);
};
