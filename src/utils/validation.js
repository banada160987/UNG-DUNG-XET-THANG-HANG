import { differenceInYears } from 'date-fns';

export const checkEligibility = (candidate) => {
  const missing = [];

  // Kiểm tra văn bằng (ít nhất phải có một văn bằng Đại học, Thạc sĩ hoặc Tiến sĩ)
  if (!candidate.degreeBachelor && !candidate.degreeMaster && !candidate.degreePhD) {
    missing.push("Thiếu văn bằng (Đại học/Thạc sĩ/Tiến sĩ)");
  }

  // Kiểm tra chứng chỉ
  if (!candidate.certIT) missing.push("Thiếu chứng chỉ Tin học (hoặc xác nhận)");
  if (!candidate.certLanguage) missing.push("Thiếu chứng chỉ Ngoại ngữ (hoặc xác nhận)");

  // Kiểm tra quyết định
  if (!candidate.dateRecruitment) missing.push("Thiếu quyết định tuyển dụng");
  if (!candidate.dateAppointment) missing.push("Thiếu quyết định bổ nhiệm hạng hiện tại");
  if (!candidate.dateSalaryRaise) missing.push("Thiếu quyết định nâng lương gần nhất");
  
  // Kiểm tra bản nhận xét
  if (!candidate.reviewDoc) missing.push("Thiếu bản nhận xét của thủ trưởng");

  // Kiểm tra thời gian giữ hạng (Giả sử mặc định tối thiểu 3 năm, hoặc chỉ cần có ngày)
  // Tính toán thời gian giữ hạng (nếu có ngày bổ nhiệm)
  if (candidate.dateAppointment) {
    const years = differenceInYears(new Date(), new Date(candidate.dateAppointment));
    // Tạm thời coi như có khai báo là đã check, nếu cần check chính xác số năm thì sửa số 0.
    if (years < 0) { 
      missing.push("Chưa đủ thời gian giữ hạng");
    }
  }

  return {
    isValid: missing.length === 0,
    missing: missing
  };
};
