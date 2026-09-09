'use client';

import { useEffect, useRef } from 'react';

interface TopographicCanvasProps {
  opacity?: number;
  interactive?: boolean;
}

export default function TopographicCanvas({
  opacity = 0.8,
  interactive = true,
}: TopographicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Topographic contour layers
    const numLines = 14;
    let time = 0;

    const render = () => {
      time += 0.003;
      // Smooth lerp towards mouse
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Draw each topographic elevation isoline
      for (let i = 0; i < numLines; i++) {
        const lineOffset = (i / numLines) * height;
        const progress = i / numLines;

        ctx.beginPath();
        // Subtle acid volt tint on alternate lines
        if (i % 3 === 0) {
          ctx.strokeStyle = `rgba(210, 255, 0, ${0.035 * opacity})`;
          ctx.lineWidth = 1.1;
        } else {
          ctx.strokeStyle = `rgba(229, 231, 220, ${0.045 * opacity})`;
          ctx.lineWidth = 0.9;
        }

        const steps = 18;
        const stepWidth = width / steps;

        for (let j = 0; j <= steps; j++) {
          const x = j * stepWidth;
          // Mathematical topographical elevation field
          const distToMouse = Math.hypot(x - mouseX, lineOffset - mouseY);
          const mouseInfluence = Math.max(0, 1 - distToMouse / 500) * 45;

          const wave1 = Math.sin(j * 0.45 + time + i * 0.3) * 35;
          const wave2 = Math.cos(j * 0.25 - time * 0.8 + i * 0.5) * 25;
          const wave3 = Math.sin((x / width) * Math.PI * 2 + time * 0.5) * 20;

          const y = lineOffset + wave1 + wave2 + wave3 - mouseInfluence;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (j - 1) * stepWidth;
            const cX = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, y, cX, y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [opacity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 w-full h-full overflow-hidden"
      style={{ opacity }}
    />
  );
}
