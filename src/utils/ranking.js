import { ACHIEVEMENT_LEVELS } from '../data/config';

const getAchievementScore = (achievementId) => {
  const ach = ACHIEVEMENT_LEVELS.find(a => a.id === achievementId);
  return ach ? ach.score : 999;
};

export const calculateTotalScore = (candidate) => {
  let score = 0;
  
  // 1. Thâm niên (1 điểm mỗi năm từ ngày tuyển dụng/hết tập sự)
  const dateRec = candidate.decisionRecruitment?.date || candidate.decisionProbation?.date;
  if (dateRec) {
    const probDate = new Date(dateRec);
    const now = new Date();
    const diffTime = Math.abs(now - probDate);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    score += diffYears;
  }
  
  // 2. Thành tích (Điểm càng cao tương ứng với rank càng thấp trong config)
  if (candidate.achievements && Array.isArray(candidate.achievements)) {
    candidate.achievements.forEach(a => {
      const configScore = getAchievementScore(a.id);
      if (configScore === 1) score += 20;       // Huân chương
      else if (configScore <= 3) score += 15;   // Giải thưởng NN, danh hiệu
      else if (configScore <= 6) score += 10;   // CSTĐ toàn quốc/tỉnh, BK thủ tướng
      else if (configScore <= 10) score += 5;   // Bằng khen Tỉnh ủy, UBND
      else if (configScore <= 12) score += 3;   // CSTĐ cơ sở, LĐLĐ
      else score += 1;                          // Giấy khen
    });
  }

  // 3. Điểm cộng ưu tiên
  if (candidate.gender === 'Nữ') score += 0.5;
  const isMinority = candidate.ethnicity && candidate.ethnicity.toLowerCase() !== 'kinh';
  if (isMinority) score += 0.5;

  return score;
};

export const evaluateAchievements = (achievements) => {
  if (!achievements || achievements.length === 0) {
    return {
      highestScore: 999,
      highestCount: 0,
      individualCount: 0
    };
  }

  let highestScore = 999;
  achievements.forEach(a => {
    const score = getAchievementScore(a.id);
    if (score < highestScore) {
      highestScore = score;
    }
  });

  const highestAchievements = achievements.filter(a => getAchievementScore(a.id) === highestScore);
  const highestCount = highestAchievements.length;
  const individualCount = highestAchievements.filter(a => a.type === 'cá nhân').length;

  return {
    highestScore,
    highestCount,
    individualCount
  };
};

export const rankCandidates = (a, b) => {
  const evalA = evaluateAchievements(a.achievements);
  const evalB = evaluateAchievements(b.achievements);

  if (evalA.highestScore !== evalB.highestScore) {
    return evalA.highestScore - evalB.highestScore; 
  }
  if (evalA.highestCount !== evalB.highestCount) {
    return evalB.highestCount - evalA.highestCount; 
  }
  if (evalA.individualCount !== evalB.individualCount) {
    return evalB.individualCount - evalA.individualCount;
  }

  if (a.gender === 'Nữ' && b.gender !== 'Nữ') return -1;
  if (a.gender !== 'Nữ' && b.gender === 'Nữ') return 1;

  const isMinorityA = a.ethnicity && a.ethnicity.toLowerCase() !== 'kinh';
  const isMinorityB = b.ethnicity && b.ethnicity.toLowerCase() !== 'kinh';
  if (isMinorityA && !isMinorityB) return -1;
  if (!isMinorityA && isMinorityB) return 1;

  if (a.dob && b.dob) {
    const timeA = new Date(a.dob).getTime();
    const timeB = new Date(b.dob).getTime();
    if (timeA !== timeB) return timeA - timeB; 
  }

  // Dùng ngày ký quyết định tuyển dụng để tính thâm niên
  const dateRecA = a.decisionRecruitment?.date;
  const dateRecB = b.decisionRecruitment?.date;
  
  if (dateRecA && dateRecB) {
    const timeA = new Date(dateRecA).getTime();
    const timeB = new Date(dateRecB).getTime();
    if (timeA !== timeB) return timeA - timeB; 
  }

  return 0;
};
