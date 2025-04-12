import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
     baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function POST(req) {
  console.log("API route called");
  const { phrase, emojis, availableEmojis } = await req.json();
  console.log("Received request:", { phrase, emojis, availableEmojis });

  const prompt = `你是一个善于发现创意、充满鼓励的Emoji成语专家。你的主要任务是欣赏和发现玩家在Emoji组合中的独特见解，并提供你自己的完整答案。

任务：评价玩家的表达，并给出你认为最合适的Emoji组合。

成语：「${phrase}」
玩家的Emoji组合：${emojis.join(" ")}
可用的Emoji池：${availableEmojis.join(" ")}

请完成以下任务：

1. 仔细欣赏玩家的表达，从以下角度为玩家打分（0~100分）：
   - 创意性：是否有独特的表达方式
   - 巧妙度：是否巧妙运用了emoji的多重含义
   - 表达力：是否让人一眼就能理解
   记住：只要玩家的表达有任何亮点，就应该给予鼓励性的高分。

2. 给出你的完整答案：
   - 【重要】必须严格从以上【可用的Emoji池】列表中选择3-5个emoji组成最佳组合
   - 不要使用池中没有的emoji，否则答案将被拒绝
   - 这个组合应该完整地表达成语的含义
   - 可以采用不同于玩家的新思路
   - 如果玩家的组合已经很完美，可以采用相同的组合

3. 欣赏点评：
   - 先表扬玩家表达中的亮点
   - 解释你的答案是如何表达成语含义的
   - 鼓励玩家继续创作

请严格按照以下格式返回：
分数：XX
答案：emoji1 emoji2 emoji3（必须从可用的Emoji池中选择，不要创造新emoji）
点评：玩家创意点评 + AI答案解释`;
  console.log("Generated prompt:", prompt);

  try {
    console.log("Calling OpenAI API...");
    const response = await openai.chat.completions.create({
      model: 'qwen-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    console.log("OpenAI API Response:", JSON.stringify(response, null, 2));
    const content = response.choices[0].message.content.trim();
    console.log("Raw model response:", content);
    
    // 使用更稳健的方法提取信息
    const scoreMatch = content.match(/分数[:：]\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 85;
    
    // 提取回答部分
    const answerMatch = content.match(/答案[:：]\s*([^\n]+)/);
    let suggestedEmojis = answerMatch ? answerMatch[1].trim() : '';
    
    // 提取点评部分 - 使用正则表达式匹配"点评："之后的所有内容
    const comparisonMatch = content.match(/点评[:：]\s*([\s\S]+)$/);
    let comparison = comparisonMatch ? comparisonMatch[1].trim() : '';
    
    console.log("Extracted fields:", {
      score,
      suggestedEmojis,
      comparison: comparison.substring(0, 100) + (comparison.length > 100 ? '...' : '')
    });
    
    // 验证和过滤emoji，确保只使用可用的emoji
    const validEmojis = suggestedEmojis.split(/\s+/).filter(emoji => 
      availableEmojis.includes(emoji)
    );
    
    // 如果没有有效的emoji建议或建议的emoji不在可用池中，使用玩家的组合
    if (!validEmojis.length) {
      console.log("No valid emojis found in suggestion or emojis not in available pool, using player's combination");
      suggestedEmojis = emojis.join(' ');
    } else if (validEmojis.length < suggestedEmojis.split(/\s+/).length) {
      // 部分有效，记录无效的emoji
      const invalidEmojis = suggestedEmojis.split(/\s+/).filter(emoji => !availableEmojis.includes(emoji));
      console.log("Some invalid emojis were filtered out:", invalidEmojis);
      suggestedEmojis = validEmojis.join(' ');
    } else {
      suggestedEmojis = validEmojis.join(' ');
    }
    
    // 确保至少有一个emoji
    if (!suggestedEmojis.trim()) {
      console.log("Falling back to player's combination as suggested emojis are empty");
      suggestedEmojis = emojis.join(' ');
    }
    
    // 处理评价部分，确保不为空
    if (!comparison) {
      console.log("No comparison found, generating default feedback");
      comparison = `你的表情组合很有创意！${phrase}这个成语通过${suggestedEmojis}也能很好地表达。继续保持这种创造力！`;
    }
    
    console.log("Parsed score:", score);
    console.log("Suggested emojis:", suggestedEmojis);
    console.log("Comparison:", comparison);

    return NextResponse.json({ 
      score,
      suggestedEmojis,
      comparison
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
