"use client";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const [score, setScore] = useState(null);
  const [phrase, setPhrase] = useState("");
  const [emojis, setEmojis] = useState([]);
  const [suggestedEmojis, setSuggestedEmojis] = useState("");
  const [comparison, setComparison] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [thinkingDots, setThinkingDots] = useState(1);

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
      } catch (error) {
        console.error("Error fetching score:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScore();

    // 清理计时器
    return () => {
      if (thinkingInterval) clearInterval(thinkingInterval);
    };
  }, []);

  // 加载动画组件
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <div className="text-lg text-gray-600">AI正在思考中...</div>
      <div className="flex items-center justify-center space-x-1 mt-2">
        <span className="text-sm text-gray-400">请稍候</span>
        <span className="text-sm text-gray-400">
          {'.'.repeat(thinkingDots)}
        </span>
      </div>
    </div>
  );

  // 思考表情动画组件
  const ThinkingEmoji = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl mb-4">AI的答案：</h2>
      <div className="text-4xl mb-4 flex items-center justify-center">
        {'🤔'.repeat(thinkingDots)}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl w-full px-4">
        <h2 className="text-2xl mb-4">你表达的成语：</h2>
        <div className="text-4xl mb-8 bg-white p-4 rounded-lg shadow">{phrase}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl mb-4">你的Emoji组合：</h2>
            <div className="text-4xl mb-4">{emojis.join(" ")}</div>
          </div>

          {isLoading ? (
            <ThinkingEmoji />
          ) : suggestedEmojis && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl mb-4">AI的答案：</h2>
              <div className="text-4xl mb-4">{suggestedEmojis}</div>
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : score !== null && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="text-2xl font-bold mb-4">
              🎯 匹配度：{score}分
            </div>
            {comparison && (
              <div className="text-lg text-gray-700 mt-4">
                <h3 className="font-bold mb-2">AI点评：</h3>
                <p>{comparison}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <a href="/game">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              再来一局
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
