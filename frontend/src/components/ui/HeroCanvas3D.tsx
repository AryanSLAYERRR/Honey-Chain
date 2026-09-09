'use client';

import { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export default function HeroCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse interactive coordinates
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetRotY = x * 1.5;
      targetRotX = -y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Build 3D Honeycomb Polyhedron / Amber Matrix Nodes
    const nodes: Point3D[] = [];
    const hexRadius = 140;
    const rings = 3;

    // Create 3D hexagonal layers
    for (let r = -1; r <= 1; r++) {
      const zOffset = r * 70;
      const scale = 1 - Math.abs(r) * 0.25;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        nodes.push({
          x: Math.cos(angle) * hexRadius * scale,
          y: Math.sin(angle) * hexRadius * scale,
          z: zOffset,
        });
      }
      // Inner core node
      nodes.push({ x: 0, y: 0, z: zOffset * 1.3 });
    }

    // Outer satellite floating particles
    const satellites: { x: number; y: number; z: number; speed: number; radius: number; phase: number }[] = [];
    for (let i = 0; i < 35; i++) {
      satellites.push({
        x: (Math.random() - 0.5) * 450,
        y: (Math.random() - 0.5) * 450,
        z: (Math.random() - 0.5) * 350,
        speed: 0.005 + Math.random() * 0.015,
        radius: 1 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Smooth inertia interpolation
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;

      const autoRotateY = time * 0.35 + rotY;
      const autoRotateX = Math.sin(time * 0.25) * 0.15 + rotX;

      const cosY = Math.cos(autoRotateY);
      const sinY = Math.sin(autoRotateY);
      const cosX = Math.cos(autoRotateX);
      const sinX = Math.sin(autoRotateX);

      const fov = 420;
      const cx = width / 2;
      const cy = height / 2;

      // Project 3D points
      const projected = nodes.map((p) => {
        // Rotate Y
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;
        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        const scale = fov / (fov + z2 + 180);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      });

      // Draw connection lines between nearest nodes
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const alpha = Math.max(0, (1 - dist / 135) * 0.35);
            ctx.strokeStyle = `rgba(255, 184, 0, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw central glowing aura
      const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
      radialGlow.addColorStop(0, 'rgba(255, 184, 0, 0.2)');
      radialGlow.addColorStop(0.5, 'rgba(210, 255, 0, 0.05)');
      radialGlow.addColorStop(1, 'rgba(6, 6, 8, 0)');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Draw primary node points
      projected.forEach((p, idx) => {
        const size = Math.max(1.5, 3.5 * p.scale);
        const isCore = idx % 7 === 6;

        ctx.fillStyle = isCore ? '#D2FF00' : '#FFB800';
        ctx.shadowBlur = isCore ? 14 : 8;
        ctx.shadowColor = isCore ? '#D2FF00' : '#FFB800';

        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fill();

        // Sub-ring for core
        if (isCore) {
          ctx.strokeStyle = 'rgba(210, 255, 0, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.px, p.py, size * 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Render floating satellites
      ctx.shadowBlur = 0;
      satellites.forEach((sat) => {
        sat.phase += sat.speed;
        let x1 = sat.x * Math.cos(sat.phase) - sat.z * Math.sin(sat.phase);
        let z1 = sat.x * Math.sin(sat.phase) + sat.z * Math.cos(sat.phase);
        let y2 = sat.y + Math.sin(sat.phase * 2) * 20;

        const scale = fov / (fov + z1 + 220);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        if (px > 0 && px < width && py > 0 && py < height) {
          ctx.fillStyle = sat.radius > 2 ? 'rgba(210, 255, 0, 0.7)' : 'rgba(255, 184, 0, 0.5)';
          ctx.beginPath();
          ctx.arc(px, py, sat.radius * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none select-none">
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
      {/* Cinematic subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-[#060608]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060608]/80 via-transparent to-[#060608]/80" />
    </div>
  );
}
