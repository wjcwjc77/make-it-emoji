"use client";
// import emojiData from "../../data/chengyu_emoji.json";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Confetti } from "../components/Confetti";
import chengyuData from '../../data/enhanced_chengyu.json';
import EmojiPicker from 'emoji-picker-react';

function App() {
  return (
    <div>
      <EmojiPicker />
    </div>
  );
}
// 通用emoji池，用于随机添加额外选项
const COMMON_EMOJIS = [
  "😀", "😂", "🤣", "😊", "🥰", "😎", "🤔", "🤯", "😱", "😴",
  "👍", "👎", "👋", "✌️", "🤞", "👀", "👑", "💰", "💯", "💪",
  "❤️", "🔥", "💧", "⭐", "🌈", "🍀", "🎮", "🎯", "🎪", "🎭",
  "🚀", "⚡", "💡", "🔑", "🎁", "🏆", "🎵", "🎬", "📱", "⏰",
  "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", , "🍒", "🥥",
  "🌍", "🌎", "🌏", "🏔️", "🌋", "🏝️", "🏖️", "🌃", "🌄", "🌅",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧",
  "🚗", "✈️", "🚢", "🚀", "🚁", "🚂", "🚒", "🚑", "🚕", "🛵",
  "🎨", "🎭", "🎪", "🎤", "🎧", "🎸", "🎹", "🎬", "🎮", "🎯",
  "🧩", "🎲", "🎷", "🎺", "🎻", "🥁", "🎖️", "🏅", "🥇"
];

// 从数组中移除重复元素
function removeDuplicates(array) {
  return [...new Set(array)];
}

// 从通用emoji池中随机选择n个，确保不与现有emoji重复
function getRandomEmojis(existingEmojis, count = 5) {
  const candidatePool = COMMON_EMOJIS.filter(emoji => !existingEmojis.includes(emoji));
  
  if (candidatePool.length <= count) {
    return candidatePool;
  }

  const randomEmojis = [];
  const poolCopy = [...candidatePool];

  for (let i = 0; i < count; i++) {
    if (poolCopy.length === 0) break;
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    randomEmojis.push(poolCopy[randomIndex]);
    poolCopy.splice(randomIndex, 1);
  }

  return randomEmojis;
}

// 调整emoji数量为网格列数的倍数，确保布局整齐
function adjustEmojiCount(emojis, cols) {
  const currentLength = emojis.length;
  const targetLength = Math.ceil(currentLength / cols) * cols;

  if (currentLength % cols === 0) {
    return emojis;
  }

  const extraNeeded = targetLength - currentLength;
  const extraEmojis = getRandomEmojis(emojis, extraNeeded);

  if (extraEmojis.length < extraNeeded) {
    const backupEmojis = COMMON_EMOJIS.slice(0, extraNeeded - extraEmojis.length);
    return [...emojis, ...extraEmojis, ...backupEmojis];
  }

  return [...emojis, ...extraEmojis];
}

// 从emojiData加载该名字的特定emoji候选，如果不存在则从通用池中添加
function loadEmojisForPhrase(phrase) {
  // 修改为使用enhanced_chengyu.json中的candidates
  if (chengyuData[phrase] && chengyuData[phrase].candidates) {
    const uniqueEmojis = removeDuplicates(chengyuData[phrase].candidates);
    
    // 获取名字的表达需要的最佳emoji数量 (3-5个)
    const idealCount = Math.min(5, uniqueEmojis.length);
    const primaryEmojis = uniqueEmojis.slice(0, idealCount);
    
    // 添加额外的emoji以增加选择难度和趣味性
    // 添加数量取决于预设emoji的数量，确保总数至少有12个
    const extraNeeded = Math.max(12 - primaryEmojis.length, 3);
    const randomEmojis = getRandomEmojis(primaryEmojis, extraNeeded);
    
    // 合并并去重
    const combinedEmojis = removeDuplicates([...primaryEmojis, ...randomEmojis]);
    
    // 随机排序
    return [...combinedEmojis].sort(() => Math.random() - 0.5);
  } else {
    // 如果没有该名字的预设emoji，使用通用pool
    console.log(`No preset emojis for phrase: ${phrase}, using common pool`);
    const randomCount = Math.floor(Math.random() * 3) + 10; // 随机10-12个
    return getRandomEmojis([], randomCount);
  }
}

// 加载动画组件
function LoadingAnimation() {
  return (
    <div className="container mx-auto px-2 sm:px-4 pt-1 pb-4 sm:py-4 max-w-4xl flex items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-gray-900/40 dark:via-gray-800/40 dark:to-gray-700/40 relative overflow-hidden">
      {/* 水墨背景纹理 */}
      <div className="absolute inset-0 opacity-10 dark:opacity-15" 
           style={{
             backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5-5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5-5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5-5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5-5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23065f46\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
             backgroundSize: '160px 160px'
           }}></div>

      <div className="text-center fade-in relative z-10 p-6 bg-white/30 dark:bg-gray-800/30 rounded-2xl backdrop-blur-sm shadow-xl">
        {/* 水墨风格加载动画 */}
        <div className="mb-6 relative">
          <div className="ink-drop-container">
            <div className="ink-drop"></div>
            <div className="ink-drop ink-delay-1"></div>
            <div className="ink-drop ink-delay-2"></div>
          </div>
        </div>
        <h2 className="text-xl text-gray-800 dark:text-gray-200 tracking-wider leading-relaxed">游戏加载中<span className="loading-dots">...</span></h2>
      </div>

      {/* 添加水墨动画样式 */}
      <style jsx>{`
        @keyframes dotsAnimation {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        
        .loading-dots::after {
          content: '';
          animation: dotsAnimation 1.5s infinite;
        }
      
        .ink-drop-container {
          width: 80px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
          position: relative;
        }
        
        .ink-drop {
          width: 16px;
          height: 16px;
          background-color: #047857;
          border-radius: 50%;
          margin: 0 6px;
          transform-origin: center bottom;
          animation: ink-drop 1.5s infinite ease-in-out;
        }
        
        .ink-delay-1 {
          animation-delay: 0.3s;
        }
        
        .ink-delay-2 {
          animation-delay: 0.6s;
        }
        
        @keyframes ink-drop {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          40% {
            transform: scale(1.6) translateY(10px);
            border-radius: 40% 40% 60% 60%;
            opacity: 0.5;
          }
          60% {
            transform: scale(0.8) translateY(-10px);
            border-radius: 60% 60% 40% 40%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// 游戏内容组件
function GameContent() {
  const [phrase, setPhrase] = useState("");
  const [userName, setUserName] = useState("");
  const [emojis, setEmojis] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [friendScore, setFriendScore] = useState(null);
  const [columnCount, setColumnCount] = useState(4); // 默认为移动设备的4列
  const [showChallengeTooltip, setShowChallengeTooltip] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const isInitialLoad = useRef(true); // Add ref to track initial load

  const searchParams = useSearchParams();
  const router = useRouter();

  // 检测窗口大小变化并更新列数
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setColumnCount(8); // md屏幕
      } else if (window.innerWidth >= 640) {
        setColumnCount(6); // sm屏幕
      } else {
        setColumnCount(4); // 小屏幕
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Only run the load logic on the initial mount or when dependencies truly necessitate a reload
    // The ref prevents multiple calls during the initial render phase
    if (isInitialLoad.current) {
      const loadGame = () => {
        console.log("Running loadGame..."); // Add log to track calls
        // 检查是否有朋友的挑战链接参数
        const name = searchParams.get("name");
        console.log("name:", name);
        if (name) {
          setUserName(name);
        }
        const sharedPhrase = searchParams.get("phrase");
        const score = searchParams.get("score");

        let selectedPhrase;
        if (sharedPhrase && chengyuData[sharedPhrase]) {
          console.log("Friend's challenge link detected.");
          selectedPhrase = sharedPhrase;
          if (score) {
            setFriendScore(score);
          }
        } else {
          // 随机选择名字
          const phrases = Object.keys(chengyuData);
          selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        }

        console.log("selectedPhrase:", selectedPhrase);

        setPhrase(name || selectedPhrase);

        // 加载并准备emoji池
        const phraseEmojis = loadEmojisForPhrase(selectedPhrase);
        
        // 调整emoji列表长度为网格列数的倍数，保证布局整齐
        // Pass columnCount directly here if needed, or ensure it's stable before this runs
        const adjustedEmojis = adjustEmojiCount(phraseEmojis, columnCount);

        setEmojis(adjustedEmojis);

        // 保存原始的uniqueEmojis用于传递给评分API
        // 使用已加载的emoji池作为availableEmojis，确保所有展示的emoji都可选
        localStorage.setItem("originalEmojiPool", JSON.stringify(adjustedEmojis));

        setIsLoading(false);
        isInitialLoad.current = false; // Mark initial load as complete
      };

      // 添加短暂延迟以显示加载效果
      const timerId = setTimeout(loadGame, 800);
      
      // Cleanup function to clear timeout if dependencies change before it fires
      return () => clearTimeout(timerId);
    } else {
      // Handle subsequent updates if necessary, e.g., if columnCount changes significantly
      // For now, we only focus on preventing multiple initial loads.
      // You might need to re-adjust emojis if columnCount changes after initial load:
      console.log("Dependency changed after initial load (columnCount or searchParams), re-adjusting emojis...");
      const adjustedEmojis = adjustEmojiCount(emojis, columnCount); // Adjust existing emojis
      if (adjustedEmojis.length !== emojis.length) { // Only update if length changes
          setEmojis(adjustedEmojis);
          localStorage.setItem("originalEmojiPool", JSON.stringify(adjustedEmojis));
      }
    }
  }, [searchParams, columnCount, emojis]); // Add emojis to dependency array if re-adjustment is needed

  const handleSelect = (emoji) => {
    console.log("handleSelect called with emoji:", emoji);
    if (selected.length < 5) {
      setSelected([...selected, emoji]);

      // 触发五彩纸屑效果
      setShowConfetti(false); 
      setTimeout(() => setShowConfetti(true), 0);
      setTimeout(() => setShowConfetti(false), 5000);

      // 添加选择反馈动画
      const emojiElements = document.querySelectorAll('.selected-emoji');
      const lastElement = emojiElements[emojiElements.length - 1];
      if (lastElement) {
        lastElement.classList.add('scale-up');
        setTimeout(() => {
          lastElement.classList.remove('scale-up');
        }, 300);
      }
    }
  };

  // 撤销最后一个Emoji
  const handleUndo = () => {
    setSelected(selected.slice(0, -1));
  };

  // 清空所有Emoji选择
  const handleClear = () => {
    setSelected([]);
  };

  const handleSubmit = () => {
    localStorage.setItem("phrase", phrase);
    localStorage.setItem("emojis", JSON.stringify(selected));

    // 使用原始的emoji池加上选择的随机emoji
    const originalPool = JSON.parse(localStorage.getItem("originalEmojiPool") || "[]");
    const availableEmojis = removeDuplicates([...originalPool, ...selected]);
    localStorage.setItem("availableEmojis", JSON.stringify(availableEmojis));

    router.push("/result");
  };

  // 处理挑战卡片点击
  const handleChallengeCardClick = () => {
    setShowChallengeTooltip(true);
    // 3秒后自动隐藏提示
    setTimeout(() => setShowChallengeTooltip(false), 3000);
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="container mx-auto px-4 md:px-8 pt-4 pb-6 md:py-8 max-w-4xl bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-gray-900/40 dark:via-gray-800/40 dark:to-gray-700/40 rounded-lg shadow-xl">
      {showConfetti && <Confetti />}
      
      {friendScore && (
        <div 
          className="mb-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-gray-900/40 dark:via-gray-800/40 dark:to-gray-700/40 border border-green-100 dark:border-green-800/30 rounded-xl overflow-hidden shadow-lg relative fade-in-once cursor-pointer hover:shadow-xl transition-all"
          onClick={handleChallengeCardClick}
        >
          {/* 装饰性元素 - 左侧山水画风格条纹 */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-green-500 via-teal-500 to-blue-500"></div>
          {/* 微妙的背景图案 - 模拟山水画笔触 */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10" 
               style={{
                 backgroundImage: 'radial-gradient(circle, #134e4a 1px, transparent 1px), radial-gradient(circle, #0891b2 0.5px, transparent 0.5px)',
                 backgroundSize: '20px 20px, 10px 10px',
                 backgroundPosition: '0 0, 10px 10px'
               }}></div>
          
          <div className="p-6 relative z-10">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-full text-white mr-4 animate-float shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 score-shine tracking-wide">挑战模式</h3>
            </div>
            <p className="text-base md:text-lg pl-16 text-gray-700 dark:text-gray-300 leading-relaxed">
              你的朋友挑战「<span className="font-semibold tracking-wide">{phrase}</span>」获得了 
              <span className="font-bold text-xl mx-1.5 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-green-500 score-shine">{friendScore}</span> 
              分，来超越这个分数吧！
            </p>
            
            {/* 点击后显示的提示信息 */}
            {showChallengeTooltip && (
              <div className="mt-4 pl-16 py-3 px-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-sm md:text-base text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/50 fade-in-once shadow-sm">
                🎯 只需选择5个表情，创意表达「{phrase}」，就能挑战你朋友的分数！
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="card p-8 md:p-10 mb-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-green-100 dark:border-green-800/30 relative">
        {/* 山水画风格的背景纹理 */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23065f46\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
               backgroundSize: '160px 160px'
             }}></div>

        <h2 className="text-4xl font-semibold text-center mb-6 text-green-600 dark:text-green-400 tracking-widest relative z-10">
          用Emoji表达：
        </h2>
        <div className="text-5xl font-bold text-center p-6 md:p-8 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white rounded-xl shadow-xl transform transition-all hover:scale-105 duration-500 relative z-10">
          <span className="block tracking-wide">{phrase}</span>
          {/* <button 
            className="mt-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg text-sm font-medium flex items-center mx-auto gap-1.5 transition-all"
            onClick={() => setShowExplanation(!showExplanation)}
            aria-label="显示或隐藏名字解释"
          >
            <span className="text-xs">查看解释</span>
            <span className="text-lg">{showExplanation ? '👁️' : '❓'}</span>
          </button> */}
        </div>
        
        <div className={`bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-4 mb-4 border border-green-100 dark:border-green-800/30 text-center relative z-10 text-gray-700 dark:text-gray-300 leading-relaxed transition-all overflow-hidden ${showExplanation ? 'max-h-32 opacity-100 fade-in' : 'max-h-0 opacity-0 fade-out p-0 border-0 mb-0 mt-0 hidden'}`}>
          <p className="font-medium text-base md:text-lg">
            {chengyuData[phrase]?.explanation || `「${phrase}」是一个中国名字，请尝试用表情符号来表达它的含义。`}
          </p>
        </div>
      
      </div>

      <div className="card p-6 md:p-8 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-green-100 dark:border-green-800/30 relative">
        {/* 山水画风格的背景纹理 - 更细微的版本 */}
        <div className="absolute inset-0 opacity-3 dark:opacity-8" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M9 0h2v20H9V0zm25.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-20 20l1.732 1-10 17.32-1.732-1 10-17.32zM58.16 4.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 9v2H60V9h20zM20 69v2H0v-2h20zm79.32-55l-1 1.732-17.32-10L82 4l17.32 10zm-80 80l-1 1.732-17.32-10L2 84l17.32 10zm96.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-100 100l-1.732 1-10-17.32 1.732-1 10 17.32zM38.16 24.134l1 1.732-17.32 10-1-1.732 17.32-10zM60 29v2H40v-2h20zm19.32 5l-1 1.732-17.32-10L62 24l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM111 40h-2V20h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zM40 49v2H20v-2h20zm19.32 5l-1 1.732-17.32-10L42 44l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM91 60h-2V40h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM39.32 74l-1 1.732-17.32-10L22 64l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM71 80h-2V60h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM120 89v2h-20v-2h20zm-84.134 9.16l-1.732 1-10-17.32 1.732-1 10 17.32zM51 100h-2V80h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM100 109v2H80v-2h20zm19.32 5l-1 1.732-17.32-10 1-1.732 17.32 10zM31 120h-2v-20h2v20z\' fill=\'%23065f46\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
               backgroundSize: '180px 180px'
             }}></div>
             
        <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
          <h3 className="text-xl md:text-2xl font-semibold text-green-700 dark:text-green-300 tracking-wide">你的选择：</h3>
          <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-base font-medium text-green-700 dark:text-green-300 flex items-center gap-1.5">
            <span>已选</span>
            <span className={`${selected.length === 5 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-green-600 dark:text-green-300'}`}>
              {selected.length}
            </span>
            <span>/</span>
            <span>5</span>
          </div>
        </div>
        <div className="min-h-24 md:min-h-28 flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6 border border-green-100 dark:border-green-800/30 relative z-10">
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-3 md:gap-5 text-6xl md:text-7xl justify-center">
              {selected.map((emoji, idx) => (
                <div key={idx} className="selected-emoji transition-all">{emoji}</div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-2xl md:text-3xl leading-relaxed">
              请从下方挑选 1-5 个表情，巧妙表达这个名字含义
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-4 md:mt-6 relative z-10">
          <button 
            className="px-4 md:px-6 py-2.5 md:py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-medium shadow-md hover:shadow-lg leading-normal"
            onClick={handleUndo}
            disabled={selected.length === 0}
          >
            撤销一个
          </button>

          <button 
            className="px-4 md:px-6 py-2.5 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-medium shadow-md hover:shadow-lg leading-normal"
            onClick={handleClear}
            disabled={selected.length === 0}
          >
            清空选择
          </button>
          
          <button 
            className="px-4 md:px-6 py-2.5 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-medium shadow-md hover:shadow-lg transform hover:scale-105 duration-300 leading-normal"
            onClick={handleSubmit}
            disabled={selected.length === 0}
          >
            提交答案
          </button>
        </div>
      </div>

      <div className="card p-6 md:p-8 mb-6 md:mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-green-100 dark:border-green-800/30 relative">
        {/* 山水画风格的背景纹理 - 更细微的版本 */}
        <div className="absolute inset-0 opacity-3 dark:opacity-8" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23065f46\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
               backgroundSize: '120px 120px'
             }}></div>
         
        <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
          <h3 className="text-xl md:text-2xl font-semibold text-green-700 dark:text-green-300 tracking-wide">选择表情：</h3>
          {selected.length >= 5 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>已达最大选择数</span> 
              <span className="text-lg">⚠️</span>
            </div>
          )}
        </div>
        {/* <div className="grid grid-cols-5 md:grid-cols-8 gap-2.5 md:gap-4 relative z-10">
          {emojis.map((emoji, idx) => (
            <button 
              key={idx} 
              className={`text-3xl md:text-4xl p-2 md:p-3 rounded-xl transition-all aspect-square flex items-center justify-center
                ${selected.length >= 5 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                  : 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-110 hover:shadow-md'}`}
              onClick={() => handleSelect(emoji)}
              disabled={selected.length >= 5}
              aria-label={`选择表情 ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div> */}
        <div>
          <EmojiPicker   width="100%" searchDisabled={true}
            onEmojiClick={(emojiData, event) => {
              if (selected.length < 5) {
                console.log('Emoji selected:', emojiData.emoji);
                handleSelect(emojiData.emoji);
              }
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleUp {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .scale-up {
          animation: scaleUp 0.3s ease-out;
        }
        
        /* 山水画风格动画 */
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* 水墨晕开效果 */
        @keyframes ink-spread {
          0% {
            box-shadow: 0 0 0 0 rgba(6, 95, 70, 0.1);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(6, 95, 70, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(6, 95, 70, 0);
          }
        }
        
        .selected-emoji {
          animation: ink-spread 2s ease-out;
        }
        
        /* 淡入淡出动画 */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// 主游戏页面组件，使用 Suspense 包裹游戏内容
export default function GamePage() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <GameContent />
    </Suspense>
  );
}

