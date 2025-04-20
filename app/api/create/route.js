import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
     apiKey: process.env.DEEPSEEK_API_KEY,
     baseURL: "https://api.deepseek.com",
});

export async function POST(req) {
  const requestId = Date.now().toString(36); // 生成一个请求ID用于追踪
  console.log(`=== 开始生成  ${requestId} ===`);
  
  try {
    console.log("API route called");
    const { phrase } = await req.json();
    
    // 基本参数验证 - 只需要验证phrase
    if (!phrase) {
      console.error(`[${requestId}] 请求参数无效:`, { phrase });
      return NextResponse.json({ error: "无效的名字参数" }, { status: 400 });
    }
    
    
    console.log(`[${requestId}] Received request:`, { 
      phrase, 
    });


    const feedbackPrompt = `请根据下述名字，给出能表达这个名字的Emoji，要富有创造性：

名字：「${phrase}」
返回一个json：如下所示：
{
  "emojis": ["表情1", "表情2", "表情3"],
  "reason": "理由" 
}
。`;

    let feedbackResponse;
    try {
      feedbackResponse = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that can create emojis corresponding to names.' },
          { role: 'user', content: feedbackPrompt }
        ],
      });
    } catch (err) {
      console.error(`[${requestId}] 大模型API调用失败:`, err);
    }
    
    // 处理评价结果
    let rawContent = feedbackResponse.choices[0].message.content.trim();
    // 清理Markdown代码块
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '');
    let create_emoji;
    try {
      create_emoji = JSON.parse(rawContent);
    } catch (parseError) {
      console.error(`[${requestId}] JSON解析失败:`, parseError);
      create_emoji = {
        emojis: [],
        reason: '默认生成结果'
      };
    }

    console.log(`=== 请求 ${requestId} 处理完成 ===`);
    
    return NextResponse.json(create_emoji);
  } catch (error) {
    console.error(`[${requestId}] Error in API route:`, error);
    console.log(`=== 请求 ${requestId} 出错 ===`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
