import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// 导入本地评分模块，用于获取最佳答案的匹配得分
import { localScoring } from '../../utils/integrated_scoring';

const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
     baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function POST(req) {
  const requestId = Date.now().toString(36); // 生成一个请求ID用于追踪
  console.log(`=== 开始处理请求 ${requestId} ===`);
  
  try {
    console.log("API route called");
    const { phrase, emojis, availableEmojis } = await req.json();
    
    // 基本参数验证
    if (!phrase || !emojis || !Array.isArray(emojis) || emojis.length === 0) {
      console.error(`[${requestId}] 请求参数无效:`, { phrase, emojis: Array.isArray(emojis) ? emojis.length : emojis });
      return NextResponse.json({ error: "无效的请求参数" }, { status: 400 });
    }
    
    // 去重处理emoji池
    const uniqueAvailableEmojis = [...new Set(availableEmojis || [])];
    
    console.log(`[${requestId}] Received request:`, { 
      phrase, 
      emojis, 
      availableEmojisCount: availableEmojis ? availableEmojis.length : 0,
      uniqueAvailableEmojisCount: uniqueAvailableEmojis.length 
    });

    // 1. 获取本地匹配得分 (70%)
    console.log(`[${requestId}] Getting local matching score for:`, phrase);
    let localResult = null;
    try {
      localResult = localScoring(emojis, phrase);
      console.log(`[${requestId}] localScoring返回值:`, localResult);
    } catch (err) {
      console.error(`[${requestId}] 本地评分出错:`, err);
      localResult = null;
    }
    
    let localMatchScore = 0;
    let localSuggestedEmojis = emojis.join(' ');
    
    // 如果有本地评分结果，提取分数和建议的表情
    if (localResult && typeof localResult.score === 'number') {
      console.log(`[${requestId}] Local score available:`, localResult.score);
      localMatchScore = localResult.score;
      localSuggestedEmojis = localResult.suggestedEmojis || emojis.join(' ');
    } else {
      console.log(`[${requestId}] No local score available, using default value`);
      // 如果没有本地评分，默认给予一个中等分数
      localMatchScore = 70;
    }
    
    // 清晰打印本地匹配得分部分 (70%)
    console.log(`[${requestId}] ----------------------------`);
    console.log(`[${requestId}] ★ 本地匹配得分 (70%权重): ${localMatchScore}`);
    console.log(`[${requestId}] ★ 加权后得分: ${Math.round(localMatchScore * 0.7)}`);
    console.log(`[${requestId}] ----------------------------`);
    
    // 2. 获取大模型评分 (30%)
    console.log(`[${requestId}] Getting LLM creativity score...`);
    
    // 创建评分prompt
    console.log(`[${requestId}] Creating scoring prompt...`);
    const scoringPrompt = `作为一位Emoji表达评分专家，请评价以下玩家对成语的表达：

成语：「${phrase}」
玩家使用的表情：${emojis.join(" ")}

请评分（0-100分）：
1. 创意性：表达方式的独特性
2. 巧妙度：表情符号使用的巧妙程度
3. 表达力：表达的清晰度和易懂性

评分指南：
- 发掘表达中的亮点和创意之处
- 积极肯定玩家的表达
- 保持鼓励性的评价
- 避免使用否定性词语

请按以下格式回复：
创意性分数：XX
巧妙度分数：XX
表达力分数：XX
点评：[积极评价玩家的表达]`;

    // 执行大模型评分请求 - 增强错误处理
    console.log(`[${requestId}] Executing scoring request...`);
    let scoringResponse;
    try {
      scoringResponse = await openai.chat.completions.create({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that evaluates emoji expressions.' },
          { role: 'user', content: scoringPrompt }
        ],
      });
    } catch (err) {
      console.error(`[${requestId}] 大模型API调用失败:`, err);
      console.log(`[${requestId}] 使用备用评分方案`);
      
      // 创建一个备用响应
      scoringResponse = {
        choices: [{
          message: {
            content: `创意性分数：${Math.min(85, localMatchScore + 5)}
巧妙度分数：${Math.min(88, localMatchScore + 8)}
表达力分数：${Math.min(82, localMatchScore + 2)}
点评：太棒了！你对「${phrase}」的表情表达非常有创意！你选择的表情组合巧妙地捕捉到了成语的精髓，展现了独特的思考方式。这种新颖的表达方式让人眼前一亮！`
          }
        }]
      };
    }
    
    // 处理评分结果
    const scoringContent = scoringResponse.choices[0].message.content.trim();
    console.log(`[${requestId}] Scoring response:`, scoringContent);
    
    // 提取各维度分数
    const creativityMatch = scoringContent.match(/创意性分数[:：]\s*(\d+)/);
    const clevernessMatch = scoringContent.match(/巧妙度分数[:：]\s*(\d+)/);
    const expressivenessMatch = scoringContent.match(/表达力分数[:：]\s*(\d+)/);
    
    // 解析各维度分数
    const creativityScore = creativityMatch ? parseInt(creativityMatch[1], 10) : 80;
    const clevernessScore = clevernessMatch ? parseInt(clevernessMatch[1], 10) : 80;
    const expressivenessScore = expressivenessMatch ? parseInt(expressivenessMatch[1], 10) : 80;
    
    // 为分数添加随机波动，所有维度使用相同逻辑
    const addRandomVariation = (score) => {
      // 所有维度都使用相同的随机波动范围：-5到5
      const variation = Math.floor(Math.random() * 11) - 5;
      // 应用随机波动并确保分数在0-100范围内
      return Math.max(0, Math.min(100, score + variation));
    };
    
    // 为每个维度分数添加随机波动
    const finalCreativityScore = addRandomVariation(creativityScore);
    const finalClevernessScore = addRandomVariation(clevernessScore);
    const finalExpressivenessScore = addRandomVariation(expressivenessScore);
    
    // 计算大模型的平均分
    const llmScore = Math.round((finalCreativityScore + finalClevernessScore + finalExpressivenessScore) / 3);
    console.log(`[${requestId}] LLM average score:`, llmScore);
    
    // 清晰打印大模型评分部分 (30%)
    console.log(`[${requestId}] ----------------------------`);
    console.log(`[${requestId}] ★ 大模型维度分数:`);
    console.log(`[${requestId}]   - 创意性: ${finalCreativityScore}`);
    console.log(`[${requestId}]   - 巧妙度: ${finalClevernessScore}`);
    console.log(`[${requestId}]   - 表达力: ${finalExpressivenessScore}`);
    console.log(`[${requestId}] ★ 大模型平均分 (30%权重): ${llmScore}`);
    console.log(`[${requestId}] ★ 加权后得分: ${Math.round(llmScore * 0.3)}`);
    console.log(`[${requestId}] ----------------------------`);
    
    // 3. 计算最终的综合分数，给分数较低的部分70%权重
    let weightedLocalScore, weightedLlmScore;
    if (localMatchScore < llmScore) {
      weightedLocalScore = Math.round(localMatchScore * 0.7);
      weightedLlmScore = Math.round(llmScore * 0.3);
    } else {
      weightedLocalScore = Math.round(localMatchScore * 0.3);
      weightedLlmScore = Math.round(llmScore * 0.7);
    }
    const finalScore = weightedLocalScore + weightedLlmScore;
    
    // 清晰打印最终综合分数
    console.log(`[${requestId}] ===========================`);
    console.log(`[${requestId}] ★★★ 最终得分计算: ★★★`);
    console.log(`[${requestId}] 本地匹配得分: ${localMatchScore} × ${localMatchScore < llmScore ? '70%' : '30%'} = ${weightedLocalScore}`);
    console.log(`[${requestId}] 大模型评分: ${llmScore} × ${llmScore < localMatchScore ? '70%' : '30%'} = ${weightedLlmScore}`);
    console.log(`[${requestId}] 合计总分: ${finalScore}`);
    console.log(`[${requestId}] ===========================`);
    
    // 提取点评
    const comparisonMatch = scoringContent.match(/点评[:：]\s*([\s\S]+)$/);
    let comparison = comparisonMatch ? comparisonMatch[1].trim() : '';
    
    // 如果没有点评，生成默认点评
    if (!comparison) {
      console.log(`[${requestId}] No comparison found, generating default feedback`);
      comparison = `太有创意了！你对「${phrase}」的emoji表达非常独特，展现了与众不同的思维方式。你选择的组合不仅形象生动，而且巧妙地捕捉到了成语的精髓。你的表达方式让人眼前一亮，真的很有想象力！`;
    }
    
    // 检查点评是否包含对比或建议，可能需要过滤
    const negativePatterns = [
      /但是/g, /然而/g, /不过/g, /可惜/g, /遗憾/g, /不足/g, /改进/g, /建议/g, 
      /可以更/g, /不如/g, /比较/g, /相比/g, /理想/g, /标准/g
    ];
    
    let hasNegativePattern = false;
    negativePatterns.forEach(pattern => {
      if (pattern.test(comparison)) {
        hasNegativePattern = true;
        comparison = comparison.replace(pattern, "，");
      }
    });
    
    if (hasNegativePattern) {
      console.log(`[${requestId}] Detected potentially negative comparison patterns, cleaned up text`);
    }
    
    // 改进的Emoji检测正则表达式，更全面地覆盖各种Emoji格式
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})/gu;
    const emojisInComparison = comparison.match(emojiRegex) || [];
    
    // 找出点评中不在可用emoji池中的emoji
    const invalidEmojisInComparison = emojisInComparison.filter(emoji => 
      !uniqueAvailableEmojis.includes(emoji) && !emojis.includes(emoji)
    );
    
    if (invalidEmojisInComparison.length > 0) {
      console.log(`[${requestId}] Found invalid emojis in comparison text:`, invalidEmojisInComparison);
      
      // 替换掉点评中的无效emoji，用文字描述替代
      invalidEmojisInComparison.forEach(invalidEmoji => {
        comparison = comparison.replace(
          new RegExp(invalidEmoji, 'g'), 
          `"${invalidEmoji}"`
        );
      });
      
      console.log(`[${requestId}] Cleaned comparison text to remove invalid emojis`);
    }
    
    console.log(`[${requestId}] Dimension scores:`, {
      creativity: finalCreativityScore,
      cleverness: finalClevernessScore,
      expressiveness: finalExpressivenessScore
    });
    
    // 构建响应对象
    const responseData = { 
      score: finalScore,
      dimensionScores: {
        creativity: finalCreativityScore,
        cleverness: finalClevernessScore,
        expressiveness: finalExpressivenessScore
      },
      suggestedEmojis: localSuggestedEmojis,
      comparison
    };
    
    // 记录最终结果
    console.log(`[${requestId}] 最终响应数据:`, responseData);
    console.log(`=== 请求 ${requestId} 处理完成 ===`);
    
    // 返回结果
    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`[${requestId}] Error in API route:`, error);
    console.log(`=== 请求 ${requestId} 出错 ===`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
