"use client";
import emojiData from "../../data/chengyu_emoji.json";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Confetti } from "../components/Confetti";

// 通用emoji池，用于随机添加额外选项
const COMMON_EMOJIS = [
  "😀", "😂", "🤣", "😊", "🥰", "😎", "🤔", "🤯", "😱", "😴", 
  "👍", "👎", "👋", "✌️", "🤞", "👀", "👑", "💰", "💯", "💪",
  "❤️", "🔥", "💧", "⭐", "🌈", "🍀", "🎮", "🎯", "🎪", "🎭",
  "🚀", "⚡", "💡", "🔑", "🎁", "🏆", "🎵", "🎬", "📱", "⏰"
];

// 去除数组中的重复元素
function removeDuplicates(array) {
  return [...new Set(array)];
}

// 从通用emoji池中随机选择n个，确保不与现有emoji重复
function getRandomEmojis(existingEmojis, count = 5) {
  // 创建一个不包含现有emoji的候选池
  const candidatePool = COMMON_EMOJIS.filter(emoji => !existingEmojis.includes(emoji));
  
  // 如果候选池太小，直接返回全部候选
  if (candidatePool.length <= count) {
    return candidatePool;
  }
  
  // 随机选择count个emoji
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

// 游戏内容组件，使用 useSearchParams
function GameContent() {
  const [phrase, setPhrase] = useState("");
  const [emojis, setEmojis] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [friendScore, setFriendScore] = useState(null);
  const [columnCount, setColumnCount] = useState(4); // 默认为移动设备的4列
  
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
    
    // 初始化时运行一次
    handleResize();
    
    // 添加窗口调整大小事件监听器
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadGame = () => {
      // 检查是否有朋友的挑战链接参数
      const sharedPhrase = searchParams.get("phrase");
      const score = searchParams.get("score");
      
      let selectedPhrase;
      if (sharedPhrase && emojiData[sharedPhrase]) {
        selectedPhrase = sharedPhrase;
        if (score) {
          setFriendScore(score);
        }
      } else {
        // 随机选择成语
        const phrases = Object.keys(emojiData);
        selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      }
      
      setPhrase(selectedPhrase);
      
      // 去重处理emoji池
      const uniqueEmojis = removeDuplicates(emojiData[selectedPhrase]);
      
      // 添加3-5个随机emoji增加随机性
      const randomCount = Math.floor(Math.random() * 3) + 3; // 随机3-5个
      const randomEmojis = getRandomEmojis(uniqueEmojis, randomCount);
      
      // 合并并再次去重
      const finalEmojis = removeDuplicates([...uniqueEmojis, ...randomEmojis]);
      
      // 随机排序最终的emoji列表，增加每次游戏的新鲜感
      const shuffledEmojis = [...finalEmojis].sort(() => Math.random() - 0.5);
      
      // 调整emoji列表长度为网格列数的倍数，保证布局整齐
      const adjustedEmojis = adjustEmojiCount(shuffledEmojis, columnCount);
      
      setEmojis(adjustedEmojis);
      
      // 保存原始的uniqueEmojis用于传递给评分API
      localStorage.setItem("originalEmojiPool", JSON.stringify(uniqueEmojis));
      
      setIsLoading(false);
    };
    
    // 添加短暂延迟以显示加载效果
    setTimeout(loadGame, 800);
  }, [searchParams, columnCount]);

  // 调整emoji数量为网格列数的倍数，确保布局整齐
  const adjustEmojiCount = (emojis, cols) => {
    // 计算需要的emoji数量，向上取整为列数的倍数
    const currentLength = emojis.length;
    const targetLength = Math.ceil(currentLength / cols) * cols;
    
    // 如果当前数量已经是列数的倍数，直接返回
    if (currentLength % cols === 0) {
      return emojis;
    }
    
    // 填充额外的emoji到目标长度
    const extraNeeded = targetLength - currentLength;
    
    // 获取一些额外的emoji来填充
    const extraEmojis = getRandomEmojis(emojis, extraNeeded);
    
    // 如果获取的额外emoji不足，使用一些通用emoji作为备选
    if (extraEmojis.length < extraNeeded) {
      const backupEmojis = COMMON_EMOJIS.slice(0, extraNeeded - extraEmojis.length);
      return [...emojis, ...extraEmojis, ...backupEmojis];
    }
    
    return [...emojis, ...extraEmojis];
  };

  const handleSelect = (emoji) => {
    if (selected.length < 5) {
      setSelected([...selected, emoji]);
      
      // Show confetti effect
      setShowConfetti(false); // Reset first to ensure animation triggers
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

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl">成语加载中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl fade-in">
      {showConfetti && <Confetti />}
      
      {friendScore && (
        <div className="mb-6 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-r-lg text-sm fade-in-once">
          <p className="font-medium">挑战模式！</p>
          <p>你的朋友挑战「{phrase}」获得了 {friendScore} 分，看看你能不能超越TA！</p>
        </div>
      )}
      
      <div className="card p-8 mb-8">
        <h2 className="text-3xl font-bold text-center mb-2">
          用Emoji表达：
        </h2>
        <div className="text-4xl font-bold text-center p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          {phrase}
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          从下方选择最多 5 个Emoji来表达这个成语
        </p>
      </div>

      <div className="card p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">选择表情：</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {emojis.map((emoji, idx) => (
            <button 
              key={idx} 
              className="text-4xl p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110 hover:shadow-md"
              onClick={() => handleSelect(emoji)}
              disabled={selected.length >= 5}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">你的选择：</h3>
        <div className="min-h-24 flex items-center justify-center">
          {selected.length > 0 ? (
            <div className="flex gap-4 text-5xl">
              {selected.map((emoji, idx) => (
                <div key={idx} className="selected-emoji transition-all">{emoji}</div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500">请从上方选择Emoji</p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUndo}
            disabled={selected.length === 0}
          >
            撤销一个
          </button>

          <button 
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClear}
            disabled={selected.length === 0}
          >
            清空选择
          </button>
        </div>
      </div>

      <div className="text-center">
        <button 
          className="px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={selected.length === 0}
        >
          提交答案
        </button>
      </div>

      <style jsx>{`
        @keyframes scaleUp {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .scale-up {
          animation: scaleUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// 主游戏页面组件，使用 Suspense 包裹游戏内容
export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl">游戏加载中...</h2>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
