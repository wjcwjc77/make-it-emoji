"use client";
import emojiData from "../../data/chengyu_emoji.json";
import { useState, useEffect } from "react";

export default function GamePage() {
  const [phrase, setPhrase] = useState("");
  const [emojis, setEmojis] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const phrases = Object.keys(emojiData);
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setPhrase(randomPhrase);
    setEmojis(emojiData[randomPhrase]);
  }, []);

  const handleSelect = (emoji) => {
    if (selected.length < 5) setSelected([...selected, emoji]);
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
    localStorage.setItem("availableEmojis", JSON.stringify(emojis));
    window.location.href = "/result";
  };

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl">用Emoji表达：<b>{phrase}</b></h2>

      <div className="my-4 grid grid-cols-8 gap-2 max-w-4xl mx-auto">
        {emojis.map((emoji, idx) => (
          <button 
            key={idx} 
            className="text-3xl p-2 hover:bg-gray-100 rounded transition-colors"
            onClick={() => handleSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="my-4 text-xl">
        你选了: {selected.join(" ")}
      </div>

      <div className="my-4 flex justify-center gap-4">
        <button 
          className="px-4 py-2 bg-yellow-500 text-white rounded"
          onClick={handleUndo}
        >
          撤销一个
        </button>

        <button 
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleClear}
        >
          清空选择
        </button>
      </div>

      <button 
        className="px-6 py-2 bg-green-500 text-white rounded"
        onClick={handleSubmit}
      >
        提交
      </button>
    </div>
  );
}
