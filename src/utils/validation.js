import { differenceInYears } from 'date-fns';

export const checkEligibility = (candidate) => {
  const missing = [];

  // I. Thông tin cá nhân cơ bản
  if (!candidate.cccd) missing.push("Thiếu CCCD");
  if (!candidate.fullName) missing.push("Thiếu Họ tên");

  // II. Kiểm tra quyết định công tác (Cần có đủ số và ngày)
  const checkDecision = (dec, name) => {
    if (!dec || !dec.number || !dec.date || !dec.issuer) {
      missing.push(`Thiếu thông tin QĐ ${name}`);
    }
  };
  
  checkDecision(candidate.decisionRecruitment, "Tuyển dụng");
  checkDecision(candidate.decisionAppointment, "Bổ nhiệm chức danh");
  checkDecision(candidate.decisionSalary, "Nâng lương");
  
  // QĐ hết tập sự có thể không bắt buộc với mọi trường hợp nhưng theo yêu cầu chung thì nên có.
  // checkDecision(candidate.decisionProbation, "Hết tập sự");

  // III. Kiểm tra văn bằng (Ít nhất phải có 1 văn bằng)
  if (!candidate.degrees || candidate.degrees.length === 0) {
    missing.push("Thiếu văn bằng");
  } else {
    // Kiểm tra xem văn bằng có bị điền thiếu thông tin không
    const hasValidDegree = candidate.degrees.some(d => d.level && d.major && d.school && d.year);
    if (!hasValidDegree) {
      missing.push("Thông tin văn bằng chưa đầy đủ");
    }
  }

  // IV. Kiểm tra chứng chỉ & nhận xét
  if (!candidate.certIT) missing.push("Thiếu chứng chỉ Tin học");
  if (!candidate.certLanguage) missing.push("Thiếu chứng chỉ Ngoại ngữ");
  if (!candidate.reviewDoc) missing.push("Thiếu bản nhận xét của đơn vị");

  // V. Thành tích
  if (!candidate.achievements || candidate.achievements.length === 0) {
    missing.push("Thiếu thành tích");
  }

  return {
    isValid: missing.length === 0,
    missing: missing
  };
};
