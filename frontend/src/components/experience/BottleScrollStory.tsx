'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AnimatePresence, motion, useMotionValueEvent, useScroll,
} from 'framer-motion';
import {
  CheckCircle2, ChevronRight, Fingerprint,
  FlaskConical, MapPin, Network, ShieldCheck, Sparkles,
  Thermometer, Waves,
} from 'lucide-react';

// Dynamically load Three.js WebGL 5-Stage Provenance Journey on the client
const ThreeProvenanceJourney = dynamic(() => import('./ThreeProvenanceJourney'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '540px', display: 'grid', placeItems: 'center' }}>
      <div style={{ font: '700 0.72rem var(--mono)', color: 'var(--amber-dark)', textAlign: 'center' }}>
        <span>⬢ INITIALIZING 3D PROVENANCE JOURNEY…</span>
      </div>
    </div>
  ),
});

interface ChapterData {
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  summary: string;
  stats: { label: string; val: string }[];
  accent: string;
  stageTag: string;
}

const chapters: ChapterData[] = [
  {
    number: '01',
    tag: 'ORIGIN & BOTANY',
    title: 'Kullu Wild Valley',
    subtitle: 'High Altitude Flora',
    summary: 'Harvested from 42 designated Apis cerana hives nestled in high-altitude wildflower groves. Every lot carries geofenced boundary coordinates.',
    stats: [
      { label: 'Latitude / Longitude', val: '31.6° N · 77.2° E' },
      { label: 'Elevation', val: '2,140 m above sea level' },
      { label: 'Flora Type', val: 'Wild Plectranthus & Clover' },
    ],
    accent: '#e5a52d',
    stageTag: '3D Alpine Langstroth Apiary · Apis cerana Flora',
  },
  {
    number: '02',
    tag: 'IOT HIVE TELEMETRY',
    title: 'Warm Hive Seal',
    subtitle: '31.4°C · 64% RH',
    summary: 'Acoustic resonance (240 Hz worker hum) and brood temperature were locked on-chain before the drum lid was torqued shut at the apiary.',
    stats: [
      { label: 'Brood Temperature', val: '31.4°C (Normal)' },
      { label: 'Internal Humidity', val: '64% Relative' },
      { label: 'Acoustic Signature', val: '240 Hz (Calm Queen)' },
    ],
    accent: '#38a169',
    stageTag: '3D Comb Harvest · Dripping Honey · IoT Telemetry',
  },
  {
    number: '03',
    tag: 'COLD-CHAIN ROUTE',
    title: '4 Signed Handoffs',
    subtitle: 'Cryptographic Checkpoints',
    summary: 'Continuous refrigerated custody with 4 GPS waypoints logged on the CustodyChain smart contract. Physical wax tamper seal remained unbroken.',
    stats: [
      { label: 'Transit Window', val: '18.2 hrs across 320 km' },
      { label: 'Max Transit Temp', val: '22.1°C (Well below 26° limit)' },
      { label: 'Custody Signatures', val: '4 Multi-Sig Receipts' },
    ],
    accent: '#2563eb',
    stageTag: '3D Refrigerated Smart Canister · 22.1°C Multi-Sig',
  },
  {
    number: '04',
    tag: 'NABL DUAL TESTING',
    title: '97.2% Pure Wildflower',
    subtitle: 'Lab Docket Passed',
    summary: 'Pre- and post-processing gas chromatography & NMR spectral scans anchor zero C4 cane adulterants and certified low moisture.',
    stats: [
      { label: 'Moisture Content', val: '17.8% (FSSAI max 20%)' },
      { label: 'HMF Index', val: '8.4 mg/kg (Ultra-fresh)' },
      { label: 'C4 Sugars (NMR)', val: '0.0% (Undetectable)' },
    ],
    accent: '#805ad5',
    stageTag: '3D Lab Funnel · Laser Purity Scan · Pure Bottling',
  },
  {
    number: '05',
    tag: 'NFC PROVENANCE MINT',
    title: 'NXP NTAG 424 DNA',
    subtitle: 'Cryptographic Bottle Seal',
    summary: 'Each bottle cap embeds an AES-128 cryptographic NFC tag that mints an on-chain verification receipt upon first consumer tap.',
    stats: [
      { label: 'Hardware Token', val: 'NXP NTAG 424 DNA (SUN)' },
      { label: 'Hardhat EVM Block', val: '#18,234,501' },
      { label: 'Anti-Clone Counter', val: 'Tap 1 of 1 (Original)' },
    ],
    accent: '#d97706',
    stageTag: '3D NFC Sealed Cap · EVM Mined · Presentation Box',
  },
];

export default function BottleScrollStory() {
  const ref = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgressVal, setScrollProgressVal] = useState(0);

  // Scroll tracking through 280vh pinned track
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setScrollProgressVal(progress);
    const chapter = Math.min(4, Math.max(0, Math.floor(progress * 5)));
    setActiveChapter(chapter);
  });

  const active = chapters[activeChapter];

  return (
    <section
      ref={ref}
      className="bottle-story"
      id="layers"
      aria-label="A photorealistic 3D provenance journey reveals the honey supply chain layer by layer"
    >
      <div className="bottle-story__sticky">
        {/* Left Column: Dynamic Story Narrative */}
        <div className="bottle-story__copy">
          <p className="home-eyebrow">
            <span /> Stage {active.number} / 05 · {active.tag}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2>
                {active.title}
                <br />
                <em>{active.subtitle}.</em>
              </h2>
              <p className="bottle-story__summary">{active.summary}</p>

              {/* Dynamic Proof Stats Box */}
              <div className="bottle-story__specs-box">
                {active.stats.map((s) => (
                  <div key={s.label} className="bottle-story__spec-row">
                    <small>{s.label}</small>
                    <strong suppressHydrationWarning>{s.val}</strong>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center Column: Photorealistic 3D WebGL Provenance Stage (Centered between text and timeline) */}
        <div className="bottle-3d-stage" aria-hidden="true" style={{ width: '100%', height: '580px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
          {/* Ambient Warm Honey Radiance */}
          <div className="bottle-3d-aura" />

          {/* Three.js 3D WebGL Canvas - Centered */}
          <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 5, overflow: 'visible' }}>
            <ThreeProvenanceJourney scrollProgress={scrollProgressVal} />
          </div>
        </div>


        {/* Right Column: Interactive Provenance Timeline Track */}
        <div className="bottle-story__chapters" role="tablist" aria-label="Bottle provenance layers">
          <p className="bottle-story__chapters-title">PROVENANCE REVELATION TRACK</p>

          {chapters.map((ch, index) => {
            const isActive = index === activeChapter;
            const isPast = index < activeChapter;
            return (
              <div
                key={ch.number}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                className={`bottle-chapter-card ${isActive ? 'is-active' : ''} ${isPast ? 'is-past' : ''}`}
                onClick={() => {
                  if (ref.current) {
                    const top = ref.current.offsetTop;
                    const height = ref.current.scrollHeight - window.innerHeight;
                    window.scrollTo({
                      top: top + (index / 4.5) * height,
                      behavior: 'smooth',
                    });
                  }
                }}
              >
                <div className="bottle-chapter-card__indicator">
                  <span className="bottle-chapter-card__num">{ch.number}</span>
                  <div className="bottle-chapter-card__dot" />
                </div>
                <div className="bottle-chapter-card__body">
                  <small>{ch.tag}</small>
                  <strong>{ch.title}</strong>
                  <p>{ch.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
