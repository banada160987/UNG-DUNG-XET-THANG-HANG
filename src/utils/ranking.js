import { ACHIEVEMENT_LEVELS } from '../data/config';

const getAchievementScore = (achievementId) => {
  const ach = ACHIEVEMENT_LEVELS.find(a => a.id === achievementId);
  return ach ? ach.score : 999;
};

export const getPointsForAchievement = (achievementId, settings) => {
  if (settings && settings[achievementId] !== undefined) {
    return settings[achievementId];
  }
  // Fallback to legacy hardcoded logic
  const configScore = getAchievementScore(achievementId);
  if (configScore === 1) return 20;
  if (configScore <= 3) return 15;
  if (configScore <= 6) return 10;
  if (configScore <= 10) return 5;
  if (configScore <= 12) return 3;
  return 1;
};

export const calculateTotalScore = (candidate, settings) => {
  let score = 0;
  
  // 1. Thâm niên (1 điểm mỗi năm từ ngày tuyển dụng/hết tập sự, hoặc theo settings)
  const dateRec = candidate.decisionRecruitment?.date || candidate.decisionProbation?.date;
  if (dateRec) {
    const probDate = new Date(dateRec);
    const now = new Date();
    const diffTime = Math.abs(now - probDate);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    score += diffYears * (settings?.seniority_per_year ?? 1);
  }
  
  // 2. Thành tích
  if (candidate.achievements && Array.isArray(candidate.achievements)) {
    candidate.achievements.forEach(a => {
      score += getPointsForAchievement(a.id, settings);
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
