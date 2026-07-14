import { ACHIEVEMENT_LEVELS } from '../data/config';
import { differenceInDays } from 'date-fns';

// Lấy thứ hạng điểm của 1 thành tích (Score càng nhỏ thì hạng càng cao, theo danh sách 1 -> 14)
// Nếu không tìm thấy, cho điểm rất lớn.
const getAchievementScore = (achievementId) => {
  const ach = ACHIEVEMENT_LEVELS.find(a => a.id === achievementId);
  return ach ? ach.score : 999;
};

// Đánh giá bộ thành tích của 1 cá nhân
export const evaluateAchievements = (achievements) => {
  if (!achievements || achievements.length === 0) {
    return {
      highestScore: 999, // Không có thành tích
      highestCount: 0,
      individualCount: 0
    };
  }

  // 1. Tìm điểm cao nhất (nhỏ nhất)
  let highestScore = 999;
  achievements.forEach(a => {
    const score = getAchievementScore(a.id);
    if (score < highestScore) {
      highestScore = score;
    }
  });

  // 2. Đếm số lượng thành tích ở mức cao nhất đó
  const highestAchievements = achievements.filter(a => getAchievementScore(a.id) === highestScore);
  const highestCount = highestAchievements.length;

  // 3. Đếm số lượng thành tích cá nhân trong số những thành tích cao nhất
  const individualCount = highestAchievements.filter(a => a.type === 'cá nhân').length;

  return {
    highestScore,
    highestCount,
    individualCount
  };
};

// Thuật toán so sánh 2 ứng viên A và B
export const rankCandidates = (a, b) => {
  const evalA = evaluateAchievements(a.achievements);
  const evalB = evaluateAchievements(b.achievements);

  // 1. So sánh thành tích cao nhất (score nhỏ hơn là tốt hơn)
  if (evalA.highestScore !== evalB.highestScore) {
    return evalA.highestScore - evalB.highestScore; 
  }

  // 2. So sánh số lượng thành tích cùng cấp cao nhất (nhiều hơn là tốt hơn)
  if (evalA.highestCount !== evalB.highestCount) {
    return evalB.highestCount - evalA.highestCount; 
  }

  // 3. So thành tích cá nhân (nhiều hơn là tốt hơn)
  if (evalA.individualCount !== evalB.individualCount) {
    return evalB.individualCount - evalA.individualCount;
  }

  // 4. Ưu tiên nữ
  if (a.gender === 'Nữ' && b.gender !== 'Nữ') return -1;
  if (a.gender !== 'Nữ' && b.gender === 'Nữ') return 1;

  // 5. Ưu tiên dân tộc thiểu số (khác Kinh)
  const isMinorityA = a.ethnicity && a.ethnicity.toLowerCase() !== 'kinh';
  const isMinorityB = b.ethnicity && b.ethnicity.toLowerCase() !== 'kinh';
  if (isMinorityA && !isMinorityB) return -1;
  if (!isMinorityA && isMinorityB) return 1;

  // 6. Nhiều tuổi hơn (ngày sinh nhỏ hơn -> timestamp nhỏ hơn)
  if (a.dob && b.dob) {
    const timeA = new Date(a.dob).getTime();
    const timeB = new Date(b.dob).getTime();
    if (timeA !== timeB) {
      return timeA - timeB; // Số nhỏ xếp trên
    }
  }

  // 7. Thời gian công tác nhiều hơn (ngày tuyển dụng nhỏ hơn)
  if (a.dateRecruitment && b.dateRecruitment) {
    const timeA = new Date(a.dateRecruitment).getTime();
    const timeB = new Date(b.dateRecruitment).getTime();
    if (timeA !== timeB) {
      return timeA - timeB; // Số nhỏ xếp trên
    }
  }

  return 0; // Bằng nhau hoàn toàn
};
