import { differenceInYears } from 'date-fns';

export const checkEligibility = (candidate) => {
  const missing = [];

  // I. Thông tin cá nhân cơ bản
  if (!candidate.cccd) missing.push("Thiếu CCCD");
  if (!candidate.fullName) missing.push("Thiếu Họ tên");

  // II. Kiểm tra Sơ yếu lý lịch và Nhận xét (Dựa theo Hình ảnh quy định)
  if (!candidate.resumeDoc) missing.push("Thiếu Sơ yếu lý lịch (HS02-VC/BNV)");
  if (!candidate.reviewDoc) missing.push("Thiếu Bản nhận xét, đánh giá của thủ trưởng");

  // III. Kiểm tra quyết định công tác (Cần có đủ số và ngày)
  const checkDecision = (dec, name) => {
    if (!dec || !dec.number || !dec.date || !dec.issuer) {
      missing.push(`Thiếu thông tin ${name}`);
    }
  };
  
  checkDecision(candidate.decisionRecruitment, "QĐ Tuyển dụng");
  checkDecision(candidate.decisionProbation, "QĐ Hết tập sự");
  checkDecision(candidate.decisionAppointment, "QĐ Bổ nhiệm hạng");
  checkDecision(candidate.decisionSalary, "QĐ Nâng lương gần nhất");

  // IV. Kiểm tra văn bằng (Ít nhất phải có 1 văn bằng)
  if (!candidate.degrees || candidate.degrees.length === 0) {
    missing.push("Thiếu bản sao Văn bằng");
  } else {
    // Kiểm tra xem văn bằng có bị điền thiếu thông tin không
    const hasValidDegree = candidate.degrees.some(d => d.level && d.major && d.school && d.year);
    if (!hasValidDegree) {
      missing.push("Thông tin Văn bằng chưa đầy đủ");
    }
  }

  // V. Kiểm tra chứng chỉ Ngoại ngữ, Tin học
  if (!candidate.certIT) missing.push("Thiếu Chứng chỉ/Xác nhận Tin học");
  if (!candidate.certLanguage) missing.push("Thiếu Chứng chỉ/Xác nhận Ngoại ngữ");

  // VI. Thành tích
  if (!candidate.achievements || candidate.achievements.length === 0) {
    missing.push("Thiếu bản sao Bằng khen/Giấy chứng nhận thành tích");
  }

  return {
    isValid: missing.length === 0,
    missing: missing
  };
};
