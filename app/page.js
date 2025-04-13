"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-3 md:px-6 pt-4 pb-8 md:py-12 max-w-6xl">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center mb-12">
        {/* Left column with text content */}
        <div className="card w-full p-5 md:p-8 text-center lg:text-center fade-in order-2 lg:order-1 bg-white/90 dark:bg-gray-800/80 shadow-xl backdrop-blur-md rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-center">
              emoji-master
            </h1>
            
            <p className="text-base md:text-lg mb-6 md:mb-8 text-gray-700 dark:text-gray-300 text-center">
              用Emoji表达中国成语，挑战你的创意思维！
            </p>
            
            <div className="flex flex-row gap-3 md:gap-8 justify-center w-full mb-6 md:mb-10">
              <div className="flex flex-col items-center p-2 md:p-4 hover:scale-105 transition-transform">
                <span className="text-3xl md:text-5xl mb-2">🧠</span>
                <h3 className="text-sm md:text-base font-semibold text-center">创意挑战</h3>
              </div>
              <div className="flex flex-col items-center p-2 md:p-4 hover:scale-105 transition-transform">
                <span className="text-3xl md:text-5xl mb-2">🤖</span>
                <h3 className="text-sm md:text-base font-semibold text-center">AI 点评</h3>
              </div>
              <div className="flex flex-col items-center p-2 md:p-4 hover:scale-105 transition-transform">
                <span className="text-3xl md:text-5xl mb-2">🏆</span>
                <h3 className="text-sm md:text-base font-semibold text-center">百分评分</h3>
              </div>
            </div>

            <div className="flex justify-center lg:justify-center">
              <Link href="/game" className="inline-block">
                <button className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-full font-medium text-lg md:text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>开始挑战</span>
                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right column with emoji showcase */}
        <div className="order-1 lg:order-2">
          <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 md:p-6 overflow-hidden shadow-lg border border-purple-100 dark:border-purple-900/30">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
            
            {/* Emoji grid with animation */}
            <div className="absolute inset-0 grid grid-cols-4 gap-2 md:gap-4 p-8 md:p-10">
              {[
                { emoji: "😀", delay: "0s" },
                { emoji: "🤔", delay: "0.5s" },
                { emoji: "🎭", delay: "1s" },
                { emoji: "🎯", delay: "1.5s" },
                { emoji: "🔥", delay: "0.8s" },
                { emoji: "🌈", delay: "1.3s" },
                { emoji: "🏆", delay: "0.2s" },
                { emoji: "💡", delay: "1.7s" },
                { emoji: "🚀", delay: "0.4s" },
                { emoji: "🎨", delay: "1.1s" },
                { emoji: "🎮", delay: "0.7s" },
                { emoji: "🎪", delay: "1.4s" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="text-5xl md:text-6xl animate-float transform hover:scale-110 transition-transform cursor-pointer"
                  style={{ animationDelay: item.delay }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
            
            {/* Example display */}
            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 md:p-5 rounded-xl shadow-xl transform hover:scale-102 transition-transform">
              <p className="text-sm md:text-base text-center font-medium mb-2 text-gray-700 dark:text-gray-300">「守株待兔」</p>
              <div className="flex justify-center gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl pulse-gentle" style={{ animationDelay: "0.1s" }}>🌳</span>
                <span className="text-2xl md:text-3xl pulse-gentle" style={{ animationDelay: "0.3s" }}>👀</span>
                <span className="text-2xl md:text-3xl pulse-gentle" style={{ animationDelay: "0.5s" }}>⏳</span>
                <span className="text-2xl md:text-3xl pulse-gentle" style={{ animationDelay: "0.7s" }}>🐰</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS for background pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            radial-gradient(circle, rgba(79, 70, 229, 0.2) 1px, transparent 1px), 
            radial-gradient(circle, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
          background-size: 30px 30px, 15px 15px;
          background-position: 0 0, 15px 15px;
        }
        
        @keyframes scaleAnimation {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}