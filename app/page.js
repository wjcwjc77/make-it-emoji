"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const handleStartChallenge = () => {
    setShowModal(true);
  };

  const handleSelectOption = (option) => {
    if (option === 'other') {
      setShowModal(false);
      router.push('/game');
    } else if (option === 'self') {
      setShowNameInput(true);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowModal(false);
      setShowNameInput(false);
      router.push(`/game?name=${encodeURIComponent(userName.trim())}`);
    } else {
      // Optional: Add some feedback if the name is empty
      alert('请输入你的名字！');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowNameInput(false);
    setUserName(''); // Reset name input on close
  };

  return (
    <div className="container mx-auto px-3 md:px-6 pt-4 pb-8 md:py-12 max-w-6xl relative">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center mb-12">
        {/* Left column with text content */}
        <div className="card w-full p-5 md:p-8 text-center lg:text-center fade-in order-2 lg:order-1 bg-white/90 dark:bg-gray-800/80 shadow-xl backdrop-blur-md rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-center">
             make-it-emoji
            </h1>
            
            <p className="text-base md:text-lg mb-6 md:mb-8 text-gray-700 dark:text-gray-300 text-center">
              用Emoji表达名字，挑战你的创意思维！
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
              {/* Changed Link to div and added onClick */}
              <div className="inline-block">
                <button 
                  onClick={handleStartChallenge}
                  className="px-8 md:px-10 py-3 md:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-lg md:text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>开始挑战</span>
                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              </div>
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
              <p className="text-sm md:text-base text-center font-medium mb-2 text-gray-700 dark:text-gray-300">「特朗普」</p>
              <div className="flex justify-center gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl pulse-gentle" style={{ animationDelay: "0.1s" }}>👊</span>
                <span className="text-2xl md:text-3xl pulse-gentle" style={{ animationDelay: "0.3s" }}>🇺🇸</span>
                <span className="text-2xl md:text-3xl pulse-gentle" style={{ animationDelay: "0.5s" }}>🔥</span>
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

      {/* Modal */} 
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md transform transition-all scale-100 opacity-100 relative">
            <button 
              onClick={closeModal} 
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10" // Added z-10
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!showNameInput ? (
              <>
                <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">选择挑战身份</h2>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => handleSelectOption('self')}
                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-base md:text-lg transition-colors shadow hover:shadow-md"
                  >
                    用我的名字挑战
                  </button>
                  <button 
                    onClick={() => handleSelectOption('other')}
                    className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg font-medium text-base md:text-lg transition-colors shadow hover:shadow-md"
                  >
                    用其他名字挑战
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleNameSubmit}>
                <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">输入你的名字</h2>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="请输入你的大名"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                  autoFocus
                />
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-base md:text-lg transition-colors shadow hover:shadow-md"
                >
                  确认并开始挑战
                </button>
                 <button 
                    type="button" // Important: type="button" to prevent form submission
                    onClick={() => setShowNameInput(false)} // Go back to options
                    className="w-full mt-3 px-6 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    返回选择
                  </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}