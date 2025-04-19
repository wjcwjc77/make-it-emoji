/**
 * 成语表情游戏本地评分模块
 * 使用预计算的标准答案进行评分，减少对大模型API的依赖
 */

// 加载预计算的成语表情数据
import enhancedChengyu from '../../data/enhanced_chengyu.json';

/**
 * 计算用户选择的表情与标准答案的相似度
 * @param {Array<string>} userEmojis 用户选择的表情数组
 * @param {string} standardEmojis 标准答案表情字符串(空格分隔)
 * @returns {number} 相似度分数 (0-1)
 */
export function calculateSimilarity(userEmojis, standardEmojis) {
  if (!userEmojis || !userEmojis.length || !standardEmojis) {
    return 0;
  }

  const standardArray = standardEmojis.split(' ');
  
  // 计算重叠的表情数量
  const overlap = userEmojis.filter(emoji => standardArray.includes(emoji));
  
  // 计算相似度 (综合考虑重叠率和长度匹配)
  const overlapScore = overlap.length / Math.max(standardArray.length, 1);
  const lengthPenalty = Math.abs(userEmojis.length - standardArray.length) / Math.max(standardArray.length, 1);
  
  // 综合得分
  let similarity = overlapScore * (1 - lengthPenalty * 0.2);
  
  // 确保分数在0-1范围内
  return Math.max(0, Math.min(1, similarity));
}

/**
 * 生成AI评语
 * @param {Array<string>} userEmojis 用户选择的表情
 * @param {string} standardEmojis 标准答案表情
 * @param {number} similarity 相似度
 * @param {string} phrase 成语
 * @returns {string} 评语
 */
export function generateComparison(userEmojis, standardEmojis, similarity, phrase) {
  let comment = '';
  
  // 根据相似度生成不同的评语
  if (similarity >= 0.9) {
    comment = `太棒了！你选择的表情非常准确地表达了"${phrase}"的含义。`;
  } else if (similarity >= 0.7) {
    comment = `不错！你选择的表情很好地传达了"${phrase}"的意思，还有一点小改进空间。`;
  } else if (similarity >= 0.5) {
    comment = `有点接近了！你的表情选择部分捕捉到了"${phrase}"的含义，但还可以更准确。`;
  } else if (similarity >= 0.3) {
    comment = `尝试不错，但你的表情选择与"${phrase}"的本意有些距离。再想想？`;
  } else {
    comment = `看起来你的表情选择与"${phrase}"的含义有较大差异。查看我的建议，了解这个成语如何用表情表达。`;
  }
  
  // 添加表情建议
  comment += `\n\n我推荐使用 ${standardEmojis} 来表达"${phrase}"。`;
  
  return comment;
}

/**
 * 本地评分函数
 * @param {Array<string>} userEmojis 用户选择的表情
 * @param {string} phrase 成语
 * @returns {Object|null} 评分结果或null(如果没有预计算数据)
 */
export function localScoring(userEmojis, phrase) {
  // 检查是否有预计算数据
  // if (!enhancedChengyu[phrase]) {
  //   // 这里得让模型生成一个standardData.bestAnswer
  //   return null; // 没有预计算数据，需要回退到API
  // }
  
  
  const standardData = enhancedChengyu[phrase];
  const similarity = calculateSimilarity(userEmojis, standardData.bestAnswer);
const score = Math.max(Math.round(similarity * 100), 70);
  // 如果是用户自己输入的name，那么就让模型来生成一个；如果用户选择的是别人的name，那就直接使用enhancedChengyu
  
  return {
    score,
    suggestedEmojis: standardData.bestAnswer,
    comparison: generateComparison(userEmojis, standardData.bestAnswer, similarity, phrase),
    reason: standardData.reason || ''
  };
} 