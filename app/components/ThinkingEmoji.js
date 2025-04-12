"use client";

export const ThinkingEmoji = ({ thinkingDots = 1 }) => {
  const emojis = ['🤔', '🧐', '🔍'];
  return (
    <div className="card p-6 fade-in-once min-h-[160px]">
      <h2 className="text-xl font-medium mb-4">AI的答案：</h2>
      <div className="text-4xl mb-4 flex items-center justify-center space-x-2">
        {emojis.slice(0, thinkingDots % (emojis.length + 1) || 1).map((emoji, index) => (
          <span key={index} className="inline-block">{emoji}</span>
        ))}
      </div>
    </div>
  );
}; 