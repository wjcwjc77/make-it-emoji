"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import ProgressCircle from "../components/ProgressCircle";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ThinkingEmoji } from "../components/ThinkingEmoji";
import { Confetti } from "../components/Confetti";
import { scoreRatings } from "../constants/scoreRatings";
import { animations } from "../styles/animations";

export default function ResultPage() {
  const [score, setScore] = useState(null);
  const [phrase, setPhrase] = useState("");
  const [emojis, setEmojis] = useState([]);
  const [suggestedEmojis, setSuggestedEmojis] = useState("");
  const [comparison, setComparison] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [thinkingDots, setThinkingDots] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [showShareTip, setShowShareTip] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelTitle, setShowLevelTitle] = useState(false);
  const [shareURL, setShareURL] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [clientIP, setClientIP] = useState("");
  const cardRef = useRef(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 获取客户端IP
  useEffect(() => {
    async function fetchClientIP() {
      try {
        const res = await fetch('/api/ip');
        const data = await res.json();
        setClientIP(data.ip);
        console.log('客户端IP已获取:', data.ip);
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
      console.log("等待IP加载完成...");
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
        
        console.log("AI评分和评语:", {
          score: data.score,
          suggestion: data.suggestedEmojis,
          feedback: data.comparison?.substring(0, 50) + (data.comparison?.length > 50 ? '...' : '')
        });
        
        // Save the results to the database
        try {
          // 确保评语不为空
          const modelFeedback = data.comparison || `AI认为你的表达很有创意！继续加油！`;
          
          console.log("Saving to database:", {
            phrase: storedPhrase,
            player_emojis: storedEmojis,
            model_score: data.score,
            model_suggestion: data.suggestedEmojis,
            model_feedback: modelFeedback,
            player_ip: clientIP,
            created_at: new Date().toISOString()
          });
          
          const saveRes = await fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phrase: storedPhrase,
              player_emojis: storedEmojis, 
              model_score: data.score,
              model_suggestion: data.suggestedEmojis,
              model_feedback: modelFeedback,
              player_ip: clientIP,
              created_at: new Date().toISOString(),
            })
          });
          
          // 检查响应状态
          if (!saveRes.ok) {
            throw new Error(`HTTP error! status: ${saveRes.status}, statusText: ${saveRes.statusText}`);
          }
          
          const saveData = await saveRes.json();
          console.log("Save response:", saveData);
          
          if (!saveData.success) {
            console.error("Failed to save results:", saveData.error || JSON.stringify(saveData));
          }
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
              // 短暂延迟后显示分享提示
              setTimeout(() => {
                setShowShareTip(true);
              }, 2000);
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
  }, [clientIP, isLoading]);

  // 根据分数获取评分等级和颜色
  const getScoreLevel = (score) => {
    // 寻找最接近的评分
    let closestScore = 0;
    const availableScores = Object.keys(scoreRatings).map(Number).sort((a, b) => b - a);
    
    for (const availableScore of availableScores) {
      if (score >= availableScore) {
        closestScore = availableScore;
        break;
      }
    }
    
    return scoreRatings[closestScore];
  };

  // 分享功能
  const handleShare = () => {
    const scoreInfo = getScoreLevel(score);
    const shareText = `我在emoji-master.com中表达"${phrase}"，获得了${score}分！\n成功晋级【${scoreInfo.level}】🎉\n我的表达：${emojis.join(" ")}\nAI的表达：${suggestedEmojis}\n\n有本事你也来挑战一下？👉 #emoji-master.com #成语挑战`;
    
    setShowShareTip(false);
    
    if (navigator.share) {
      navigator.share({
        title: '🎮 emoji-master.com挑战结果',
        text: shareText,
      }).catch(console.error);
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(shareText).then(() => {
        alert('已复制到剪贴板，请分享给朋友！');
      }).catch(console.error);
    }
  };

  // 复制挑战链接
  const copyShareURL = () => {
    const url = `${window.location.origin}/game?phrase=${encodeURIComponent(phrase)}&score=${score}`;
    setShareURL(url);
    
    // 生成二维码
    generateQRCode(url);
    
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("已复制挑战链接，快发给好友！");
      })
      .catch((err) => {
        console.error("复制失败:", err);
        alert("复制失败，请手动复制: " + url);
      });
  };

  // 生成二维码
  const generateQRCode = async (url) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        margin: 1,
        width: 100, // 减小尺寸
        errorCorrectionLevel: 'M', // 降低纠错级别以加快生成
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("生成二维码失败:", error);
    }
  };

  // 生成分享图片
  const handleShareImage = async () => {
    try {
      setIsGeneratingImage(true);
      
      // 先生成挑战链接及其二维码
      const url = `${window.location.origin}/game?phrase=${encodeURIComponent(phrase)}&score=${score}`;
      if (!qrCodeUrl) {
        await generateQRCode(url);
      }
      
      // 准备分享卡片
      const cardElement = cardRef.current;
      const cardParent = cardElement.parentNode;
      
      // 将卡片设置为可见但透明，保持在视图内
      cardParent.classList.remove('hidden');
      cardParent.style.position = 'fixed';
      cardParent.style.top = '50%';
      cardParent.style.left = '50%';
      cardParent.style.transform = 'translate(-50%, -50%)';
      cardParent.style.opacity = '0';
      cardParent.style.pointerEvents = 'none';
      cardParent.style.zIndex = '999';
      
      // 给卡片足够的时间完成布局和渲染
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // 使用更可靠的html2canvas配置
        const canvas = await html2canvas(cardElement, {
          backgroundColor: '#ffffff', // 明确指定白色背景
          useCORS: true,
          scale: 1.2,
          allowTaint: true,
          logging: false,
          // 不使用foreignObjectRendering，它可能导致黑屏问题
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 2000, // 给图片加载更多时间
          onclone: (document) => {
            const clonedElement = document.querySelector('[data-html2canvas-clone="true"]');
            if (clonedElement) {
              // 确保克隆元素是可见的
              clonedElement.style.opacity = '1';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.backgroundColor = '#ffffff';
              
              // 处理可能的图片加载问题
              const images = clonedElement.querySelectorAll('img');
              images.forEach(img => {
                // 为图片添加crossOrigin属性
                img.crossOrigin = 'anonymous';
                
                // 如果是二维码图片，确保它正确加载
                if (img.alt === '挑战二维码' && qrCodeUrl) {
                  img.src = qrCodeUrl;
                }
              });
            }
          }
        });
        
        // 重新隐藏卡片
        cardParent.classList.add('hidden');
        cardParent.style.position = '';
        cardParent.style.top = '';
        cardParent.style.left = '';
        cardParent.style.transform = '';
        cardParent.style.opacity = '';
        cardParent.style.pointerEvents = '';
        cardParent.style.zIndex = '';
        
        // 下载图片
        const imgData = canvas.toDataURL("image/png"); // 改回PNG以保证图片质量
        const link = document.createElement("a");
        link.download = `emoji-challenge-${phrase}.png`;
        link.href = imgData;
        link.click();
      } catch (err) {
        console.error("图片绘制错误:", err);
      } finally {
        setIsGeneratingImage(false);
      }
    } catch (error) {
      console.error("生成分享图片失败:", error);
      setIsGeneratingImage(false);
    }
  };

  // 预加载共享卡片 - 在组件挂载后预先准备分享图片所需资源
  useEffect(() => {
    if (score !== null && phrase) {
      // 预生成二维码
      if (!qrCodeUrl) {
        const url = `${window.location.origin}/game?phrase=${encodeURIComponent(phrase)}&score=${score}`;
        generateQRCode(url);
      }
      
      // 预加载html2canvas需要的资源
      import('html2canvas').then(module => {
        // 引用已加载，在后台准备好
        console.log("html2canvas预加载完成");
      });
    }
  }, [score, phrase, qrCodeUrl]);

  const scoreInfo = score !== null ? getScoreLevel(score) : { level: "", color: "" };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {showConfetti && <Confetti />}
      
      {showShareTip && (
        <div className="fixed bottom-20 right-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-lg shadow-lg animate-float z-50 max-w-xs">
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
               onClick={() => setShowShareTip(false)}>
            ×
          </div>
          <p className="font-bold mb-2">🎉 恭喜获得称号！</p>
          <p className="text-sm">生成分享图片，让朋友扫码来挑战你的成绩！</p>
          <div className="mt-2 flex justify-end">
            <button 
              onClick={handleShareImage}
              className="px-3 py-1 bg-white text-purple-600 rounded-full text-sm font-bold hover:bg-yellow-100 transition-colors">
              分享图片
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">挑战结果</h1>
        
        <div className="card p-6 mb-6 fade-in-once border-t-4 border-primary shadow-md">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary">📝</span>
            成语：
          </h2>
          <div className="text-4xl font-bold p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg text-center">
            {phrase}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 fade-in border-t-4 border-rose-500 shadow-md h-[200px]">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-rose-500/10 rounded-full text-rose-500">😊</span>
              你的表达：
            </h2>
            <div className="text-4xl mb-4 flex flex-wrap justify-center gap-2 p-4 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-900/10 dark:to-amber-900/10 rounded-lg h-[96px] overflow-hidden">
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
            <div className="card p-6 fade-in border-t-4 border-blue-500 shadow-md h-[200px]">
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-500">🤖</span>
                AI的答案：
              </h2>
              <div className="text-4xl mb-4 flex flex-wrap justify-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg h-[96px] overflow-hidden">
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
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner thinkingDots={thinkingDots} />
        ) : score !== null && (
          <div className={`card p-6 mb-8 min-h-[400px] ${showResults ? 'fade-in' : 'opacity-0'}`}>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4 glow-container">
                <ProgressCircle 
                  score={score} 
                  strokeColor="auto"
                  strokeColorEnd="auto"
                  size="w-40 h-40"
                  textSize="text-4xl"
                />
              </div>
              
              <div className={`relative w-full max-w-md py-3 px-4 bg-gradient-to-r from-indigo-100/80 via-purple-100/80 to-pink-100/80 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-xl mb-4 shadow-sm min-h-[100px] transition-all duration-500 ${showLevelTitle ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-4 scale-95'}`}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  等级称号
                </div>
                <h2 className="text-2xl font-bold mt-3 mb-1 flex flex-wrap justify-center items-center gap-1">
                  {scoreInfo.level && (
                    <>
                      <span className={`text-transparent bg-clip-text ${scoreInfo.color}`}>
                        {scoreInfo.level.replace(/[\p{Emoji}\u200D]+/gu, '')}
                      </span>
                      <span className="text-3xl animate-bounce-slow">
                        {Array.from(scoreInfo.level.matchAll(/[\p{Emoji}\u200D]+/gu)).map(match => match[0]).join('')}
                      </span>
                    </>
                  )}
                </h2>
              </div>
              
              {comparison ? (
                <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border-l-4 border-primary shadow-sm min-h-[150px] w-full">
                  <h3 className="font-bold mb-2 text-lg flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <span>AI点评：</span>
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {comparison}
                  </p>
                </div>
              ) : null}
              
              {/* 分享卡片（隐藏，仅用于生成图片） */}
              <div className="hidden" style={{ width: '320px', height: 'auto', overflow: 'hidden' }}>
                <div
                  ref={cardRef}
                  className="bg-white border p-4 rounded-lg shadow text-center"
                  style={{ 
                    color: "#333333", 
                    width: '100%', 
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff' 
                  }}
                >
                  {/* 标题 */}
                  <h3 style={{ color: "#333333", fontSize: "14px", margin: "0 0 8px 0", fontWeight: "normal" }}>你刚才挑战的是</h3>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0", color: "#000000", wordBreak: "break-all" }}>{phrase}</h2>
                  
                  {/* Emoji表达 */}
                  <div style={{ 
                    fontSize: "28px", 
                    margin: "0 0 8px 0", 
                    lineHeight: 1.2,
                    padding: "8px", 
                    background: "#f8f8f8",
                    borderRadius: "8px"
                  }}>{emojis.join(" ")}</div>
                  
                  {/* 得分 */}
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "bold", 
                    margin: "0 0 8px 0", 
                    color: "#E74C3C",
                    padding: "4px",
                    background: "#fff5f5",
                    borderRadius: "8px",
                    display: "inline-block"
                  }}>🔥 得分：{score} 分</div>
                  
                  {/* 称号 */}
                  <div style={{ 
                    fontSize: "16px", 
                    fontWeight: "bold", 
                    margin: "0 0 8px 0", 
                    padding: "8px",
                    background: "#f0e6f5",
                    borderRadius: "8px",
                    display: "inline-block"
                  }}>
                    <span style={{ fontSize: "20px", marginRight: "4px" }}>
                      {Array.from(scoreInfo.level.matchAll(/[\p{Emoji}\u200D]+/gu) || []).map(match => match[0]).join('')}
                    </span>
                    <span style={{ color: "#8E44AD" }}>
                      {scoreInfo.level?.replace(/[\p{Emoji}\u200D]+/gu, '') || ""}
                    </span>
                  </div>
                  
                  {/* 评语 */}
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#666666", 
                    margin: "8px 0", 
                    maxHeight: "60px", 
                    overflow: "hidden",
                    textAlign: "left",
                    padding: "8px",
                    background: "#f9f9f9",
                    borderRadius: "8px"
                  }}>
                    {comparison?.substring(0, 80)}{comparison?.length > 80 ? "..." : ""}
                  </div>
                  
                  {/* 二维码 */}
                  {qrCodeUrl && (
                    <div style={{ margin: "16px 0 8px 0", background: "#ffffff", padding: "8px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", color: "#666666", margin: "0 0 8px 0" }}>扫码来挑战我！</div>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <img 
                          src={qrCodeUrl} 
                          alt="挑战二维码" 
                          width={100} 
                          height={100} 
                          style={{ 
                            display: "block", 
                            margin: "0 auto",
                            backgroundColor: "#ffffff",
                            padding: "4px",
                            border: "1px solid #eaeaea"
                          }} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 底部 */}
                  <div style={{ 
                    marginTop: "16px", 
                    fontSize: "12px", 
                    color: "#666666", 
                    borderTop: "1px solid #eee", 
                    paddingTop: "8px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    background: "#ffffff"
                  }}>
                    <img 
                      src="/favicon.ico" 
                      alt="emoji-master.com" 
                      width={16} 
                      height={16} 
                      style={{ marginRight: "4px" }} 
                    />
                    <span>emoji-master.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/game">
            <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
              再来一局
            </button>
          </Link>
          
          {!isLoading && score !== null && (
            <>
              <button
                onClick={handleShareImage}
                disabled={isGeneratingImage}
                className={`px-6 py-3 flex items-center gap-2 ${
                  isGeneratingImage 
                    ? "bg-gray-400" 
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                } text-white rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1`}
              >
                {isGeneratingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                    生成分享图片
                  </>
                )}
              </button>
              
              <button
                onClick={copyShareURL}
                className="px-6 py-3 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 013.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0121 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 017.5 16.125V3.375z" />
                  <path d="M15 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0017.25 7.5h-1.875A.375.375 0 0115 7.125V5.25zM4.875 6H6v10.125A3.375 3.375 0 009.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V7.875C3 6.839 3.84 6 4.875 6z" />
                </svg>
                复制挑战链接
              </button>
            </>
          )}
        </div>
      </div>
      
      <style jsx>{animations}</style>
    </div>
  );
}
