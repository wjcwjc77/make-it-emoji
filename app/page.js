import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 gradient-bg">
      <div className="card max-w-4xl w-full p-8 text-center fade-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          emoji-master
        </h1>
        
        <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
          用Emoji表达中国成语，挑战你的创意思维！
        </p>
        
        <div className="flex gap-6 justify-center mb-12">
          <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform">
            <span className="text-5xl mb-2">🧠</span>
            <h3 className="font-semibold">创意挑战</h3>
          </div>
          <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform">
            <span className="text-5xl mb-2">🤖</span>
            <h3 className="font-semibold">AI 点评</h3>
          </div>
          <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform">
            <span className="text-5xl mb-2">🏆</span>
            <h3 className="font-semibold">百分评分</h3>
          </div>
        </div>

        <Link href="/game">
          <button className="px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-full font-medium text-lg pulse shadow-lg hover:shadow-xl">
            开始挑战
          </button>
        </Link>
      </div>
      
      <div className="mt-12 flex gap-4 text-white">
        <div className="text-5xl animate-bounce delay-100">😀</div>
        <div className="text-5xl animate-bounce delay-200">🤔</div>
        <div className="text-5xl animate-bounce delay-300">🎭</div>
        <div className="text-5xl animate-bounce delay-400">🎯</div>
      </div>
    </section>
  );
}