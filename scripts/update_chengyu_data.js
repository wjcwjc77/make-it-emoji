// 合并名字解释到名字数据中的脚本
const fs = require('fs');
const path = require('path');

// 读取文件
const enhancedChengyuPath = path.join(__dirname, '..', 'data', 'enhanced_chengyu.json');
const explanationsPath = path.join(__dirname, '..', 'data', 'idiom_explanations.json');

console.log(`读取名字数据: ${enhancedChengyuPath}`);
console.log(`读取解释数据: ${explanationsPath}`);

// 加载数据
const enhancedChengyu = require(enhancedChengyuPath);
const explanations = require(explanationsPath);

// 更新名字数据，添加解释
let updatedCount = 0;
let missingCount = 0;
const missingExplanations = [];

Object.keys(enhancedChengyu).forEach(idiom => {
  if (explanations[idiom]) {
    // 更新数据，添加解释字段
    enhancedChengyu[idiom].explanation = explanations[idiom];
    updatedCount++;
  } else {
    // 记录缺少解释的名字
    missingExplanations.push(idiom);
    missingCount++;
  }
});

// 保存更新后的数据
fs.writeFileSync(
  enhancedChengyuPath, 
  JSON.stringify(enhancedChengyu, null, 2), 
  'utf8'
);

console.log(`成功更新了 ${updatedCount} 个名字的解释`);

if (missingCount > 0) {
  console.log(`有 ${missingCount} 个名字缺少解释:`);
  console.log(missingExplanations.join(', '));
  console.log('请在idiom_explanations.json中添加这些名字的解释');
} 