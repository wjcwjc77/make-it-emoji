import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "./utils/i18n";
import { LanguageSwitcherClient } from "./components/LanguageSwitcherClient";
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
  title: "emoji-master - 成语表情挑战",
  description: "用Emoji表达中国成语，挑战你的创意思维！",
  keywords: ["emoji", "成语", "中文", "游戏", "创意"],
  authors: [{ name: "emoji-master" }],
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
        <LanguageProvider>
          <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <a href="/" className="text-2xl font-bold flex items-center gap-2">
                <img src="/favicon.ico" alt="emoji-master" className="w-8 h-8" />
                <span>emoji-master</span>
              </a>
              <div className="flex items-center gap-4">
                <nav>
                  <ul className="flex gap-4">
                    <li>
                      <a href="/" className="hover:text-primary transition-colors">
                        <TranslatedText textKey="nav.home" fallback="首页" />
                      </a>
                    </li>
                    <li>
                      <a href="/game" className="hover:text-primary transition-colors">
                        <TranslatedText textKey="nav.challenge" fallback="挑战" />
                      </a>
                    </li>
                  </ul>
                </nav>
                <LanguageSwitcherClient />
              </div>
            </div>
          </header>
          <main className="pt-16">
            {children}
          </main>
          <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p><TranslatedTextWithVars textKey="footer.copyright" vars={{ year: new Date().getFullYear() }} fallback={`© ${new Date().getFullYear()} emoji-master - 成语表情挑战`} /></p>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}

// 适用于服务器组件的翻译占位符组件
function TranslatedText({ textKey, fallback }) {
  return (
    <span data-i18n-key={textKey} data-i18n-default={fallback}>
      {fallback}
    </span>
  );
}

// 支持变量替换的翻译组件
function TranslatedTextWithVars({ textKey, vars, fallback }) {
  return (
    <span 
      data-i18n-key={textKey}
      data-i18n-default={fallback}
      data-i18n-vars={JSON.stringify(vars)}
    >
      {fallback}
    </span>
  );
}
