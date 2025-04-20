import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// 导入本地评分模块，用于获取最佳答案的匹配得分
import { localScoring } from '../../utils/integrated_scoring';
const openai = new OpenAI({
     apiKey: process.env.DEEPSEEK_API_KEY,
     baseURL: "https://api.deepseek.com",
});
import enhancedChengyu from '../../../data/enhanced_chengyu.json';
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

    // 获取本地匹配得分 (100%)
    console.log(`[${requestId}] Getting local matching score for:`, phrase);
    let localResult = null;
    if (enhancedChengyu.hasOwnProperty(phrase)) {
      try {
        localResult = localScoring(emojis, phrase);
        console.log(`[${requestId}] localScoring返回值:`, localResult);
      } catch (err) {
        console.error(`[${requestId}] 本地评分出错:`, err);
        const randomScore = Math.floor(Math.random() * 7) * 5 + 70;
        localResult = {
          score: randomScore,
          suggestedEmojis: emojis.join(' '),
          comparison: '',
          reason: ''
        };
      }
    }else{
      const randomScore = Math.floor(Math.random() * 7) * 5 + 70;
      localResult = {
        score: randomScore,
        suggestedEmojis: emojis.join(' '),
        comparison: '',
        reason: ''
      };
    }

    
    let finalScore = 0;

    if (!enhancedChengyu.hasOwnProperty(phrase)) {
      console.log(phrase,"1111111")
      try {
        const createUrl = `${process.env.NEXTAUTH_URL}/api/create`;
        console.log(`[${requestId}] 创建请求URL:`, createUrl);
        const res = await fetch(createUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phrase: phrase
          })
        });
        
        const data = await res.json();
        localResult.suggestedEmojis = data.emojis.join(' ');
        localResult.reason = data.reason;
        console.log(localResult.suggestedEmojis,"localResult.suggestedEmojis");
      } catch (error) {
        console.error('请求 /api/create 时出错:', error);
      }
    }
    let response_emojis = localResult.suggestedEmojis;
    let reason = localResult.reason;
    
    if (localResult && typeof localResult.score === 'number') {
      console.log(`[${requestId}] Local score available:`, localResult.score);
      finalScore = localResult.score;
    } else {
      console.log(`[${requestId}] No local score available, using default value`);
      // 如果没有本地评分，默认给予一个中等分数
      finalScore = 70;
    }
    
    // 清晰打印本地匹配得分部分 (100%)
    console.log(`[${requestId}] ----------------------------`);
    console.log(`[${requestId}] ★ 本地匹配得分 (100%权重): ${finalScore}`);
    console.log(`[${requestId}] ----------------------------`);
    
    // 获取大模型评价（不参与评分）
    console.log(`[${requestId}] Getting LLM feedback (not for scoring)...`);
    
    // 创建评价prompt
    console.log(`[${requestId}] Creating feedback prompt...`);
    const feedbackPrompt = `作为一位Emoji表达评价专家，请为玩家的名字表达提供积极的反馈：

名字：「${phrase}」
玩家使用的表情：${emojis.join(" ")}

请提供一段积极且鼓励性的评价，突出表达的创意性、巧妙度和表达力。请勿提供具体分数。

评价指南：
- 发掘表达中的亮点和创意之处
- 积极肯定玩家的表达
- 保持鼓励性的评价
- 避免使用否定性词语或建议改进的内容

请直接回复一段积极评价的文字，不需要包含"点评："等前缀。`;

    // 执行大模型评价请求 - 增强错误处理
    console.log(`[${requestId}] Executing feedback request...`);
    let feedbackResponse;
    try {
      feedbackResponse = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that evaluates emoji expressions.' },
          { role: 'user', content: feedbackPrompt }
        ],
      });
    } catch (err) {
      console.error(`[${requestId}] 大模型API调用失败:`, err);
      console.log(`[${requestId}] 使用备用评价`);
      
      // 创建一个备用响应
      feedbackResponse = {
        choices: [{
          message: {
            content: `太棒了！你对「${phrase}」的表情表达非常有创意！你选择的表情组合巧妙地捕捉到了名字的精髓，展现了独特的思考方式。这种新颖的表达方式让人眼前一亮！`
          }
        }]
      };
    }
    
    // 处理评价结果
    let comparison = feedbackResponse.choices[0].message.content.trim();
    console.log(`[${requestId}] Feedback response:`, comparison);
    
    // 检查评价是否包含对比或建议，可能需要过滤
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
    
    // 找出评价中不在可用emoji池中的emoji
    const invalidEmojisInComparison = emojisInComparison.filter(emoji => 
      !uniqueAvailableEmojis.includes(emoji) && !emojis.includes(emoji)
    );
    
    if (invalidEmojisInComparison.length > 0) {
      console.log(`[${requestId}] Found invalid emojis in comparison text:`, invalidEmojisInComparison);
      
      // 替换掉评价中的无效emoji，用文字描述替代
      invalidEmojisInComparison.forEach(invalidEmoji => {
        comparison = comparison.replace(
          new RegExp(invalidEmoji, 'g'), 
          `"${invalidEmoji}"`
        );
      });
      
      console.log(`[${requestId}] Cleaned comparison text to remove invalid emojis`);
    }
    
    // 构建响应对象 - 移除维度分数，只保留总分和评价
    const responseData = { 
      score: finalScore,
      suggestedEmojis: response_emojis,
      comparison,
      aiAnswerReason: reason
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
