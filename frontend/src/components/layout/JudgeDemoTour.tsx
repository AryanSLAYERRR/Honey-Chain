'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Award, ChevronRight, ChevronLeft, Sparkles, X, Eye,
  CheckCircle2, ArrowRight, ShieldCheck, Cpu, Smartphone, Layers
} from 'lucide-react';

interface TourStep {
  step: number;
  title: string;
  role: 'farmer' | 'admin' | 'processor' | 'consumer';
  path: string;
  badge: string;
  narrative: string;
  techHighlight: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: 'Farmer & Hive IoT',
    role: 'farmer',
    path: '/farmer',
    badge: 'Stage 1: Production',
    narrative: 'Beekeepers capture real-time hive sensor telemetry (temp, humidity, weight) and register tamper-proof harvest batches.',
    techHighlight: 'IoT Telemetry • Bilingual Hindi UI • LoRaWAN',
  },
  {
    step: 2,
    title: 'AI Verification',
    role: 'admin',
    path: '/admin',
    badge: 'Stage 2: AI Fraud Check',
    narrative: 'AI scans 5 fraud vectors: FSSAI moisture (<20%), expected yield match, image refractivity, and sensor consistency.',
    techHighlight: 'Anomaly Detection • FSSAI Compliance • Fast Review',
  },
  {
    step: 3,
    title: 'Escrow Marketplace',
    role: 'processor',
    path: '/marketplace',
    badge: 'Stage 3: B2B Trade',
    narrative: 'Processor sources verified honey with an automated 85% advance / 15% quality reserve smart contract payment escrow.',
    techHighlight: 'Solidity Escrow • 85/15 Split • Fair Farmer Pay',
  },
  {
    step: 4,
    title: 'Processor & Dual Lab',
    role: 'processor',
    path: '/processor',
    badge: 'Stage 4: Quality & Bottling',
    narrative: 'Factory tracks inbound transport, verifies Pre & Post processing lab tests, blends barrels, and mints NFC-chipped bottles.',
    techHighlight: 'Dual Lab Reports • Lot Blending • NFC Tagging',
  },
  {
    step: 5,
    title: 'Consumer Deep Verify',
    role: 'consumer',
    path: '/verify/HC-BTL-000184',
    badge: 'Stage 5: Consumer Trust',
    narrative: 'Consumers scan the bottle NFC/QR to inspect complete 30-barrel lot origins, GPS custody trail, and anti-cloning security.',
    techHighlight: 'NFC Cryptogram • Tamper Detection • Public Audit',
  },
  {
    step: 6,
    title: 'Blockchain Explorer',
    role: 'admin',
    path: '/blockchain',
    badge: 'Stage 6: On-Chain Audit',
    narrative: 'Inspect immutable EVM blocks, transaction hashes, and smart contract state records confirming end-to-end provenance.',
    techHighlight: 'Hardhat EVM • 4 Smart Contracts • Cryptographic Proof',
  },
];

export default function JudgeDemoTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Determine current active step based on pathname
  const currentStepIndex = TOUR_STEPS.findIndex(s => pathname.startsWith(s.path.split('?')[0]));
  const currentStep = currentStepIndex >= 0 ? TOUR_STEPS[currentStepIndex] : TOUR_STEPS[0];

  const navigateToStep = (step: TourStep) => {
    switchRole(step.role);
    router.push(step.path);
  };

  const handleNext = () => {
    const nextIndex = (currentStepIndex + 1) % TOUR_STEPS.length;
    navigateToStep(TOUR_STEPS[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentStepIndex - 1 + TOUR_STEPS.length) % TOUR_STEPS.length;
    navigateToStep(TOUR_STEPS[prevIndex]);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      {!isOpen ? (
        // Minimized floating button
        <button
          onClick={() => setIsOpen(true)}
          className="mx-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0A0A0E]/95 hover:bg-black text-white shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl border border-honey-500/40 text-xs font-mono font-bold transition-all hover:scale-105 group"
        >
          <Award className="w-4 h-4 text-honey-400 group-hover:rotate-12 transition-transform" />
          <span className="text-honey-400 uppercase tracking-wider">SIH Interactive Tour:</span>
          <span className="text-zinc-300">Stage {currentStep.step}/6 — {currentStep.title}</span>
          <span className="bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 px-2 py-0.5 rounded-full text-[10px] font-mono ml-1">
            [ EXPAND ]
          </span>
        </button>
      ) : (
        // Expanded Interactive Presentation Bar
        <div className="bg-[#0A0A0E]/95 text-white rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl border border-white/15 p-4 transition-all animate-fadeUp">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-honey-500/10 border border-honey-500/30 rounded-xl text-honey-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="mono-tag text-honey-400 block mb-0.5">[ SIH 26021 // EVALUATION TOUR ]</span>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Interactive Presentation Sequence
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-3">
            {TOUR_STEPS.map((s) => {
              const isActive = s.step === currentStep.step;
              return (
                <button
                  key={s.step}
                  onClick={() => navigateToStep(s)}
                  className={`p-2.5 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-[#FFB800] text-black font-mono font-bold border-[#FFB800] shadow-[0_0_20px_rgba(255,184,0,0.3)] scale-[1.02]'
                      : 'bg-black/50 hover:bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-80 mb-0.5 font-mono">
                    <span>STAGE 0{s.step}</span>
                    {isActive && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                  <p className="text-xs truncate font-mono font-bold leading-tight">{s.title}</p>
                </button>
              );
            })}
          </div>

          {/* Current Step Description & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/60 p-3.5 rounded-xl border border-white/10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-amber text-[10px]">{currentStep.badge}</span>
                <span className="text-xs font-mono text-[#D2FF00] font-semibold">{currentStep.techHighlight}</span>
              </div>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed">{currentStep.narrative}</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <button
                onClick={handlePrev}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={handleNext}
                className="btn-cyber px-4 py-2 bg-[#FFB800] hover:bg-[#F59E0B] text-black rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,184,0,0.3)] transition-all uppercase tracking-wider"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
