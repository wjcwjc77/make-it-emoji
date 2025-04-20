import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  let ip = 'unknown';
  
  try {
    // 获取请求头
    const headersList = await headers();
    
    // 正确使用 headersList
    const forwardedFor = headersList.get('x-forwarded-for') || '';
    const realIP = headersList.get('x-real-ip') || '';
    const cfConnectingIP = headersList.get('cf-connecting-ip') || '';
    const xClientIP = headersList.get('x-client-ip') || '';
    
    // 设置 IP 优先级
    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      ip = realIP;
    } else if (cfConnectingIP) {
      ip = cfConnectingIP;
    } else if (xClientIP) {
      ip = xClientIP;
    } else {
      ip = '127.0.0.1'; // 本地开发环境
    }
    
    // 简化日志以避免过多输出
    console.log('Detected IP:', ip);
  } catch (error) {
    console.error('Error detecting IP:', error);
  }
  
  return NextResponse.json({ ip });
}