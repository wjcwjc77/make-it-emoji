import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  let ip = 'unknown';
  
  // 直接使用 headers() API
  const headersList = headers();
  
  try {
    // 尝试从各种头信息中获取IP
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
      ip = '::1'; // 本地开发环境
    }
    
    // 简化日志以避免过多输出
    console.log('Detected IP:', ip);
  } catch (error) {
    console.error('Error detecting IP:', error);
  }
  
  return NextResponse.json({ ip });
} 