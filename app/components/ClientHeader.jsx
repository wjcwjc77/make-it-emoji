"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function HeaderTitle({ pathname }) {
  let title = "成语表情包挑战";
  
  if (pathname === "/game") {
    title = "猜成语";
  } else if (pathname === "/result") {
    title = "挑战结果";
  }
  
  return (
    <h1 className="text-xl sm:text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-amber-500">
      {title}
    </h1>
  );
}

export default function ClientHeader() {
  // 使用 usePathname 在客户端获取当前路径
  const pathname = usePathname();
  
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 shadow-sm">
      <div className="container mx-auto px-3 sm:px-6 py-3 flex items-center max-w-6xl">
        {/* Logo and name - aligned left on all screen sizes */}
        <div className="flex items-center mr-4">
          <Link href="/" className="text-lg sm:text-xl font-bold flex items-center gap-1 sm:gap-2">
            <Image src="/favicon.ico" alt="emoji-master.com" width={32} height={32} className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="truncate hidden sm:inline">emoji-master.com</span>
            <span className="truncate sm:hidden">emoji</span>
          </Link>
        </div>
        
        {/* Page title - centered */}
        <div className="flex-1 text-center">
          <HeaderTitle pathname={pathname} />
        </div>
        
        {/* Navigation - aligned right on all screen sizes */}
        <nav className="ml-4">
          <ul className="flex gap-3 sm:gap-6 text-sm sm:text-base font-medium">
            <li>
              <Link 
                href="/" 
                className={`hover:text-primary transition-colors ${
                  pathname === "/" ? "text-primary font-semibold" : ""
                }`}
              >
                首页
              </Link>
            </li>
            <li>
              <Link 
                href="/game" 
                className={`hover:text-primary transition-colors ${
                  pathname === "/game" ? "text-primary font-semibold" : ""
                }`}
              >
                挑战
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 