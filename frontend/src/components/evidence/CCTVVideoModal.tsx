'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, ShieldCheck, Video, RefreshCw, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cameraRef: string;
  drumId: string;
  farmName: string;
  harvestDate: string;
}

export default function CCTVVideoModal({ isOpen, onClose, cameraRef, drumId, farmName, harvestDate }: Props) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(35);
  const [currentTime, setCurrentTime] = useState('07:14:28');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated CCTV canvas simulation (beekeeper handling frame / honey extraction)
  useEffect(() => {
    if (!isOpen) return;

    let frameId: number;
    let t = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Dark apiary background
      ctx.fillStyle = '#0a100d';
      ctx.fillRect(0, 0, w, h);

      // Subtle scanline effect
      for (let y = 0; y < h; y += 4) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.fillRect(0, y, w, 1);
      }

      // Draw simulated apiary scene:
      // Sunlight gradient through trees
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(251, 182, 56, 0.12)');
      grad.addColorStop(0.5, 'rgba(24, 40, 29, 0.8)');
      grad.addColorStop(1, 'rgba(10, 16, 13, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw Wooden Langstroth Hive Box
      ctx.fillStyle = '#452c16';
      ctx.fillRect(w * 0.32, h * 0.42, w * 0.36, h * 0.45);
      // Hive rim
      ctx.fillStyle = '#613e1f';
      ctx.fillRect(w * 0.3, h * 0.38, w * 0.4, h * 0.05);

      // Beekeeper in white suit inspecting honey frame
      const sway = Math.sin(t * 0.04) * 6;
      ctx.save();
      ctx.translate(sway, 0);

      // Beekeeper body
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.38, 48, 62, 0, 0, Math.PI * 2);
      ctx.fill();

      // Veil / Mesh hat
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.22, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Honeycomb frame being lifted
      const frameLift = Math.sin(t * 0.03) * 12;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(w * 0.42, h * 0.26 + frameLift, w * 0.16, h * 0.18);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.strokeRect(w * 0.42, h * 0.26 + frameLift, w * 0.16, h * 0.18);

      // Honey glint
      ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.fillRect(w * 0.44, h * 0.28 + frameLift, w * 0.12, h * 0.08);

      ctx.restore();

      // Animated flying bees (particles)
      for (let i = 0; i < 28; i++) {
        const bx = (Math.sin(t * 0.05 + i * 2.1) * 0.4 + 0.5) * w;
        const by = (Math.cos(t * 0.04 + i * 1.7) * 0.3 + 0.4) * h;
        ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#1e293b';
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // CCTV HUD Overlay
      // Camera ID & Date Top Left
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`CAM-04 · ${farmName.toUpperCase()}`, 24, 32);
      ctx.fillText(`GPS: 31.2240° N, 75.7720° E · ELEV: 242m`, 24, 52);

      // Blinking REC Indicator Top Right
      if (Math.floor(t * 0.08) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w - 74, 28, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillText('REC', w - 62, 32);
      }

      // Bottom Timestamp & Cryptographic Signature
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(`${harvestDate} 07:14:${String(Math.floor((t * 0.5) % 60)).padStart(2, '0')} IST`, 24, h - 24);
      ctx.fillText(`DRUM: ${drumId} · HASH: 0x8a3f72c1d4e5b906...`, w - 380, h - 24);

      if (isPlaying) {
        t++;
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.12));
      }
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, isPlaying, farmName, harvestDate, drumId]);

  if (!isOpen) return null;

  return (
    <div
      className="cctv-modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.2rem',
      }}
    >
      <div
        className="cctv-modal-card animate-fadeUp"
        style={{
          background: '#0a100d',
          border: '1px solid #273d2d',
          borderRadius: '1.2rem',
          maxWidth: '780px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          color: '#f0fdf4',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.4rem',
            background: '#070b09',
            borderBottom: '1px solid #1a291f',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Video size={17} color="#4ade80" />
            <strong style={{ fontSize: '0.92rem' }}>Harvest CCTV Inspection Video · {cameraRef}</strong>
            <span
              style={{
                fontSize: '0.7rem',
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 600,
              }}
            >
              Tamper-Proof Audit Clip
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Canvas Feed */}
        <div style={{ position: 'relative', width: '100%', height: '420px', background: '#000' }}>
          <canvas
            ref={canvasRef}
            width={780}
            height={420}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          {/* Central Play/Pause Overlay indicator when paused */}
          {!isPlaying && (
            <div
              onClick={() => setIsPlaying(true)}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.45)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(251, 182, 56, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1a1400',
                  boxShadow: '0 0 30px rgba(251, 182, 56, 0.5)',
                }}
              >
                <Play size={28} style={{ marginLeft: '4px' }} />
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div style={{ padding: '0.8rem 1.4rem', background: '#0d1510', borderTop: '1px solid #1a291f' }}>
          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: '#273d2d',
              borderRadius: '2px',
              cursor: 'pointer',
              marginBottom: '0.8rem',
              position: 'relative',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setProgress((clickX / rect.width) * 100);
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#fbb638',
                borderRadius: '2px',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid #273d2d',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  opacity: 0.7,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                00:{String(Math.floor((progress * 0.15))).padStart(2, '0')} / 00:15 · 1080p 30fps
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={14} /> NABL & FSSAI Seal Intact
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
