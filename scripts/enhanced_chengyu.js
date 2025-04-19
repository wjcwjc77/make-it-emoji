// 名字数据维护工具
// 用于向enhanced_chengyu.json添加新名字

const fs = require('fs');
const path = require('path');

// 读取现有数据
const enhancedDataPath = path.join(__dirname, '..', 'data', 'enhanced_chengyu.json');
console.log(`读取名字数据: ${enhancedDataPath}`);
let enhancedData = {};

try {
  enhancedData = require(enhancedDataPath);
  console.log(`成功读取现有数据，包含 ${Object.keys(enhancedData).length} 个名字`);
} catch (error) {
  console.log(`未找到现有数据或数据无效，将创建新文件`);
  enhancedData = {};
}

// 示例：添加新名字
function addNewChengyu(chengyu, bestAnswer, candidates, explanation, score = 100) {
  if (enhancedData[chengyu]) {
    console.log(`名字 "${chengyu}" 已存在，将更新其数据`);
  } else {
    console.log(`添加新名字: "${chengyu}"`);
  }

  // 确保bestAnswer是字符串形式的emoji，以空格分隔
  if (Array.isArray(bestAnswer)) {
    bestAnswer = bestAnswer.join(' ');
  }

  // 确保candidates是数组
  if (!Array.isArray(candidates)) {
    candidates = [candidates];
  }

  // 添加到数据结构
  enhancedData[chengyu] = {
    bestAnswer,
    candidates,
    score,
    explanation
  };
}

// 示例使用：
// 取消下面的注释并修改参数来添加新名字
/*
addNewChengyu(
  '新名字', // 名字
  '🐱 🐭 🧀 😋', // 最佳答案
  ['🐱', '🐭', '🧀', '😋', '🍽️', '🍗', '🍖', '🥩', '🥓', '🍔', '🌭', '🥪'], // 候选表情
  '名字的解释'
);
*/

// 保存数据
fs.writeFileSync(
  enhancedDataPath, 
  JSON.stringify(enhancedData, null, 2), 
  'utf8'
);

console.log(`数据已保存到 ${enhancedDataPath}`);
console.log(`当前共有 ${Object.keys(enhancedData).length} 个名字`);

// 使用说明
console.log('\n使用说明:');
console.log('1. 打开此文件');
console.log('2. 找到添加新名字的示例代码部分（被注释掉的addNewChengyu调用）');
console.log('3. 取消注释并修改参数来添加新名字');
console.log('4. 运行脚本: node scripts/enhanced_chengyu.js');
console.log('5. 检查data/enhanced_chengyu.json文件确认更改\n'); 