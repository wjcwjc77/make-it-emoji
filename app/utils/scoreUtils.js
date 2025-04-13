import { scoreRatings } from "../constants/scoreRatings";

/**
 * 根据分数获取评分等级和颜色
 * @param {number} score 用户得分
 * @returns {Object} 包含level和color的对象
 */
export const getScoreLevel = (score) => {
  // 寻找最接近的评分
  let closestScore = 0;
  const availableScores = Object.keys(scoreRatings).map(Number).sort((a, b) => b - a);
  
  for (const availableScore of availableScores) {
    if (score >= availableScore) {
      closestScore = availableScore;
      break;
    }
  }
  
  return scoreRatings[closestScore];
};