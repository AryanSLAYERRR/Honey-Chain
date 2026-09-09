'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export default function WireframeCadCenterpiece() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'wireframe' | 'composite'>('wireframe');
  const [rotation, setRotation] = useState({ x: 12, y: -18 });
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const size = Math.min(canvas.parentElement?.clientWidth || 460, 460);
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // 3D Hexagonal Vessel Nodes (Biomechanical Honey Cell)
    interface Point3D { x: number; y: number; z: number }
    const nodes: Point3D[] = [];
    const layers = 6;
    const radius = 110;
    const heightStep = 45;

    for (let l = 0; l < layers; l++) {
      const y = (l - layers / 2) * heightStep;
      const layerRadius = radius * (1 - Math.abs(l - layers / 2) * 0.12);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        nodes.push({
          x: Math.cos(angle) * layerRadius,
          y: y,
          z: Math.sin(angle) * layerRadius,
        });
      }
    }

    // Top cap point and bottom base point
    const topCap: Point3D = { x: 0, y: (layers / 2) * heightStep + 25, z: 0 };
    const bottomCap: Point3D = { x: 0, y: -(layers / 2) * heightStep - 25, z: 0 };

    let currentAngleY = 0;
    let currentAngleX = 0;

    const render = () => {
      // Smooth track mouse
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      currentAngleY += 0.006 + mousePos.current.x * 0.0003;
      currentAngleX = Math.sin(Date.now() * 0.001) * 0.1 + mousePos.current.y * 0.0003;

      setRotation({
        x: Math.round(currentAngleX * (180 / Math.PI)),
        y: Math.round((currentAngleY % (Math.PI * 2)) * (180 / Math.PI)),
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Project 3D to 2D
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);

      const project = (p: Point3D) => {
        // Y rotation
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        // X rotation
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        // Perspective
        const scale = 550 / (550 + z2);
        return {
          x: x1 * scale * 1.5,
          y: y2 * scale * 1.5,
          z: z2,
          scale,
        };
      };

      const projectedNodes = nodes.map(project);
      const projTop = project(topCap);
      const projBottom = project(bottomCap);

      // Ambient background glow for vessel
      if (viewMode === 'composite') {
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 200);
        grad.addColorStop(0, 'rgba(255, 184, 0, 0.28)');
        grad.addColorStop(0.5, 'rgba(210, 255, 0, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw CAD rings & Axis Crosshairs
      ctx.strokeStyle = 'rgba(210, 255, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 260, 0, Math.PI * 2);
      ctx.stroke();

      // Precision crosshair lines
      ctx.strokeStyle = 'rgba(229, 231, 220, 0.08)';
      ctx.beginPath();
      ctx.moveTo(-280, 0); ctx.lineTo(280, 0);
      ctx.moveTo(0, -280); ctx.lineTo(0, 280);
      ctx.stroke();

      // Draw Wireframe Edges
      ctx.lineWidth = viewMode === 'wireframe' ? 1.5 : 1.2;

      for (let l = 0; l < layers; l++) {
        // Horizontal loop
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const idx = l * 6 + i;
          const nextIdx = l * 6 + ((i + 1) % 6);
          const p1 = projectedNodes[idx];
          const p2 = projectedNodes[nextIdx];

          const isFront = p1.z > 0 || p2.z > 0;
          ctx.strokeStyle = isFront
            ? (viewMode === 'wireframe' ? 'rgba(210, 255, 0, 0.85)' : 'rgba(255, 184, 0, 0.8)')
            : 'rgba(229, 231, 220, 0.18)';

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Vertical ribs
        if (l < layers - 1) {
          for (let i = 0; i < 6; i++) {
            const idx = l * 6 + i;
            const nextLayerIdx = (l + 1) * 6 + i;
            const p1 = projectedNodes[idx];
            const p2 = projectedNodes[nextLayerIdx];

            const isFront = p1.z > 0 || p2.z > 0;
            ctx.strokeStyle = isFront
              ? (viewMode === 'wireframe' ? 'rgba(210, 255, 0, 0.7)' : 'rgba(255, 200, 50, 0.6)')
              : 'rgba(229, 231, 220, 0.14)';

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Cross bracing (CAD truss)
            const diagonalIdx = (l + 1) * 6 + ((i + 1) % 6);
            const pDiag = projectedNodes[diagonalIdx];
            ctx.strokeStyle = isFront
              ? 'rgba(210, 255, 0, 0.25)'
              : 'rgba(229, 231, 220, 0.08)';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(pDiag.x, pDiag.y);
            ctx.stroke();
          }
        }
      }

      // Draw Top & Bottom Cap Lines
      const topRingStart = (layers - 1) * 6;
      for (let i = 0; i < 6; i++) {
        const p = projectedNodes[topRingStart + i];
        ctx.strokeStyle = 'rgba(210, 255, 0, 0.4)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(projTop.x, projTop.y);
        ctx.stroke();
      }

      for (let i = 0; i < 6; i++) {
        const p = projectedNodes[i];
        ctx.strokeStyle = 'rgba(210, 255, 0, 0.25)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(projBottom.x, projBottom.y);
        ctx.stroke();
      }

      // Vertex Nodes (Glowing coordinate anchors)
      projectedNodes.forEach((p, idx) => {
        if (p.z > -40) {
          ctx.fillStyle = '#D2FF00';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.z > 30 ? 3.2 : 2, 0, Math.PI * 2);
          ctx.fill();

          if (idx === 14 && viewMode === 'wireframe') {
            // Precision annotation tag on front vertex
            ctx.fillStyle = '#D2FF00';
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillText('[ NFC TAG NTAG424 ]', p.x + 8, p.y - 6);
            ctx.strokeStyle = '#D2FF00';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 6, p.y - 6);
            ctx.stroke();
          }
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      mousePos.current.targetX = x;
      mousePos.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [viewMode]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 3D Canvas Box */}
      <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="relative z-10 cursor-grab active:cursor-grabbing"
        />

        {/* Floating Neon Slash / Signature Vector Overlay (Lando Norris style) */}
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <svg className="w-4/5 h-4/5 opacity-85" viewBox="0 0 200 200" fill="none">
            {/* Dynamic neon brush slash */}
            <motion.path
              d="M 35 165 L 165 35 M 95 65 L 135 155 L 75 125"
              stroke="#D2FF00"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 12px rgba(210, 255, 0, 0.7))' }}
            />
          </svg>
        </div>

        {/* Viewport Corner HUD Badges */}
        <div className="absolute top-3 left-3 z-30 font-racing-mono text-[10px] text-zinc-400">
          <span className="text-[#D2FF00] font-bold">CAD // WIREFRAME 3D</span>
          <p className="text-[9px] opacity-75">POLYS: 144 • NODES: 38</p>
        </div>

        <div className="absolute bottom-3 right-3 z-30 font-racing-mono text-[10px] text-right text-zinc-400">
          <span className="text-[#D2FF00]">ROTATION</span>
          <p className="text-[9px] opacity-75 font-mono">X: {rotation.x}° | Y: {rotation.y}°</p>
        </div>
      </div>

      {/* Mode Switcher Pill */}
      <div className="mt-2 flex items-center gap-1.5 p-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl z-20 font-racing-mono text-xs">
        <button
          onClick={() => setViewMode('wireframe')}
          className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            viewMode === 'wireframe'
              ? 'bg-[#D2FF00] text-black font-bold shadow-[0_0_15px_rgba(210,255,0,0.5)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> 3D CAD Wireframe
        </button>
        <button
          onClick={() => setViewMode('composite')}
          className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            viewMode === 'composite'
              ? 'bg-[#FFB800] text-black font-bold shadow-[0_0_15px_rgba(255,184,0,0.5)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Honey Refraction
        </button>
      </div>
    </div>
  );
}
