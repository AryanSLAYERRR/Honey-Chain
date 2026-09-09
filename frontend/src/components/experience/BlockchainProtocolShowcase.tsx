'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Fingerprint,
  Lock,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Wallet,
  Zap,
} from 'lucide-react';

interface BlockchainGuarantee {
  id: string;
  stepNumber: string;
  category: string;
  title: string;
  accent: string;
  icon: typeof Cpu;
  corePromise: string;
  simpleExplanation: string;
  cheatAttempt: {
    scenario: string;
    systemResponse: string;
  };
  keyBenefits: string[];
  visualMetrics: {
    label: string;
    value: string;
  }[];
}

const guarantees: BlockchainGuarantee[] = [
  {
    id: 'origin',
    stepNumber: '01',
    category: 'AT THE APIARY',
    title: 'Origin Cannot Be Faked',
    accent: '#e5a52d',
    icon: Cpu,
    corePromise: 'Every drop is anchored to a real beehive GPS coordinate.',
    simpleExplanation:
      'The moment honey is extracted, the harvest weight, temperature, and GPS coordinates are permanently locked. Supermarket factories cannot invent fake origin certificates or claim cheap syrup is wild mountain honey.',
    cheatAttempt: {
      scenario: 'A supplier claims 500 kg of wild honey from a region with only 2 registered hives.',
      systemResponse: 'Colony yield limits fail verification immediately. The batch is blocked from registration.',
    },
    keyBenefits: [
      'Honest beekeepers get credit for genuine mountain harvest',
      'No retroactive tampering with harvest weight or date',
      'Geofenced boundary ensures true geographical indication (GI)',
    ],
    visualMetrics: [
      { label: 'Harvest Weight', value: '184.2 kg Locked' },
      { label: 'GPS Location', value: '31.6° N, 77.2° E' },
      { label: 'Colony Tag', value: 'Apis cerana H-019' },
    ],
  },
  {
    id: 'transit',
    stepNumber: '02',
    category: 'ON THE ROAD',
    title: 'Zero Drum-Swapping in Transit',
    accent: '#10b981',
    icon: Truck,
    corePromise: 'Both driver and processor must sign each handoff.',
    simpleExplanation:
      'In conventional honey supply chains, middle-mile transporters frequently dilute pure honey with invert sugar syrup. HoneyChain requires dual digital signatures at each checkpoint. If a wax seal is broken or drum weight drops, alerts trip instantly.',
    cheatAttempt: {
      scenario: 'A transporter opens drums during transit to dilute honey with high-fructose corn syrup.',
      systemResponse: 'Digital seal integrity check fails at receiving dock. Payment escrow is immediately frozen.',
    },
    keyBenefits: [
      'Eliminates drum-swapping and volume dilution',
      'Continuous cold-chain temperature logs',
      'Clear legal accountability at every vehicle transfer',
    ],
    visualMetrics: [
      { label: 'Transfer Status', value: '2 of 2 Signed' },
      { label: 'Drum Tamper Seal', value: 'HC-DRM-0128 Intact' },
      { label: 'In-Transit Temp', value: '22.4°C (Safe)' },
    ],
  },
  {
    id: 'escrow',
    stepNumber: '03',
    category: 'FAIR PAYMENTS',
    title: 'Instant 85% Cash Pay for Farmers',
    accent: '#f59e0b',
    icon: Wallet,
    corePromise: 'Beekeepers are paid on day one—not 90 days later.',
    simpleExplanation:
      'Traditional beekeepers wait 3 to 6 months for corporate buyers to settle payment. HoneyChain runs an autonomous escrow contract: the moment honey is inspected and loaded onto the truck, 85% payment is deposited directly to the farmer. The remaining 15% unlocks upon lab clearance.',
    cheatAttempt: {
      scenario: 'A corporate intermediary tries to withhold farmer payment for 4 months to earn float.',
      systemResponse: 'Smart escrow operates autonomously without corporate approval. Funds disburse instantly on event triggers.',
    },
    keyBenefits: [
      'Zero debt traps or delayed payment cycles for rural beekeepers',
      'Transparent 85% advance upon dispatch + 15% lab purity bonus',
      'Direct-to-bank settlement without commission brokers',
    ],
    visualMetrics: [
      { label: 'Immediate Advance', value: '85% Dispatched' },
      { label: 'Farmer Payout', value: '₹42,500 Direct' },
      { label: 'Reserve Release', value: '15% on Lab Pass' },
    ],
  },
  {
    id: 'consumer',
    stepNumber: '04',
    category: 'AT THE STORE',
    title: '1-Tap Smartphone Verification',
    accent: '#38bdf8',
    icon: Fingerprint,
    corePromise: 'Tap the cap with your phone to see the complete truth.',
    simpleExplanation:
      'Paper labels and static QR codes are easily photocopied onto fake jars. Each HoneyChain jar cap embeds a secure NFC silicon chip. A single smartphone tap generates an authentic verification proof—showing the farm, harvest date, and lab purity tests.',
    cheatAttempt: {
      scenario: 'A counterfeiter clones a printed QR code from a real jar onto 10,000 fake jars.',
      systemResponse: 'Each NFC chip generates unique silicon proof per tap. Duplicate taps flag the clone jar immediately.',
    },
    keyBenefits: [
      'Consumers know with 100% certainty what their children eat',
      'Instant access to government-accredited NABL purity reports',
      'Cloned or counterfeit jars are automatically flagged',
    ],
    visualMetrics: [
      { label: 'Jar NFC Passport', value: 'HC-BTL-000184' },
      { label: 'Lab Purity Score', value: '99.4% (Zero C4 Sugar)' },
      { label: 'Silicon Seal', value: 'Authentic & Verified' },
    ],
  },
];

export default function BlockchainProtocolShowcase() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [showCheatSimulation, setShowCheatSimulation] = useState(false);
  const activeGuarantee = guarantees[activeStageIndex];
  const IconComp = activeGuarantee.icon;

  return (
    <section className="blockchain-showcase" id="blockchain" aria-labelledby="blockchain-showcase-title">
      <div className="blockchain-showcase__container">
        {/* Section Header (Clean, Human, No Cryptic Status Badges) */}
        <header className="blockchain-showcase__header">
          <p className="home-eyebrow">
            <span /> How HoneyChain Protects You <span />
          </p>
          <h2 id="blockchain-showcase-title">
            The four guarantees of <em>HoneyChain.</em>
          </h2>
          <p className="blockchain-showcase__lede">
            No confusing crypto jargon or hidden databases. Here is how our autonomous smart contracts eliminate fake honey, protect beekeepers from delayed payments, and guarantee 100% pure food.
          </p>

          {/* Simple Human-Friendly Stats */}
          <div className="blockchain-stats-strip">
            <div className="blockchain-stat">
              <span className="blockchain-stat__val">100%</span>
              <span className="blockchain-stat__lbl">Origin Verified</span>
            </div>
            <div className="blockchain-stat-divider" />
            <div className="blockchain-stat">
              <span className="blockchain-stat__val">Day 1</span>
              <span className="blockchain-stat__lbl">85% Farmer Payment</span>
            </div>
            <div className="blockchain-stat-divider" />
            <div className="blockchain-stat">
              <span className="blockchain-stat__val">0%</span>
              <span className="blockchain-stat__lbl">Dilution Tolerance</span>
            </div>
            <div className="blockchain-stat-divider" />
            <div className="blockchain-stat">
              <span className="blockchain-stat__val">1 Tap</span>
              <span className="blockchain-stat__lbl">Phone Verification</span>
            </div>
          </div>
        </header>

        {/* 2-Column Intuitive Layout */}
        <div className="blockchain-clean-layout">
          {/* Left Column: 4 Human Guarantee Step Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
            role="tablist"
            aria-label="HoneyChain Guarantees"
          >
            {guarantees.map((g, index) => {
              const isSelected = activeStageIndex === index;
              const StepIcon = g.icon;

              return (
                <div
                  key={g.id}
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => {
                    setActiveStageIndex(index);
                    setShowCheatSimulation(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveStageIndex(index);
                      setShowCheatSimulation(false);
                    }
                  }}
                  className={`blockchain-guarantee-card ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    padding: '1.2rem 1.35rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    border: isSelected ? `2px solid ${g.accent}` : '1px solid var(--line)',
                    background: isSelected ? 'var(--cream)' : 'var(--paper)',
                    boxShadow: isSelected ? `0 8px 24px rgba(0, 0, 0, 0.1), 0 0 12px ${g.accent}20` : 'none',
                    transform: isSelected ? 'translateX(4px)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          color: isSelected ? g.accent : 'var(--muted)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        STEP {g.stepNumber}
                      </span>
                      <span style={{ color: 'var(--line)', fontSize: '0.75rem' }}>·</span>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontWeight: 700,
                          fontSize: '0.64rem',
                          color: isSelected ? g.accent : 'var(--muted)',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {g.category}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: isSelected ? `${g.accent}22` : 'rgba(0,0,0,0.03)',
                        color: isSelected ? g.accent : 'var(--muted)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <strong
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {g.title}
                  </strong>

                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: '0.86rem',
                      lineHeight: '1.5',
                      color: 'var(--muted)',
                    }}
                  >
                    {g.simpleExplanation}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: g.accent, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--ink)' }}>
                      {g.corePromise}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Clean link to Explorer */}
            <Link
              href="/blockchain"
              style={{
                marginTop: '6px',
                padding: '13px 18px',
                borderRadius: '12px',
                background: 'var(--cream)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              className="blockchain-explorer-cta"
            >
              <span>View Live Transparent Ledger Records</span>
              <ArrowRight className="w-4 h-4 text-amber-500" />
            </Link>
          </div>

          {/* Right Column: Clean, Intuitive Visual Guarantee Stage */}
          <div
            style={{
              borderRadius: '18px',
              background: 'var(--cream)',
              border: `1.5px solid ${activeGuarantee.accent}44`,
              padding: '1.8rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Accent Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-60px',
                right: '-60px',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: `${activeGuarantee.accent}15`,
                filter: 'blur(50px)',
                pointerEvents: 'none',
              }}
            />

            <div>
              {/* Card Top Title & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.2rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: `${activeGuarantee.accent}18`,
                    color: activeGuarantee.accent,
                    display: 'grid',
                    placeItems: 'center',
                    border: `1px solid ${activeGuarantee.accent}33`,
                  }}
                >
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: activeGuarantee.accent,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Guarantee in Action · Step {activeGuarantee.stepNumber}
                  </span>
                  <h3
                    style={{
                      margin: '2px 0 0',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {activeGuarantee.title}
                  </h3>
                </div>
              </div>

              {/* 3 Real-World Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                {activeGuarantee.visualMetrics.map((m) => (
                  <div
                    key={m.label}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <small
                      style={{
                        display: 'block',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--mono)',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                      }}
                    >
                      {m.label}
                    </small>
                    <strong
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      {m.value}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Key Human Benefits */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--mono)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.6rem',
                  }}
                >
                  Physical Guarantees Delivered
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeGuarantee.keyBenefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        background: 'var(--paper)',
                        fontSize: '0.82rem',
                        color: 'var(--ink)',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Fraud-Attempt Simulation Drawer */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                background: showCheatSimulation ? 'rgba(239, 68, 68, 0.06)' : 'var(--paper)',
                border: showCheatSimulation ? '1px solid rgba(239, 68, 68, 0.3)' : '1px dashed var(--line)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {showCheatSimulation ? (
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: showCheatSimulation ? 'var(--red)' : 'var(--ink)',
                    }}
                  >
                    {showCheatSimulation ? 'Tampering Simulation Active' : 'What if someone tries to cheat?'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheatSimulation(!showCheatSimulation)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: showCheatSimulation ? 'var(--red)' : 'var(--cream)',
                    color: showCheatSimulation ? '#fff' : 'var(--ink)',
                    border: '1px solid var(--line)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {showCheatSimulation ? 'Reset' : 'Simulate Cheat Attempt'}
                </button>
              </div>

              {showCheatSimulation && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', lineHeight: '1.45' }}>
                  <div style={{ marginBottom: '6px', color: 'var(--muted)' }}>
                    <strong style={{ color: 'var(--red)' }}>Cheating Scenario: </strong>
                    {activeGuarantee.cheatAttempt.scenario}
                  </div>
                  <div style={{ color: 'var(--ink)' }}>
                    <strong style={{ color: 'var(--moss)' }}>System Defense: </strong>
                    {activeGuarantee.cheatAttempt.systemResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
