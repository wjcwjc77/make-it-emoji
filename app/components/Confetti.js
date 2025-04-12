// components/Confetti.jsx
"use client";
import { useMemo, useEffect } from "react";

export const Confetti = () => {
  const confetti = useMemo(
    () =>
      Array.from({ length: 50 }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 3,
        hue: Math.random() * 360,
        size: Math.random() * 8 + 4,
        initialRotation: Math.random() * 360,
        swayAmount: Math.random() * 15 + 5,
      })),
    []
  );

  // Cleanup function to remove confetti after animation
  useEffect(() => {
    const timeout = setTimeout(() => {
      const confettiContainer = document.querySelector('.confetti-container');
      if (confettiContainer) {
        confettiContainer.remove();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden confetti-container">
      {confetti.map((conf, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${conf.left}%`,
            top: `-5%`,
            backgroundColor: `hsl(${conf.hue}, 90%, 70%)`,
            width: `${conf.size}px`,
            height: `${conf.size * 0.6}px`,
            borderRadius: "1px",
            transform: `rotate(${conf.initialRotation}deg)`,
            opacity: 0.9,
            animation: `confettiFall${i} ${conf.duration}s ease-out forwards`,
            animationDelay: `${conf.delay}s`,
          }}
        />
      ))}

      <style jsx>{`
        ${confetti
          .map(
            (conf, i) => `
            @keyframes confettiFall${i} {
              0% {
                transform: translate3d(0, 0, 0) rotate(${conf.initialRotation}deg);
                opacity: 0.9;
              }
              25% {
                transform: translate3d(${conf.swayAmount}px, 25vh, 0) rotate(${conf.initialRotation + 45}deg);
                opacity: 0.9;
              }
              50% {
                transform: translate3d(-${conf.swayAmount}px, 50vh, 0) rotate(${conf.initialRotation + 90}deg);
                opacity: 0.8;
              }
              75% {
                transform: translate3d(${conf.swayAmount}px, 75vh, 0) rotate(${conf.initialRotation + 135}deg);
                opacity: 0.6;
              }
              100% {
                transform: translate3d(-${conf.swayAmount}px, 110vh, 0) rotate(${conf.initialRotation + 180}deg);
                opacity: 0;
              }
            }
          `
          )
          .join("\n")}
      `}</style>
    </div>
  );
};
