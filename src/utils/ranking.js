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
  return compareCandidatesWithReason(a, b).result;
};

export const compareCandidatesWithReason = (a, b) => {
  const evalA = evaluateAchievements(a.achievements);
  const evalB = evaluateAchievements(b.achievements);

  if (evalA.highestScore !== evalB.highestScore) {
    return {
      result: evalA.highestScore - evalB.highestScore,
      reason: `Có thành tích cao hơn (Top #${Math.min(evalA.highestScore, evalB.highestScore)})`
    }; 
  }
  if (evalA.highestCount !== evalB.highestCount) {
    return {
      result: evalB.highestCount - evalA.highestCount,
      reason: `Nhiều thành tích cao nhất hơn (${Math.max(evalA.highestCount, evalB.highestCount)} so với ${Math.min(evalA.highestCount, evalB.highestCount)})`
    };
  }
  if (evalA.individualCount !== evalB.individualCount) {
    return {
      result: evalB.individualCount - evalA.individualCount,
      reason: `Nhiều thành tích cá nhân hơn (${Math.max(evalA.individualCount, evalB.individualCount)} so với ${Math.min(evalA.individualCount, evalB.individualCount)})`
    };
  }

  if (a.gender === 'Nữ' && b.gender !== 'Nữ') return { result: -1, reason: 'Ưu tiên giới tính Nữ' };
  if (a.gender !== 'Nữ' && b.gender === 'Nữ') return { result: 1, reason: 'Ưu tiên giới tính Nữ' };

  const isMinorityA = a.ethnicity && a.ethnicity.toLowerCase() !== 'kinh';
  const isMinorityB = b.ethnicity && b.ethnicity.toLowerCase() !== 'kinh';
  if (isMinorityA && !isMinorityB) return { result: -1, reason: 'Ưu tiên Dân tộc thiểu số' };
  if (!isMinorityA && isMinorityB) return { result: 1, reason: 'Ưu tiên Dân tộc thiểu số' };

  if (a.dob && b.dob) {
    const timeA = new Date(a.dob).getTime();
    const timeB = new Date(b.dob).getTime();
    if (timeA !== timeB) {
      return {
        result: timeA - timeB,
        reason: 'Ưu tiên người lớn tuổi hơn'
      };
    }
  }

  const dateRecA = a.decisionRecruitment?.date || a.decisionProbation?.date;
  const dateRecB = b.decisionRecruitment?.date || b.decisionProbation?.date;
  
  if (dateRecA && dateRecB) {
    const timeA = new Date(dateRecA).getTime();
    const timeB = new Date(dateRecB).getTime();
    if (timeA !== timeB) {
      return {
        result: timeA - timeB,
        reason: 'Ưu tiên người có thâm niên công tác lâu hơn'
      };
    }
  }

  return { result: 0, reason: 'Cùng hạng' };
};
