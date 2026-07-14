import { ACHIEVEMENT_LEVELS } from '../data/config';

const getAchievementScore = (achievementId) => {
  const ach = ACHIEVEMENT_LEVELS.find(a => a.id === achievementId);
  return ach ? ach.score : 999;
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
