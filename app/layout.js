import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Emoji 大师 - 成语表情挑战",
  description: "用Emoji表达中国成语，挑战你的创意思维！",
  keywords: ["emoji", "成语", "中文", "游戏", "创意"],
  authors: [{ name: "Emoji 大师" }],
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold flex items-center gap-2">
              <img src="/favicon.ico" alt="Emoji 大师" className="w-8 h-8" />
              <span>Emoji 大师</span>
            </a>
            <nav>
              <ul className="flex gap-4">
                <li>
                  <a href="/" className="hover:text-primary transition-colors">首页</a>
                </li>
                <li>
                  <a href="/game" className="hover:text-primary transition-colors">挑战</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="pt-16">
          {children}
        </main>
        <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Emoji 大师 - 成语表情挑战</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
