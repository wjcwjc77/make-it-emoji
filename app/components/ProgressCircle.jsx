"use client";

import React, { useEffect, useState, useMemo } from "react";

export default function ProgressCircle({
  score = 80,
  strokeColor = "auto",
  strokeColorEnd = "auto",
  trackColor = "#f3f4f6",
  trackColorEnd = "#e5e7eb",
  size = "w-40 h-40",
  textSize = "text-6xl"
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = (value) => circumference - (value / 100) * circumference;

  // 分数动画
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isScoreComplete, setIsScoreComplete] = useState(false);

  useEffect(() => {
    let animationFrameId;
    const duration = 1000;
    const startTime = performance.now();

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
    const easeOutBack = (x) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      
      setAnimationProgress(eased);
      setAnimatedScore(Math.floor(score * eased));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsScoreComplete(true);
      }
    };

    setIsScoreComplete(false);
    requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  // 动态颜色插值函数（红 -> 橙 -> 黄 -> 绿），使用十六进制而不是 hsl
  const getInterpolatedColor = (value) => {
    // 定义一个颜色映射数组，从红到绿
    const colorStops = [
      { value: 0, color: "#ef4444" },   // 红色 (0%)
      { value: 25, color: "#f97316" },  // 橙色 (25%)
      { value: 50, color: "#eab308" },  // 黄色 (50%)
      { value: 75, color: "#84cc16" },  // 黄绿色 (75%)
      { value: 100, color: "#22c55e" }  // 绿色 (100%)
    ];
    
    // 找到当前值所在的区间
    let lowerStop = colorStops[0];
    let upperStop = colorStops[colorStops.length - 1];
    
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (value >= colorStops[i].value && value <= colorStops[i + 1].value) {
        lowerStop = colorStops[i];
        upperStop = colorStops[i + 1];
        break;
      }
    }
    
    // 计算在当前区间中的位置 (0~1)
    const range = upperStop.value - lowerStop.value;
    const position = range === 0 ? 0 : (value - lowerStop.value) / range;
    
    // 根据score值返回对应区间的色值，不做复杂插值，避免兼容性问题
    if (value < 25) return "#ef4444";
    if (value < 50) return "#f97316";
    if (value < 75) return "#eab308";
    return "#22c55e";
  };

  const colorA = useMemo(() => {
    return strokeColor === "auto" ? getInterpolatedColor(animatedScore) : strokeColor;
  }, [animatedScore, strokeColor]);

  const colorB = useMemo(() => {
    return strokeColorEnd === "auto" ? getInterpolatedColor(Math.min(animatedScore + 10, 100)) : strokeColorEnd;
  }, [animatedScore, strokeColorEnd]);

  // 计算当前进度
  const currentProgress = score * animationProgress;

  return (
    <div className={`relative ${size} animate-scaleFadeIn`}>
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <defs>
          <linearGradient id="trackGradient" gradientTransform="rotate(45)">
            <stop offset="0%" stopColor={trackColor} />
            <stop offset="100%" stopColor={trackColorEnd} />
          </linearGradient>

          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorA} />
            <stop offset="100%" stopColor={colorB} />
          </linearGradient>
        </defs>

        {/* 背景轨道 */}
        <circle
          stroke="url(#trackGradient)"
          strokeWidth="10"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          style={{ filter: 'blur(0.5px)', opacity: 0.8 }}
        />

        {/* 装饰圈 */}
        <circle
          r="41"
          cx="50"
          cy="50"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="4 8"
          className="animate-spin-slow"
          style={{ transformOrigin: 'center' }}
        />

        {/* 呼吸光圈 */}
        <circle
          r="43"
          cx="50"
          cy="50"
          stroke={`${colorA}44`}
          strokeWidth="2"
          fill="none"
          className="pulse-ring"
        />

        {/* 主进度条 */}
        <circle
          stroke="url(#progressGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset(currentProgress)}
          className="progress-ring__circle"
          style={{
            transition: 'none',
            filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.2))'
          }}
        />

        {/* soft light 层 */}
        <circle
          stroke={`${colorA}40`}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset(currentProgress)}
          style={{
            transition: 'none',
            mixBlendMode: 'soft-light'
          }}
        />
      </svg>

      {/* 中间数字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-black ${textSize} ${isScoreComplete ? 'animate-scoreComplete' : ''}`}
          style={{
            backgroundImage: `linear-gradient(to right, ${colorA}, ${colorB})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            transform: `scale(${1 + animationProgress * 0.4})`,
            transition: 'transform 0.05s ease-out',
            letterSpacing: '-0.05em',
            lineHeight: '1'
          }}
        >
          {animatedScore}
        </span>
      </div>

      <style jsx global>{`
        .progress-ring__circle {
          transform-origin: 50% 50%;
          transform: rotate(-90deg);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes scaleFadeIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleFadeIn {
          animation: scaleFadeIn 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }

        @keyframes bounceOnce {
          0% { transform: scale(1); }
          40% { transform: scale(1.2); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-bounceOnce {
          animation: bounceOnce 0.6s ease;
        }

        @keyframes pulseRing {
          0% {
            stroke-width: 2;
            opacity: 0.5;
            r: 43;
          }
          70% {
            stroke-width: 1;
            opacity: 0;
            r: 47;
          }
          100% {
            stroke-width: 0;
            opacity: 0;
            r: 47;
          }
        }
        .pulse-ring {
          animation: pulseRing 2s ease-out infinite;
          transform-origin: center;
        }

        @keyframes scoreComplete {
          0% { transform: scale(1); }
          50% { transform: scale(1.6); }
          75% { transform: scale(0.95); }
          100% { transform: scale(1.4); }
        }
        .animate-scoreComplete {
          animation: scoreComplete 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
