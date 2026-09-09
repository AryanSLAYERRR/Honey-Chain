'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockBottles } from '@/lib/mock-data';
import {
  ArrowUpRight, Camera, ChevronRight, CircleCheck, Fingerprint,
  Hexagon, ScanLine, Search, ShieldCheck, X,
} from 'lucide-react';

export default function VerifyLandingPage() {
  const router = useRouter();
  const [manualId, setManualId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleManualVerify = () => {
    const trimmed = manualId.trim();
    setError('');
    if (!trimmed) {
      setError('Enter the bottle ID printed beneath the seal.');
      return;
    }
    const bottle = mockBottles.find((item) => item.id.toLowerCase() === trimmed.toLowerCase());
    if (bottle) {
      router.push(`/verify/${bottle.id}`);
      return;
    }
    setError(`We could not find “${trimmed}”. Try HC-BTL-000184.`);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!showScanner || !video) return;
    let stream: MediaStream | undefined;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((result) => {
        stream = result;
        video.srcObject = result;
        return video.play();
      })
      .catch(() => {
        setError('Camera access was not available. Enter the bottle ID instead.');
        setShowScanner(false);
      });
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [showScanner]);

  return (
    <main className="verify-entry">
      <header className="verify-entry__nav">
        <Link href="/" className="home-brand" aria-label="HoneyChain home">
          <span className="home-brand__mark"><Hexagon aria-hidden="true" /></span><span>HoneyChain</span>
        </Link>
        <span className="verify-entry__nav-label"><ShieldCheck aria-hidden="true" /> Bottle passport</span>
      </header>

      <section className="verify-entry__hero">
        <div className="verify-entry__copy">
          <p className="home-eyebrow"><span /> Your jar has a history</p>
          <h1>Read the story<br />behind your <em>honey.</em></h1>
          <p>Scan the seal or enter the printed bottle ID to see the apiary, journey and test records that belong to this jar.</p>
          <div className="verify-entry__trust"><CircleCheck aria-hidden="true" /> The passport only opens when the physical seal checks out.</div>
        </div>

        <div className="verify-entry__ticket">
          <div className="verify-entry__ticket-top"><span>HONEYCHAIN / VERIFY</span><span>01</span></div>
          <p className="verify-entry__ticket-label">Bottle passport</p>
          <h2>Find your<br /><em>jar.</em></h2>
          <form onSubmit={(event) => { event.preventDefault(); handleManualVerify(); }}>
            <label htmlFor="bottle-id">Bottle ID</label>
            <div className="verify-entry__field">
              <Search aria-hidden="true" />
              <input id="bottle-id" value={manualId} onChange={(event) => setManualId(event.target.value)} placeholder="HC-BTL-000184" autoCapitalize="characters" />
            </div>
            {error && <p className="verify-entry__error" role="alert">{error}</p>}
            <button type="submit" className="button button--ink">Open passport <ArrowUpRight aria-hidden="true" /></button>
          </form>
          <div className="verify-entry__ticket-bottom"><span>SEAL / NFC / RECORDS</span><span>INDIA</span></div>
        </div>
      </section>

      <section className="verify-entry__methods" aria-label="Ways to verify a bottle">
        <button type="button" className="verify-method verify-method--scan" onClick={() => { setError(''); setShowScanner(true); }}>
          <span className="verify-method__icon"><Camera aria-hidden="true" /></span>
          <span><strong>Scan the QR seal</strong><small>Use the camera on this device</small></span>
          <ChevronRight aria-hidden="true" />
        </button>
        <Link className="verify-method" href="/verify/HC-BTL-000184">
          <span className="verify-method__icon"><Fingerprint aria-hidden="true" /></span>
          <span><strong>Try a sample passport</strong><small>Open a verified Wildflower jar</small></span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <div className="verify-entry__method-note"><ScanLine aria-hidden="true" /><span>Each scan checks the tag, the bottle seal and the record linked to it.</span></div>
      </section>

      <section className="verify-entry__steps">
        <p className="home-eyebrow"><span /> What you will see</p>
        <div>
          <article><span>01</span><h2>Where it began</h2><p>The farm, floral source and harvest record behind the honey.</p></article>
          <article><span>02</span><h2>What checked out</h2><p>Custody events, lab reports and the proof made along the way.</p></article>
          <article><span>03</span><h2>What is in your hand</h2><p>The bottle seal, packaging record and its unique NFC signature.</p></article>
        </div>
      </section>

      {showScanner && (
        <div className="verify-scanner" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
          <button type="button" className="verify-scanner__backdrop" aria-label="Close scanner" onClick={() => setShowScanner(false)} />
          <div className="verify-scanner__dialog">
            <div className="verify-scanner__header"><div><p className="home-eyebrow"><span /> Camera</p><h2 id="scanner-title">Scan the QR seal</h2></div><button type="button" onClick={() => setShowScanner(false)} aria-label="Close scanner"><X /></button></div>
            <div className="verify-scanner__video"><video ref={videoRef} playsInline muted /><div className="verify-scanner__frame"><i /><i /><i /><i /></div></div>
            <p>Hold the QR seal inside the frame. If camera access is unavailable, enter the bottle ID above.</p>
            <button type="button" className="verify-scanner__demo" onClick={() => { setShowScanner(false); router.push('/verify/HC-BTL-000184'); }}><ScanLine /> Demo-scan a verified seal</button>
          </div>
        </div>
      )}

      <footer className="verify-entry__footer"><span>HoneyChain · Every drop has a beginning.</span><span>SIH 26021</span></footer>
    </main>
  );
}
