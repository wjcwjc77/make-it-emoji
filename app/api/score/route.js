import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
     baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function POST(req) {
  console.log("API route called");
  const { phrase, emojis, availableEmojis } = await req.json();
  
  // 去重处理emoji池
  const uniqueAvailableEmojis = [...new Set(availableEmojis)];
  
  console.log("Received request:", { 
    phrase, 
    emojis, 
    availableEmojisCount: availableEmojis.length,
    uniqueAvailableEmojisCount: uniqueAvailableEmojis.length 
  });

  try {
    // 第一步：获取大模型对这个成语的理想emoji表达
    console.log("Step 1: Getting ideal emoji expression...");
    const idealExpressionPrompt = `你是一个精通中文成语和Emoji表达的专家。请为以下成语提供最佳的Emoji表达方式。

成语：「${phrase}」
可用的Emoji池：${uniqueAvailableEmojis.join(" ")}

请完成以下任务：
1. 从提供的Emoji池中选择3-5个最能表达该成语含义的emoji组合
2. 提供简短解释，说明这些emoji如何表达成语的含义

请严格按照以下格式返回：
答案：emoji1 emoji2 emoji3（必须从可用的Emoji池中选择，不要创造新emoji）
解释：解释这些emoji如何表达成语的含义`;

    // 第二步：独立评分prompt，不依赖理想答案
    console.log("Step 2: Creating scoring prompt...");
    const scoringPrompt = `你是一个善于发现创意、充满鼓励的Emoji成语评分专家。你的任务是评价玩家对成语的Emoji表达，重点是发掘玩家表达的独特性和创造力。

成语：「${phrase}」
玩家的Emoji组合：${emojis.join(" ")}

请从以下三个维度为玩家的Emoji组合打分（每项0~100分）：
1. 创意性：是否有独特的表达方式
2. 巧妙度：是否巧妙运用了emoji的多重含义
3. 表达力：是否让人一眼就能理解

重要指导原则：
- 请偏向给予玩家高分，特别是在创意性方面
- 积极发掘玩家表达中的亮点，不管多小
- 点评中只夸奖玩家，不做对比
- 让玩家感觉自己的表达非常有创意、独特
- 表达真诚的赞美，不要用勉强的语气
- 避免使用"但是"、"然而"等转折词
- 即使玩家的表达与常规理解不同，也要赞美其独特视角

请严格按照以下格式返回：
创意性分数：XX
巧妙度分数：XX
表达力分数：XX
点评：只夸奖玩家的emoji组合，突出其独特性和创意`;

    // 并发执行两个请求
    console.log("Executing both requests concurrently...");
    const [idealExpressionResponse, scoringResponse] = await Promise.all([
      openai.chat.completions.create({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: idealExpressionPrompt }],
      }),
      openai.chat.completions.create({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: scoringPrompt }],
      })
    ]);
    
    // 处理理想表达结果
    const idealExpressionContent = idealExpressionResponse.choices[0].message.content.trim();
    console.log("Ideal expression response:", idealExpressionContent);
    
    // 提取理想emoji组合和解释
    const idealAnswerMatch = idealExpressionContent.match(/答案[:：]\s*([^\n]+)/);
    let idealEmojis = idealAnswerMatch ? idealAnswerMatch[1].trim() : '';
    
    const explanationMatch = idealExpressionContent.match(/解释[:：]\s*([\s\S]+)$/);
    let explanation = explanationMatch ? explanationMatch[1].trim() : '';
    
    // 验证理想emoji，确保只使用可用的emoji
    const validIdealEmojis = idealEmojis.split(/\s+/).filter(emoji => 
      uniqueAvailableEmojis.includes(emoji)
    );
    
    idealEmojis = validIdealEmojis.length ? validIdealEmojis.join(' ') : emojis.join(' ');
    
    // 处理评分结果
    const scoringContent = scoringResponse.choices[0].message.content.trim();
    console.log("Scoring response:", scoringContent);
    
    // 提取各维度分数
    const creativityMatch = scoringContent.match(/创意性分数[:：]\s*(\d+)/);
    const clevernessMatch = scoringContent.match(/巧妙度分数[:：]\s*(\d+)/);
    const expressivenessMatch = scoringContent.match(/表达力分数[:：]\s*(\d+)/);
    
    // 确保创意性分数偏高，至少75分起步
    const creativityScore = creativityMatch ? Math.max(75, parseInt(creativityMatch[1], 10)) : 85;
    const clevernessScore = clevernessMatch ? parseInt(clevernessMatch[1], 10) : 85;
    const expressivenessScore = expressivenessMatch ? parseInt(expressivenessMatch[1], 10) : 85;
    
    // 为分数添加随机波动，但确保创意性分数始终较高
    const addRandomVariation = (score, isCreativity = false) => {
      // 创意性分数的随机波动偏向正向
      const variation = isCreativity 
        ? Math.floor(Math.random() * 8) // 0-7的正向波动
        : Math.floor(Math.random() * 11) - 5; // -5到5的普通波动
      // 应用随机波动并确保分数在0-100范围内
      return Math.max(0, Math.min(100, score + variation));
    };
    
    // 为每个维度分数添加随机波动
    const finalCreativityScore = addRandomVariation(creativityScore, true);
    const finalClevernessScore = addRandomVariation(clevernessScore);
    const finalExpressivenessScore = addRandomVariation(expressivenessScore);
    
    // 计算平均分，但略微提高权重使分数更好看
    const score = Math.round((finalCreativityScore * 1.2 + finalClevernessScore + finalExpressivenessScore) / 3.2);
    
    // 提取点评
    const comparisonMatch = scoringContent.match(/点评[:：]\s*([\s\S]+)$/);
    let comparison = comparisonMatch ? comparisonMatch[1].trim() : '';
    
    // 如果没有点评，生成默认点评
    if (!comparison) {
      console.log("No comparison found, generating default feedback");
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
      console.log("Detected potentially negative comparison patterns, cleaned up text");
    }
    
    // 检查并清理点评中的emoji，确保只使用可用的emoji
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const emojisInComparison = comparison.match(emojiRegex) || [];
    
    // 找出点评中不在可用emoji池中的emoji
    const invalidEmojisInComparison = emojisInComparison.filter(emoji => 
      !uniqueAvailableEmojis.includes(emoji) && !emojis.includes(emoji)
    );
    
    if (invalidEmojisInComparison.length > 0) {
      console.log("Found invalid emojis in comparison text:", invalidEmojisInComparison);
      
      // 替换掉点评中的无效emoji，用文字描述替代
      invalidEmojisInComparison.forEach(invalidEmoji => {
        comparison = comparison.replace(
          new RegExp(invalidEmoji, 'g'), 
          `"${invalidEmoji}"`
        );
      });
      
      console.log("Cleaned comparison text to remove invalid emojis");
    }
    
    console.log("Dimension scores:", {
      creativity: finalCreativityScore,
      cleverness: finalClevernessScore,
      expressiveness: finalExpressivenessScore
    });
    console.log("Average score:", score);
    console.log("Ideal emojis:", idealEmojis);
    console.log("Comparison:", comparison);

    return NextResponse.json({ 
      score,
      dimensionScores: {
        creativity: finalCreativityScore,
        cleverness: finalClevernessScore,
        expressiveness: finalExpressivenessScore
      },
      suggestedEmojis: idealEmojis,
      comparison
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
