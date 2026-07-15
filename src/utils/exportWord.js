import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, BorderStyle, AlignmentType, VerticalAlign
} from "docx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

const createText = (text, bold = false, italic = false, size = 26, color = "000000") => 
  new TextRun({ text: text || "", bold, italic, size, font: "Times New Roman", color });

const createPara = (children, alignment = AlignmentType.LEFT, spacing = { before: 120, after: 120, line: 360 }) => 
  new Paragraph({ children, alignment, spacing });

const createCell = (children, widthPercent, bold = false, align = AlignmentType.LEFT, valign = VerticalAlign.CENTER) => {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: Array.isArray(children) ? children : [createPara([createText(children, bold)], align, { before: 100, after: 100 })],
    verticalAlign: valign,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });
};

const createRow = (col1, col2, col3, col4, col5, bold = false) => {
  return new TableRow({
    children: [
      createCell(col1, 5, bold, AlignmentType.CENTER),
      createCell(col2, 50, bold, AlignmentType.LEFT),
      createCell(col3, 7, bold, AlignmentType.CENTER),
      createCell(col4, 7, bold, AlignmentType.CENTER),
      createCell(col5, 31, bold, AlignmentType.LEFT),
    ],
  });
};

export const exportCandidateToWord = async (candidate) => {
  const {
    fullName = "",
    dob = "",
    unit = "",
    workplace = "",
    currentTitle = "",
    targetTitle = "",
    resumeDoc = false,
    reviewDoc = false,
    certIT = false,
    certLanguage = false,
    degrees = [],
    achievements = [],
    decisionRecruitment,
    decisionProbation,
    decisionAppointment,
    decisionSalary
  } = candidate;

  // Xử lý dữ liệu văn bằng
  const degreeStrings = degrees.map(d => `01 Bằng ${d.level} ${d.major}`).join("\n");
  
  // Xử lý quyết định
  const decisions = [];
  if (decisionRecruitment?.number) decisions.push("01 Quyết định tuyển dụng");
  if (decisionProbation?.number) decisions.push("01 Quyết định hết tập sự");
  if (decisionAppointment?.number) decisions.push("01 Quyết định bổ nhiệm CDNN");
  if (decisionSalary?.number) decisions.push("01 Quyết định nâng lương");
  const decisionStrings = decisions.join("\n");

  // Xử lý thành tích
  const achMap = {};
  achievements.forEach(a => {
    const key = a.id;
    achMap[key] = (achMap[key] || 0) + 1;
  });
  const achStrings = Object.entries(achMap).map(([k, v]) => {
    let name = k;
    if(k === 'cstd_co_so') name = "CSTĐ cơ sở";
    else if(k === 'cstd_cap_tinh') name = "CSTĐ cấp Tỉnh";
    else if(k === 'bang_khen_tinh') name = "Bằng khen cấp Tỉnh";
    else if(k === 'bang_khen_bo') name = "Bằng khen cấp Bộ";
    return `0${v} ${name}`;
  }).join("\n");

  // Định dạng ngày sinh
  let dobStr = dob;
  if(dob) {
    try {
      const d = new Date(dob);
      dobStr = format(d, 'dd/MM/yyyy');
    } catch(e) {}
  }

  const doc = new Document({
    sections: [
      // TRANG BÌA
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1700 },
            borders: {
              pageBorderTop: { style: BorderStyle.SINGLE, size: 24, space: 24 },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 24, space: 24 },
              pageBorderLeft: { style: BorderStyle.SINGLE, size: 24, space: 24 },
              pageBorderRight: { style: BorderStyle.SINGLE, size: 24, space: 24 },
              pageBorders: { display: "allPages", offsetFrom: "page" }
            }
          }
        },
        children: [
          createPara([createText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true)], AlignmentType.CENTER),
          createPara([createText("Độc lập - Tự do - Hạnh phúc", true, false, 26, "000000"), createText("\n----------------", true)], AlignmentType.CENTER),
          createPara([], AlignmentType.CENTER, { before: 1000 }),
          createPara([createText("HỒ SƠ", true, false, 48)], AlignmentType.CENTER, { before: 1000 }),
          createPara([createText("XÉT THĂNG HẠNG", true, false, 48)], AlignmentType.CENTER),
          createPara([createText("CHỨC DANH NGHỀ NGHIỆP VIÊN CHỨC GIÁO DỤC", true, false, 48)], AlignmentType.CENTER),
          createPara([createText("__________________", true, false, 48)], AlignmentType.CENTER),
          createPara([], AlignmentType.CENTER, { before: 1000 }),
          
          createPara([createText("1. Họ và tên: ", true), createText(fullName)], AlignmentType.LEFT),
          createPara([createText("2. Ngày sinh: ", true), createText(dobStr)], AlignmentType.LEFT),
          createPara([createText("3. Hạng, chức danh nghề nghiệp hiện giữ: ", true), createText(currentTitle)], AlignmentType.LEFT),
          createPara([createText("4. Hạng, chức danh nghề nghiệp đăng ký thăng hạng: ", true), createText(targetTitle)], AlignmentType.LEFT),
          createPara([createText("5. Trường: ", true), createText(workplace)], AlignmentType.LEFT),
          createPara([createText("6. Địa chỉ: ", true), createText("................................................")], AlignmentType.LEFT),
          
          createPara([createText("7. Tài liệu kèm theo", true)], AlignmentType.LEFT),
          createPara([createText("- Phiếu danh mục minh chứng.")], AlignmentType.LEFT),
          createPara([createText("- Sơ yếu lý lịch của viên chức theo mẫu HS02-VC/BNV.")], AlignmentType.LEFT),
          createPara([createText("- Bản nhận xét, đánh giá của người đứng đầu đơn vị sự nghiệp công lập.")], AlignmentType.LEFT),
          createPara([createText("- Phiếu đánh giá, xếp loại các năm 2022-2023; 2023-2024; 2024-2025.")], AlignmentType.LEFT),
          createPara([createText("- Bản sao văn bằng, chứng chỉ.")], AlignmentType.LEFT),
          createPara([createText("- Các minh chứng thành tích.")], AlignmentType.LEFT),
          createPara([createText("- Bản sao các quyết định tuyển dụng, bổ nhiệm ngạch, bổ nhiệm chức danh nghề nghiệp, nâng lương, thâm niên hiện hưởng, hợp đồng lao động.")], AlignmentType.LEFT),
          createPara([createText("Và các tài liệu khác (nếu có).")], AlignmentType.LEFT),
        ]
      },
      // TRANG DANH MỤC
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1700 } }
        },
        children: [
          createPara([createText("DANH MỤC HỒ SƠ MINH CHỨNG XÉT THĂNG HẠNG", true, false, 32)], AlignmentType.CENTER),
          createPara([], AlignmentType.CENTER, { before: 200, after: 200 }),
          createPara([createText("Họ và tên viên chức: ", false), createText(fullName, true)]),
          createPara([createText("Đơn vị: ", false), createText(unit, true)]),
          createPara([createText("Cơ quan quản lý cấp trên: ", false), createText("Sở GDĐT Đắk Lắk", true)]),
          createPara([createText("Hồ sơ đăng ký xét thăng hạng chức danh nghề nghiệp được đóng thành tập và sắp xếp các thành phần của hồ sơ theo "), createText("đúng thứ tự", true), createText(" như sau:")]),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header
              createRow("Stt", "Hồ sơ, tài liệu", "Có", "Không", "Minh chứng cụ thể", true),
              
              // 1
              createRow("1", "Sơ yếu lý lịch của viên chức theo mẫu HS02-VC/BNV ban hành kèm theo Thông tư số 07/2019/TT-BNV của Bộ Nội vụ được lập chậm nhất là 30 ngày trước thời hạn cuối cùng nộp hồ sơ dự xét thăng hạng chức danh nghề nghiệp và có xác nhận của cơ quan, đơn vị sử dụng hoặc quản lý viên chức", resumeDoc ? "X" : "", !resumeDoc ? "X" : "", ""),
              
              // 2
              createRow("2", "Bản nhận xét, đánh giá của người đứng đầu đơn vị sự nghiệp công lập sử dụng viên chức đối với trường hợp viên chức không giữ chức vụ quản lý hoặc của người đứng đầu cơ quan có thẩm quyền bổ nhiệm viên chức quản lý đơn vị sự nghiệp công lập về các tiêu chuẩn, điều kiện đăng ký dự xét thăng hạng CDNN của viên chức theo quy định; không trong thời hạn xử lý kỷ luật; không trong thời gian thực hiện các quy định liên quan đến kỷ luật theo quy định của Đảng và của pháp luật.", reviewDoc ? "X" : "", !reviewDoc ? "X" : "", ""),
              
              // 3
              createRow("3", "Phiếu đánh giá, xếp loại các năm trong thời gian công tác được tính xét thăng hạng", "", "", ""),
              
              // 4
              createRow("4", "Tiêu chuẩn về trình độ đào tạo, bồi dưỡng", "", "", ""),
              createRow("a", "- Bản sao các văn bằng, chứng chỉ", degrees.length > 0 ? "X" : "", degrees.length === 0 ? "X" : "", degreeStrings),
              createRow("b", "- Bản sao chứng chỉ bồi dưỡng theo tiêu chuẩn chức danh nghề nghiệp.", "", "", ""),
              
              // 5
              createRow("5", "Tiêu chuẩn năng lực chuyên môn, nghiệp vụ; tiêu chuẩn nhiệm vụ từng chức danh thăng hạng", "", "", ""),
              createRow("a", "Khả năng, chủ động, sáng tạo, ứng dụng, linh hoạt, hỗ trợ, hướng dẫn, thực hiện nhiệm vụ chuyên môn...\nĐối với các tiêu chuẩn không có minh chứng là các văn bằng, chứng chỉ, chứng nhận, quyết định, bằng khen, giấy khen, đề tài, đề án hoặc sản phẩm được ứng dụng trong giáo dục, giảng dạy học sinh và tài liệu có liên quan thì minh chứng là biên bản đánh giá, nhận xét về khả năng đáp ứng các tiêu chuẩn đó của tổ chuyên môn, tổ bộ môn hoặc tương đương và có xác nhận của người đứng đầu cơ sở giáo dục trực tiếp quản lý, sử dụng viên chức", "", "", ""),
              createRow("b", "Danh hiệu thi đua, hình thức khen thưởng (chiến sĩ thi đua, bằng khen, chứng nhận giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi, giáo viên làm tổng phụ trách Đội giỏi, quyết định, giấy khen,...), đề tài, đề án hoặc sản phẩm được ứng dụng trong hoạt động chuyên môn, tài liệu liên quan", achievements.length > 0 ? "X" : "", achievements.length === 0 ? "X" : "", achStrings),
              
              // 6
              createRow("6", "Thời gian giữ hạng: Bản sao các quyết định tuyển dụng, xét hết tập sự, bổ nhiệm ngạch, bổ nhiệm chức danh nghề nghiệp, nâng lương, thâm niên hiện hưởng, hợp đồng lao động, hợp đồng làm việc, ...", decisions.length > 0 ? "X" : "", decisions.length === 0 ? "X" : "", decisionStrings),
              
              // 7
              createRow("7", "Minh chứng các thành tích đạt được trong hoạt động nghề nghiệp đã được cấp có thẩm quyền công nhận theo Đề án (để xét ưu tiên khi số lượng viên chức đăng ký nhiều hơn chỉ tiêu thăng hạng được phê duyệt).", achievements.length > 0 ? "X" : "", achievements.length === 0 ? "X" : "", achStrings),
              
              // 8
              createRow("8", "Các giấy tờ khác có liên quan (ghi rõ)", "", "", "")
            ]
          }),
          
          createPara([], AlignmentType.LEFT, { before: 500 }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [createPara([])]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      createPara([createText("Xác nhận", true)], AlignmentType.CENTER),
                      createPara([], AlignmentType.CENTER, { before: 800 }),
                      createPara([createText(fullName, true)], AlignmentType.CENTER),
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Danh_muc_ho_so_${candidate.cccd}_${candidate.fullName}.docx`);
};
