import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const data = await req.json();
    
    // 直接在路由处理器中获取 IP
    let clientIP = "unknown";
    
    // 注意: 在 Next.js 中，headers() 需要直接在路由处理器中使用
    const headersList = headers();
    
    // 尝试从前端传递的 IP 获取
    if (data.player_ip && data.player_ip !== 'fetch-failed' && data.player_ip !== 'unknown') {
      clientIP = data.player_ip;
    } 
    // 如果前端没有成功获取 IP，尝试从请求头获取
    else {
      try {
        const forwardedFor = headersList.get('x-forwarded-for');
        const realIP = headersList.get('x-real-ip');
        
        if (forwardedFor) {
          clientIP = forwardedFor.split(',')[0].trim();
        } else if (realIP) {
          clientIP = realIP;
        } else {
          clientIP = "::1"; // 本地回环地址
        }
      } catch (err) {
        console.error('Error getting headers:', err);
      }
    }
    
    console.log('Client IP:', clientIP);
    
    // 构建要保存的数据
    const playerData = {
      ...data,
      player_ip: clientIP,
      model_feedback: data.model_feedback || '暂无评语'
    };
    
    console.log("Saving data with IP:", {
      ...playerData,
      model_feedback: playerData.model_feedback.substring(0, 30) + '...' // 日志中截断评语
    });
    
    // 即发即忘模式: 立即返回响应，同时在后台处理数据库操作
    // 不使用await，让数据库操作在后台进行
    supabase.from("emoji_annotations").insert(playerData)
      .then(({ error }) => {
        if (error) {
          console.error("Supabase error:", error);
        } else {
          console.log("Data saved successfully");
        }
      })
      .catch(error => {
        console.error("Database operation failed:", error);
      });
    
    // 立即返回成功响应
    return NextResponse.json({ 
      success: true,
      ip: clientIP 
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 