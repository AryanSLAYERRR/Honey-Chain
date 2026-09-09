'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown, ArrowUpRight, Blocks, Check, FlaskConical, Fingerprint, Hexagon,
  MapPin, Menu, MoveRight, Network, ScanLine, ShieldCheck, Sprout, X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from '@/lib/theme-context';
import WalletConnectButton from '@/components/ui/WalletConnectButton';
import HoneyDropScene from '@/components/experience/HoneyDropScene';
import BottleScrollStory from '@/components/experience/BottleScrollStory';
import BlockchainProtocolShowcase from '@/components/experience/BlockchainProtocolShowcase';
import type { UserRole } from '@/lib/types';

const journey = [
  {
    number: '01',
    eyebrow: 'Apiary',
    title: 'A place, not a promise.',
    copy: 'Every lot starts with a named apiary, a grower and a living hive record—not a marketing claim.',
    evidence: 'Origin record · 31.6° N / 77.2° E',
    note: 'H-019 / 42 active hives',
    icon: Sprout,
  },
  {
    number: '02',
    eyebrow: 'Harvest',
    title: 'Sealed while it is still warm.',
    copy: 'A harvest weight, moisture reading and tamper seal give each drum a real first page.',
    evidence: 'Drum seal · HC-DRM-0128',
    note: '06:45 IST / 184.2 kg',
    icon: Hexagon,
  },
  {
    number: '03',
    eyebrow: 'Custody',
    title: 'Every handoff leaves a mark.',
    copy: 'Location, temperature and seal status travel with the lot, so the route is visible long after the vehicle has moved on.',
    evidence: 'Custody receipt · 4 checkpoint scans',
    note: 'Kashmir → Punjab',
    icon: MapPin,
  },
  {
    number: '04',
    eyebrow: 'Lab',
    title: 'Evidence over assurance.',
    copy: 'Pre- and post-processing reports make the quality decision legible rather than hiding it behind a single score.',
    evidence: 'Lab docket · moisture 17.8%',
    note: 'NABL / report 4829',
    icon: FlaskConical,
  },
  {
    number: '05',
    eyebrow: 'Bottle',
    title: 'A passport in your hand.',
    copy: 'The NFC seal opens the complete story of a bottle—the farm, route, lab results and cryptographic proof.',
    evidence: 'NFC passport · NTAG 424 DNA',
    note: 'HC-BTL-000184',
    icon: Fingerprint,
  },
];

const workspaces: { role: UserRole; title: string; label: string; path: string; detail: string; accent: string }[] = [
  { role: 'farmer', title: 'The apiary fieldbook', label: 'For beekeepers', path: '/farmer', detail: 'Hives, harvests and practical daily signals.', accent: 'field' },
  { role: 'processor', title: 'The batch workbench', label: 'For processors', path: '/processor', detail: 'Receive, test, blend and bottle with a clear chain of custody.', accent: 'workbench' },
  { role: 'admin', title: 'The evidence desk', label: 'For reviewers', path: '/admin', detail: 'Review the records that support a confident approval.', accent: 'dossier' },
  { role: 'consumer', title: 'The bottle passport', label: 'For every buyer', path: '/verify/HC-BTL-000184', detail: 'Read the journey behind the jar in your hand.', accent: 'passport' },
];

export default function LandingPage() {
  const router = useRouter();
  const { switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const journeyRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ['start 82%', 'end 62%'],
  });
  const heroY = useTransform(scrollY, [0, 700], [0, reduceMotion ? 0 : 96]);
  const sceneY = useTransform(scrollY, [0, 700], [0, reduceMotion ? 0 : -72]);
  const evidenceScale = useTransform(scrollYProgress, [0, 1], [0.03, 1]);

  const launch = (role: UserRole, path: string) => {
    switchRole(role);
    router.push(path);
  };

  return (
    <main className="home-shell">
      <header className="home-nav">
        <Link href="/" className="home-brand" aria-label="HoneyChain home">
          <span className="home-brand__mark"><Hexagon aria-hidden="true" /></span>
          <span>HoneyChain</span>
        </Link>

        <nav className="home-nav__links" aria-label="Main navigation">
          <a href="#blockchain">Guarantees</a>
          <a href="#journey">The journey</a>
          <a href="#proof">The proof</a>
          <Link href="/marketplace" onClick={() => switchRole('processor')}>Marketplace</Link>
        </nav>

        <div className="home-nav__actions">
          <WalletConnectButton />
          <ThemeToggle />
          <Link href="/verify/HC-BTL-000184" className="button button--ink" onClick={() => switchRole('consumer')}>
            Trace a bottle <ArrowUpRight aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="home-menu"
            aria-expanded={mobileMenuOpen}
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="home-nav__mobile"
            aria-label="Mobile navigation"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem' }}>
              <WalletConnectButton />
              <ThemeToggle />
            </div>
            <a href="#blockchain" onClick={() => setMobileMenuOpen(false)}>Guarantees</a>
            <a href="#journey" onClick={() => setMobileMenuOpen(false)}>The journey</a>
            <a href="#proof" onClick={() => setMobileMenuOpen(false)}>The proof</a>
            <Link href="/marketplace" onClick={() => { switchRole('processor'); setMobileMenuOpen(false); }}>Marketplace</Link>
            <Link href="/verify/HC-BTL-000184" onClick={() => { switchRole('consumer'); setMobileMenuOpen(false); }}>Trace a bottle</Link>
          </motion.nav>
        )}
      </header>

      <section className="home-hero home-hero--centered" aria-labelledby="hero-title">
        <motion.div className="home-hero__copy" style={{ y: heroY }}>
          <motion.p
            className="home-eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <span /> Decentralized Honey Provenance Protocol <span />
          </motion.p>
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            Know where every <em>drop</em> began.
          </motion.h1>
          <motion.p
            className="home-hero__lede"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
          >
            HoneyChain anchors every jar onto immutable smart contracts—from IoT beehive telemetries and multi-signature cold chain custody to dual NABL lab dockets and NFC cryptographic tap verification.
          </motion.p>
          <motion.div
            className="home-hero__actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: 'easeOut' }}
          >
            <Link href="/verify/HC-BTL-000184" className="button button--amber" onClick={() => switchRole('consumer')}>
              <ScanLine aria-hidden="true" /> Trace a bottle
            </Link>
            <a href="#blockchain" className="button button--ghost">
              <Blocks size={15} aria-hidden="true" /> Explore Blockchain
            </a>
            <a href="#layers" className="text-link">See bottle layers <MoveRight aria-hidden="true" /></a>
          </motion.div>
        </motion.div>

        <motion.div className="home-hero__object" style={{ y: sceneY }}>
          <HoneyDropScene />
          <div className="home-hero__caption">
            <span className="home-hero__caption-dot" />
            <span>One real bottle, anchored on Polygon Mainnet.</span>
          </div>
        </motion.div>

        <a className="home-scroll-cue" href="#layers">
          <span>Scroll to uncover the proof</span><ArrowDown aria-hidden="true" />
        </a>
      </section>

      <section className="home-manifest" aria-label="HoneyChain promise">
        <p>We do not ask people to trust a label.</p>
        <p>We anchor honey provenance on <em>immutable smart contracts.</em></p>
      </section>

      <BottleScrollStory />

      <BlockchainProtocolShowcase />

      <section className="journey-section" id="journey" ref={journeyRef} aria-labelledby="journey-title">
        <div className="journey-section__heading">
          <p className="home-eyebrow"><span /> The journey of one drop</p>
          <h2 id="journey-title">Five moments.<br /><em>Nothing hidden.</em></h2>
          <p>Each stage leaves behind a proof object you can inspect. Follow the amber thread to see what a bottle can actually tell you.</p>
        </div>

        <div className="journey-rail" aria-hidden="true">
          <div className="journey-rail__track" />
          <motion.div className="journey-rail__progress" style={{ scaleY: evidenceScale }} />
        </div>

        <div className="journey-list">
          {journey.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <motion.article
                key={stage.number}
                className={`journey-card journey-card--${index + 1}`}
                initial={reduceMotion ? false : { opacity: 0, y: 42 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.65, delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.22), ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="journey-card__number">{stage.number}</div>
                <div className="journey-card__icon"><Icon aria-hidden="true" /></div>
                <p className="journey-card__eyebrow">{stage.eyebrow}</p>
                <h3>{stage.title}</h3>
                <p className="journey-card__copy">{stage.copy}</p>
                <div className="journey-card__evidence">
                  <span><Check aria-hidden="true" /></span>
                  <div><strong>{stage.evidence}</strong><small>{stage.note}</small></div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="proof-section" id="proof" aria-labelledby="proof-title">
        <div className="proof-section__count" aria-hidden="true">12</div>
        <div className="proof-section__copy">
          <p className="home-eyebrow home-eyebrow--light"><span /> A quieter kind of confidence</p>
          <h2 id="proof-title">Twelve checks.<br /><em>One bottle.</em></h2>
          <p>HoneyChain keeps the proof close to the product: field data, custody records, lab reports and a secure bottle seal.</p>
          <Link href="/verify/HC-BTL-000184" className="button button--paper" onClick={() => switchRole('consumer')}>
            Open a bottle passport <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className="proof-stamps">
          <div className="proof-stamp proof-stamp--round"><ShieldCheck aria-hidden="true" /><span>Origin<br />logged</span></div>
          <div className="proof-stamp"><FlaskConical aria-hidden="true" /><span>Dual lab<br />checked</span></div>
          <div className="proof-stamp proof-stamp--round"><Fingerprint aria-hidden="true" /><span>Seal<br />verified</span></div>
        </div>
      </section>

      <section className="workspace-section" aria-labelledby="workspace-title">
        <div className="workspace-section__heading">
          <p className="home-eyebrow"><span /> Built for the people in the chain</p>
          <h2 id="workspace-title">Same story.<br /><em>A different working view.</em></h2>
        </div>
        <div className="workspace-grid">
          {workspaces.map((space, index) => (
            <motion.button
              key={space.role}
              type="button"
              className={`workspace-card workspace-card--${space.accent}`}
              onClick={() => launch(space.role, space.path)}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="workspace-card__index">0{index + 1}</span>
              <span className="workspace-card__label">{space.label}</span>
              <span className="workspace-card__title">{space.title}</span>
              <span className="workspace-card__detail">{space.detail}</span>
              <span className="workspace-card__arrow"><ArrowUpRight aria-hidden="true" /></span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="passport-callout" aria-labelledby="passport-title">
        <div className="passport-callout__serial">HC / BTL / 000184</div>
        <div>
          <p className="home-eyebrow"><span /> Have a jar in front of you?</p>
          <h2 id="passport-title">Its story is already<br /><em>waiting to be read.</em></h2>
        </div>
        <Link href="/verify" className="button button--ink" onClick={() => switchRole('consumer')}>
          Verify a HoneyChain jar <ArrowUpRight aria-hidden="true" />
        </Link>
      </section>

      <footer className="home-footer">
        <Link href="/" className="home-brand"><span className="home-brand__mark"><Hexagon aria-hidden="true" /></span><span>HoneyChain</span></Link>
        <p>Every drop has a beginning. We make it visible.</p>
        <div><span>SIH 26021</span><span>© 2026 HoneyChain</span></div>
      </footer>
    </main>
  );
}
