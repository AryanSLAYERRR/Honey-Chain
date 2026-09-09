'use client';

import { useState, useRef, ReactNode } from 'react';

interface CyberCard3DProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export default function CyberCard3D({
  children,
  className = '',
  glowColor = 'rgba(255, 184, 0, 0.25)',
  onClick,
}: CyberCard3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -10;
    const rY = ((x - centerX) / centerX) * 10;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="inline-block w-full"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101016]/80 backdrop-blur-xl p-6 transition-all hover:border-honey-500/40 hover:shadow-2xl ${className}`}
      >
        {/* Dynamic Glare Specular Highlight */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, ${glowColor}, transparent 80%)`,
          }}
        />

        {/* Content with 3D Pop */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
