import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl mb-8">🚀 Emoji 大师</h1>
      <a href="/game">
        <button className="px-6 py-2 bg-blue-500 text-white rounded">
          开始挑战
        </button>
      </a>
    </main>
  );
}