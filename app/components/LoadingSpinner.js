"use client";

export const LoadingSpinner = ({ thinkingDots = 1 }) => (
  <div className="max-w-md mx-auto flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg fade-in-once">
    <div className="relative w-24 h-24 mb-6">
      <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-transparent border-r-primary border-b-transparent border-l-transparent animate-spin animation-delay-150"></div>
      <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-transparent border-r-transparent border-b-primary border-l-transparent animate-spin animation-delay-300"></div>
    </div>
    <div className="text-xl font-medium">AI正在思考中...</div>
    <div className="flex items-center justify-center mt-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        请稍候{'.'.repeat(thinkingDots)}
      </span>
    </div>
  </div>
); 