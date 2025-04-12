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
   - 从【可用的Emoji池】中选择3-5个emoji组成最佳组合
   - 这个组合应该完整地表达成语的含义
   - 可以采用不同于玩家的新思路
   - 如果玩家的组合已经很完美，可以采用相同的组合

3. 欣赏点评：
   - 先表扬玩家表达中的亮点
   - 解释你的答案是如何表达成语含义的
   - 鼓励玩家继续创作

请严格按照以下格式返回：
分数：XX
答案：emoji1 emoji2 emoji3（必须从可用的Emoji池中选择）
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
    
    // Parse score, suggested emojis, and comparison
    const lines = content.split('\n');
    const score = parseInt(lines[0].replace(/[^0-9]/g, ''), 10);
    
    // 验证和过滤emoji，确保只使用可用的emoji
    let suggestedEmojis = lines[1]?.replace('答案：', '').trim() || '';
    const validEmojis = suggestedEmojis.split(/\s+/).filter(emoji => 
      availableEmojis.includes(emoji)
    );
    
    // 如果没有有效的emoji建议或建议的emoji不在可用池中，使用玩家的组合
    if (!validEmojis.length) {
      console.log("No valid emojis found in suggestion or emojis not in available pool, using player's combination");
      suggestedEmojis = emojis.join(' ');
    } else {
      suggestedEmojis = validEmojis.join(' ');
    }
    
    const comparison = lines[2]?.replace('点评：', '').trim() || '';
    
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
