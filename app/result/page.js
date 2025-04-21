"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import ProgressCircle from "../components/ProgressCircle";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ThinkingEmoji } from "../components/ThinkingEmoji";
import { Confetti } from "../components/Confetti";
import { animations } from "../styles/animations";
import { useSearchParams } from "next/navigation";
// 导入拆分后的工具函数
import { getScoreLevel } from "../utils/scoreUtils";
import { generateQRCode, generateShareText, shareTextContent, generateChallengeLink, copyToClipboard } from "../utils/shareUtils";
import { generateShareImage, handleImageOutput } from "../utils/shareImageGenerator";

// Wrap the result content in Suspense
function ResultContent() {
  const [score, setScore] = useState(null);
  const [phrase, setPhrase] = useState("");
  const [emojis, setEmojis] = useState([]);
  const [suggestedEmojis, setSuggestedEmojis] = useState("");
  const [comparison, setComparison] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [thinkingDots, setThinkingDots] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [showShareTip, setShowShareTip] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelTitle, setShowLevelTitle] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [shareURL, setShareURL] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [clientIP, setClientIP] = useState("");
  const cardRef = useRef(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchParams = useSearchParams();

  // 获取客户端IP
  useEffect(() => {
    async function fetchClientIP() {
      try {
        const res = await fetch('/api/ip');
        const data = await res.json();
        setClientIP(data.ip);
      } catch (error) {
        console.error('获取IP失败:', error);
        setClientIP('fetch-failed');
      }
    }

    fetchClientIP();
  }, []);

  // 主效应 - 加载数据和评分
  useEffect(() => {
    // 思考动画计时器
    let thinkingInterval;
    if (isLoading) {
      thinkingInterval = setInterval(() => {
        setThinkingDots(prev => (prev >= 5 ? 1 : prev + 1));
      }, 500);
    }

    // 在 useEffect 中访问 localStorage
    const storedPhrase = localStorage.getItem("phrase");
    const storedEmojis = JSON.parse(localStorage.getItem("emojis") || "[]");
    const availableEmojis = JSON.parse(localStorage.getItem("availableEmojis") || "[]");

    setPhrase(storedPhrase);
    setEmojis(storedEmojis);

    // 如果clientIP为空，等待下次触发（当clientIP设置后）
    if (!clientIP) {
      return () => {
        if (thinkingInterval) clearInterval(thinkingInterval);
      };
    }

    async function fetchScore() {
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phrase: storedPhrase,
            emojis: storedEmojis,
            availableEmojis
          }),
        });

        const data = await res.json();
        setScore(data.score);
        setSuggestedEmojis(data.suggestedEmojis);
        setComparison(data.comparison);
        setReason(data.aiAnswerReason);

        console.log("AI评分和评语:", {
          score: data.score,
          suggestion: data.suggestedEmojis,
          feedback: data.comparison?.substring(0, 50) + (data.comparison?.length > 50 ? '...' : '')
        });

        // Save the results to the database
        try {
          // 确保评语不为空
          const modelFeedback = data.comparison || `AI认为你的表达很有创意！继续加油！`;

          const saveRes = await fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phrase: storedPhrase,
              player_emojis: storedEmojis,
              model_score: data.score,
              model_suggestion: data.suggestedEmojis,
              model_feedback: modelFeedback,
              ai_answer_reason: data.aiAnswerReason,
              player_ip: clientIP,
              created_at: new Date().toISOString(),
            })
          });

          if (!saveRes.ok) {
            throw new Error(`HTTP error! status: ${saveRes.status}`);
          }

          await saveRes.json();
        } catch (error) {
          console.error("Error saving results:", error);
          // Continue showing results even if saving fails
        }

        // 结果动画延迟
        setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => {
            setShowResults(true);
            // 让分数和称号同时显示
            setShowLevelTitle(true);
            // 显示五彩纸屑效果
            setTimeout(() => {
              setShowConfetti(true);
              // 显示分享提示并立即开始滚动尝试
              setTimeout(() => {
                setShowShareTip(true);

                // 使用更强大的滚动函数，支持手机和桌面
                const scrollToContent = () => {
                  // 首先尝试使用引用进行滚动
                  if (cardRef.current) {
                    const isMobile = window.innerWidth < 768;
                    const options = {
                      behavior: 'smooth',
                      // 在手机上滚动到顶部，在桌面上居中显示
                      block: isMobile ? 'start' : 'center'
                    };
                    try {
                      // 尝试平滑滚动
                      cardRef.current.scrollIntoView(options);
                    } catch (e) {
                      // 兼容性回退：如果平滑滚动失败，使用即时滚动
                      console.warn('平滑滚动失败，使用即时滚动', e);
                      cardRef.current.scrollIntoView(false);
                    }
                  } else {
                    // 备用方案：计算滚动位置
                    const isMobile = window.innerWidth < 768;
                    const scrollTarget = isMobile
                      ? document.body.scrollHeight
                      : document.body.scrollHeight * 0.85;

                    try {
                      window.scrollTo({
                        top: scrollTarget,
                        behavior: 'smooth'
                      });
                    } catch (e) {
                      // 兼容性回退：如果平滑滚动失败
                      console.warn('平滑滚动失败，使用即时滚动', e);
                      window.scrollTo(0, scrollTarget);
                    }
                  }
                };

                // 执行滚动函数 - 立即尝试第一次
                scrollToContent();

                // 多次尝试滚动，确保在各种设备上都能正确滚动
                const scrollAttempts = [300, 600, 1000, 2000];
                scrollAttempts.forEach(delay => {
                  setTimeout(scrollToContent, delay);
                });
              }, 800);
            }, 500);
          }, 500);
        }, 1000);
      } catch (error) {
        console.error("Error fetching score:", error);
        setIsLoading(false);
      }
    }

    fetchScore();

    // 清理计时器
    return () => {
      if (thinkingInterval) clearInterval(thinkingInterval);
    };
  }, [clientIP]);

  // 分享功能
  const handleShare = async () => {
    try {
      setIsGeneratingImage(true);

      if (!qrCodeUrl) {
        const qrCodeBlobUrl = await generateQRCode(window.location.href);
        setQrCodeUrl(qrCodeBlobUrl);
      }

      // 提取AI评语用于分享图片 - 简化处理逻辑
      let aiComment = '';
      if (comparison) {
        // 直接截取前70个字符作为评语，避免过长
        aiComment = comparison.substring(0, 70);

        // 如果截取处正好是句子中间，尝试找到上一个句号位置结束
        const lastPunctIndex = aiComment.lastIndexOf('。');
        if (lastPunctIndex > 30) { // 确保有足够内容
          aiComment = aiComment.substring(0, lastPunctIndex + 1);
        } else if (aiComment.length === 70) {
          // 如果截取了70个字符且没找到合适的句号，添加省略号
          aiComment += '...';
        }
      }

      const shareBlob = await generateShareImage({
        phrase: phrase,
        score: parseInt(score),
        emojis: emojis,
        suggestedEmojis: suggestedEmojis,
        qrCodeUrl: qrCodeUrl,
        getScoreLevel: getScoreLevel,
        aiComment: aiComment  // 添加AI评语参数
      });

      // 处理图片输出（下载或分享）
      await handleImageOutput(shareBlob, {
        phrase: phrase,
        score: parseInt(score),
        isMobile: false
      });

      // 重置生成状态
      setIsGeneratingImage(false);
    } catch (error) {
      console.error('生成分享图片时出错:', error);
      // 确保错误时也重置生成状态
      setIsGeneratingImage(false);
      // 可选：显示错误消息
      alert('生成分享图片失败，请重试');
    }
  };

  // 复制挑战链接
  const copyShareURL = async () => {
    // 使用工具函数生成挑战链接
    const url = generateChallengeLink({ phrase, score });
    setShareURL(url);

    // 生成二维码
    if (!qrCodeUrl) {
      try {
        const qrDataUrl = await generateQRCode(url);
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error("生成二维码失败:", error);
      }
    }

    // 复制到剪贴板
    copyToClipboard(url);
  };

  // 预加载共享卡片 - 在组件挂载后预先准备分享图片所需资源
  useEffect(() => {
    if (score !== null && phrase) {
      // 预生成二维码
      if (!qrCodeUrl) {
        const url = generateChallengeLink({ phrase, score });
        generateQRCode(url).then(dataUrl => {
          setQrCodeUrl(dataUrl);
        }).catch(console.error);
      }
    }
  }, [score, phrase, qrCodeUrl]);

  const scoreInfo = score !== null ? getScoreLevel(score) : { level: "", color: "" };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto px-2 sm:px-4 pt-1 pb-4 sm:py-4 max-w-4xl">
      {showConfetti && <Confetti />}

      {/* {showShareTip && (
        <div className="fixed bottom-16 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-lg shadow-lg animate-float z-50 max-w-xs">
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
            onClick={() => setShowShareTip(false)}>
            ×
          </div>
          <p className="font-bold mb-1 text-sm">🎉 恭喜获得称号！</p>
          <p className="text-xs">生成分享图片，让朋友扫码来挑战你的成绩！</p>
          <div className="mt-1 flex justify-end">
            <button
              onClick={handleShare}
              className="px-2 py-1 bg-white text-purple-600 rounded-full text-xs font-bold hover:bg-yellow-100 transition-colors">
              分享图片
            </button>
          </div>
        </div>
      )} */}

      <div className="mb-2 sm:mb-6">
        {/* 名字显示 - 更紧凑的移动设计 */}
        <div className="card p-3 sm:p-6 mb-3 sm:mb-6 fade-in-once border-t-4 border-primary shadow-md">
          <h2 className="text-base sm:text-xl font-medium mb-2 sm:mb-4 flex items-center gap-1">
            <span className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary">📝</span>
            名字：
          </h2>
          <div className="text-xl sm:text-4xl font-bold p-2 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg text-center">
            {phrase}
          </div>
        </div>

        {/* 表达区域 - 更高效的空间利用 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-3 sm:mb-6">
          <div className="card p-3 sm:p-6 fade-in border-t-4 border-rose-500 shadow-md h-auto sm:h-[200px]">
            <h2 className="text-base sm:text-xl font-medium mb-2 sm:mb-4 flex items-center gap-1">
              <span className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center bg-rose-500/10 rounded-full text-rose-500">😊</span>
              你的表达：
            </h2>
            <div className="text-xl sm:text-4xl mb-1 sm:mb-4 flex flex-wrap justify-center gap-1 p-2 sm:p-4 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-900/10 dark:to-amber-900/10 rounded-lg min-h-[50px] sm:h-[96px] overflow-auto">
              {emojis.map((emoji, index) => (
                <span
                  key={index}
                  className={`inline-block ${showResults ? 'animate-fadeInUp' : ''}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>

          {isLoading ? (
            <ThinkingEmoji thinkingDots={thinkingDots} />
          ) : suggestedEmojis && (
            <div
              className="card p-3 sm:p-6 fade-in border-t-4 border-blue-500 shadow-md h-auto sm:h-[200px] relative"
              onMouseEnter={() => setShowReason(true)}
              onMouseLeave={() => setShowReason(false)}
            >
              <h2 className="text-base sm:text-xl font-medium mb-2 sm:mb-4 flex items-center gap-1">
                <span className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-500">🤖</span>
                AI的答案（点击查看原因）：
              </h2>
              <div className="text-xl sm:text-4xl mb-1 sm:mb-4 flex flex-wrap justify-center gap-1 p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg min-h-[50px] sm:h-[96px] overflow-auto">
                {suggestedEmojis.split(' ').map((emoji, index) => (
                  <span
                    key={index}
                    className={`inline-block ${showResults ? 'animate-fadeInUp' : ''}`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              {showReason && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl p-6 text-white z-50 flex items-center justify-center transition-opacity duration-300 shadow-2xl">
                  <p className="text-sm md:text-base text-center animate-fadeIn leading-relaxed tracking-wide text-gray-900 dark:text-white shadow-[0_0_4px_rgba(255,255,255,0.5)]">
                    <span className="inline-block text-shadow ">
                      {reason}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 结果区域 - 自适应高度 */}
        {isLoading ? (
          <div className="py-2 flex justify-center items-center">
            <LoadingSpinner thinkingDots={thinkingDots} />
          </div>
        ) : score !== null && (
          <div className={`card p-3 sm:p-6 mb-3 sm:mb-6 min-h-0 sm:min-h-0 ${showResults ? 'fade-in' : 'opacity-0'}`}>
            <div className="flex flex-col items-center">
              {/* 分数和称号的响应式布局 */}
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-4">
                {/* 分数圆环 - 添加固定尺寸防止压缩 */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 glow-container">
                  <ProgressCircle
                    score={score}
                    strokeColor="auto"
                    strokeColorEnd="auto"
                    size="w-32 h-32 md:w-40 md:h-40"
                    textSize="text-3xl md:text-4xl"
                  />
                </div>

                {/* 称号显示 - 改进响应式设计和内容对齐 */}
                <div className={`relative w-full md:w-auto md:flex-1 max-w-full md:max-w-md px-6 py-6 bg-gradient-to-r from-indigo-100/80 via-purple-100/80 to-pink-100/80 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-lg md:rounded-xl shadow-sm flex flex-col justify-center items-center min-h-[100px] transition-all duration-500 ${showLevelTitle ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-4 scale-95'}`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
                    称号
                  </div>

                  {/* 使用flex容器包装称号内容 */}
                  <div className="flex flex-wrap justify-center items-center gap-3 w-full">
                    {scoreInfo.level && (
                      <>
                        {/* 文字部分 */}
                        <span className={`text-xl md:text-2xl font-bold text-transparent bg-clip-text inline-block ${scoreInfo.color}`}>
                          {scoreInfo.level.replace(/[\p{Emoji}\u200D]+/gu, '')}
                        </span>

                        {/* 表情部分 */}
                        <span className="text-2xl md:text-3xl inline-block animate-bounce-slow">
                          {Array.from(scoreInfo.level.matchAll(/[\p{Emoji}\u200D]+/gu)).map(match => match[0]).join('')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* AI点评 - 自适应高度 */}
              {comparison ? (
                <div
                  ref={el => { if (el) cardRef.current = el; }}
                  className="mt-2 md:mt-4 p-3 md:p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border-l-4 border-primary shadow-sm min-h-0 w-full"
                >
                  <h3 className="font-bold mb-2 text-md md:text-lg flex items-center gap-1">
                    <span className="text-lg md:text-xl">🤖</span>
                    <span>AI点评：</span>
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {comparison}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* 按钮区域 - 更易于触摸的设计 */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <Link href="/game">
            <button className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-lg text-sm md:text-base font-medium transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
              再来一局
            </button>
          </Link>

          {!isLoading && score !== null && (
            <>
              <button
                onClick={handleShare}
                disabled={isGeneratingImage}
                className={`px-4 md:px-6 py-2 md:py-3 flex items-center gap-1 md:gap-2 text-sm md:text-base font-medium ${isGeneratingImage
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  } text-white rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1`}
              >
                {isGeneratingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 sm:w-5 h-4 sm:h-5">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                    分享图片
                  </>
                )}
              </button>

              <button
                onClick={copyShareURL}
                className="px-4 md:px-6 py-2 md:py-3 flex items-center gap-1 md:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm md:text-base font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 sm:w-5 h-4 sm:h-5">
                  <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 013.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0121 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 017.5 16.125V3.375z" />
                  <path d="M15 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0017.25 7.5h-1.875A.375.375 0 0115 7.125V5.25zM4.875 6H6v10.125A3.375 3.375 0 009.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V7.875C3 6.839 3.84 6 4.875 6z" />
                </svg>
                复制链接
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{animations}</style>
    </div>
  );
}

// Main result page component with Suspense
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl">加载中...</h2>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
