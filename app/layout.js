import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ClientHeader from "./components/ClientHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "emoji-master.com - 成语表情挑战",
  description: "用Emoji表达中国成语，挑战你的创意思维！",
  keywords: ["emoji", "成语", "中文", "游戏", "创意"],
  authors: [{ name: "emoji-master" }],
};

export const viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientHeader />
        
        <main className="pt-16 sm:pt-20 flex-1">
          {children}
        </main>
        
        <footer className="mt-auto py-4 sm:py-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} emoji-master.com 成语表情挑战
              </p>
              <div className="flex gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Link href="/" className="hover:text-primary transition-colors">首页</Link>
                <Link href="/game" className="hover:text-primary transition-colors">开始挑战</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
