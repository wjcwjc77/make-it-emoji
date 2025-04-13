# 本地预计算评分系统 - 开发者文档

## 概述

为了优化性能、降低API调用成本，我们在`emoji-master`项目中实现了本地预计算评分系统。这个系统允许应用在不调用大模型API的情况下，直接在前端或后端进行成语表情评分。

## 系统组件

### 1. 数据结构

位于`data/enhanced_chengyu.json`的预计算数据文件包含以下结构：

```json
{
  "成语": {
    "bestAnswer": "最佳表情组合",
    "candidates": [候选表情数组],
    "score": 100
  }
}
```

### 2. 评分模块

位于`app/utils/integrated_scoring.js`的评分模块提供以下功能：

- `localScoring(userEmojis, phrase)`: 主评分函数
- `calculateSimilarity(userEmojis, standardEmojis)`: 计算表情相似度
- `generateComparison(userEmojis, standardEmojis, similarity, phrase)`: 生成评语

### 3. API整合

在`app/api/score/route.js`中，我们整合了本地评分和API评分：

1. 首先尝试使用本地评分
2. 如果本地数据不可用，再回退到API调用

## 使用方法

### 客户端调用

```javascript
// 前端代码示例
async function getScore(phrase, emojis) {
  // 调用评分API
  const response = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      phrase, 
      emojis, 
      availableEmojis: [...] // 所有可用的表情
    }),
  });
  
  const result = await response.json();
  
  // 结果包含以下字段
  const { 
    score,               // 总分
    dimensionScores,     // 维度分数
    suggestedEmojis,     // 推荐表情
    comparison           // 评语
  } = result;
  
  return result;
}
```

### 服务端直接使用

```javascript
import { localScoring } from '../utils/integrated_scoring';

// 在服务端直接使用本地评分
export async function someServerFunction(phrase, emojis) {
  // 尝试本地评分
  const result = localScoring(emojis, phrase);
  
  if (result) {
    // 使用本地评分结果
    return { ...result };
  } else {
    // 需要调用API
    // ...实现API调用逻辑
  }
}
```

## 维护与更新

### 添加新成语

要添加新的成语到游戏中，请按照以下步骤操作：

1. 修改`data/enhanced_chengyu.json`添加新成语，格式如下：
```json
"新成语": {
  "bestAnswer": "最佳emoji组合，以空格分隔",
  "candidates": [
    "emoji1",
    "emoji2",
    "emoji3",
    // 添加多个候选emoji
  ],
  "score": 100,
  "explanation": "成语的解释"
}
```

2. 确保至少包含以下字段：
   - `bestAnswer`: 最佳答案组合（用空格分隔的emoji）
   - `candidates`: 候选emoji数组（至少包含12个emoji）
   - `explanation`: 成语的解释
   - `score`: 满分值（通常为100）

3. 重新构建并部署应用

### 优化评分算法

可以在`app/utils/integrated_scoring.js`中修改评分逻辑，包括：

1. 调整相似度计算方法
2. 改进评语生成规则
3. 加入更多评分维度

## 技术细节

### 相似度计算

当前相似度计算主要考虑：
- 重叠表情的比例
- 表情数量的匹配程度

```javascript
// 主要相似度计算逻辑
const overlapScore = overlap.length / Math.max(standardArray.length, 1);
const lengthPenalty = Math.abs(userEmojis.length - standardArray.length) / Math.max(standardArray.length, 1);
let similarity = overlapScore * (1 - lengthPenalty * 0.2);
```

### 评语生成

评语生成基于相似度分数，分为5个不同级别的反馈：
- 90%+: 极佳评价
- 70-90%: 很好评价
- 50-70%: 良好评价
- 30-50%: 一般评价
- <30%: 鼓励性评价 