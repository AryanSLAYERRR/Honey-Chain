'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { mockBottles } from '@/lib/mock-data';
import { honeyApi } from '@/lib/api';
import HoneyDropScene from '@/components/experience/HoneyDropScene';
import HiveEvidencePanel from '@/components/evidence/HiveEvidencePanel';
import {
  ArrowDown, ArrowLeft, AudioLines, Check, ChevronDown, CircleCheck, CircleX, FlaskConical,
  FileDown, Fingerprint, Hexagon, Link2, MapPin, Route,
  ShieldAlert, ShieldCheck, Sprout,
} from 'lucide-react';
import { ThemeToggle } from '@/lib/theme-context';
import type { BottleLineage } from '@/lib/types';

type DetailKey = 'origin' | 'hiveEvidence' | 'lab' | 'route' | 'seal' | 'ledger';

function PassportSection({
  index, title, subtitle, icon: Icon, open, onToggle, children,
}: {
  index: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`passport-section ${open ? 'passport-section--open' : ''}`}>
      <button type="button" className="passport-section__summary" onClick={onToggle} aria-expanded={open}>
        <span className="passport-section__index">{index}</span>
        <span className="passport-section__icon"><Icon aria-hidden="true" /></span>
        <span className="passport-section__title"><strong>{title}</strong><small>{subtitle}</small></span>
        <ChevronDown className="passport-section__chevron" aria-hidden="true" />
      </button>
      {open && <div className="passport-section__body">{children}</div>}
    </section>
  );
}

function DataLine({ label, value, tone = '' }: { label: string; value: React.ReactNode; tone?: string }) {
  return <div className="passport-data-line"><span>{label}</span><strong className={tone}>{value}</strong></div>;
}

function PassportNotFound({ id }: { id: string }) {
  return (
    <main className="passport-shell passport-not-found">
      <Link href="/verify" className="passport-back"><ArrowLeft aria-hidden="true" /> Back to bottle verification</Link>
      <div>
        <span className="passport-not-found__icon"><ShieldAlert aria-hidden="true" /></span>
        <p className="home-eyebrow"><span /> No passport found</p>
        <h1>We could not find<br /><em>that bottle.</em></h1>
        <p>There is no HoneyChain record for <code>{id}</code>. Check the printed ID underneath the seal, then try again.</p>
        <Link href="/verify" className="button button--ink">Try another bottle</Link>
      </div>
    </main>
  );
}

function TamperAlert({ bottle }: { bottle: typeof mockBottles[number] }) {
  const { lineage } = bottle;
  const locations = [lineage.nfc.firstScanLocation, lineage.nfc.lastScanLocation].filter(Boolean).join(' and ');
  return (
    <main className="tamper-passport" role="alert" aria-live="assertive">
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div className="tamper-passport__mark"><ShieldAlert aria-hidden="true" /></div>
      <p>HoneyChain security warning / {bottle.id}</p>
      <h1>STOP — this bottle<br />may be <em>tampered with.</em></h1>
      <div className="tamper-passport__reason">
        <span>01</span>
        <div>
          <strong>Do not consume or resell this bottle.</strong>
          <p>The physical bottle and the secure HoneyChain cryptographic record no longer agree. This lot has been quarantined.</p>
        </div>
      </div>
      <ul>
        {!lineage.nfc.isAuthentic && <li>NFC cryptogram mismatch: Tag failed cryptographic challenge-response (<code>{lineage.nfc.cryptogram}</code>).</li>}
        {!lineage.bottle.sealIntact && <li>Physical seal breach: Factory induction seal was reported broken or disturbed.</li>}
        <li><strong>{lineage.nfc.scanCount} separate scans registered</strong> across distant geographic locations ({locations || 'Delhi, NCR and Mumbai, Maharashtra'}).</li>
      </ul>
      <div className="tamper-passport__actions">
        <Link href="/verify" className="button button--paper">Verify another bottle</Link>
        <a href="#diagnostic-record" className="tamper-passport__text-link">View in-depth diagnostic record ↓</a>
      </div>

      <section id="diagnostic-record" className="tamper-diagnostics" aria-label="Tamper diagnostic record">
        <p>Forensic Diagnostic Record · File #HC-SEC-00481</p>
        <h2>Why this bottle was stopped & quarantined.</h2>

        <div className="tamper-diagnostics__row">
          <span>Cryptographic status</span>
          <strong className="is-alert">FAILED — {lineage.nfc.cryptogram}</strong>
        </div>
        <div className="tamper-diagnostics__row">
          <span>Physical cap & membrane</span>
          <strong className="is-alert">{lineage.bottle.sealIntact ? 'Intact' : 'BROKEN / COMPROMISED'}</strong>
        </div>
        <div className="tamper-diagnostics__row">
          <span>Silicon hardware scan counter</span>
          <strong className="is-alert">{lineage.nfc.scanCount} scan events registered (Max allowable: 1)</strong>
        </div>
        <div className="tamper-diagnostics__row">
          <span>First recorded scan</span>
          <strong>Delhi, NCR · 03 Sep 2026, 10:00 IST</strong>
        </div>
        <div className="tamper-diagnostics__row">
          <span>Latest recorded scan</span>
          <strong className="is-alert">Mumbai, Maharashtra · 06 Sep 2026, 12:45 IST</strong>
        </div>

        <div className="tamper-diagnostics__analysis">
          <h3>Why is 4 scans wrong? (Supply Chain Anti-Counterfeiting Analysis)</h3>

          <div className="tamper-analysis__card">
            <h4>1. The 1-Scan Verification Principle</h4>
            <p>
              In HoneyChain’s custody architecture (as detailed in <em>context.txt</em>), logistical handoffs from Apiary to Transporter to Processing Plant are recorded and cryptographically signed at the <strong>drum and batch level</strong> using custody smart contracts. The consumer bottle tag is provisioned with a secure NXP NTAG 424 DNA element designed specifically for <strong>first-time consumer unboxing</strong>. An authentic bottle should only ever register <strong>1 valid verification scan</strong> upon purchase.
            </p>
          </div>

          <div className="tamper-analysis__card">
            <h4>2. Physical Impossibility &amp; Geographic Cloning</h4>
            <p>
              A genuine physical jar of honey cannot be scanned in <strong>Delhi, NCR</strong> and then scanned again 1,400 km away in <strong>Mumbai, Maharashtra</strong> within 72 hours on a different consumer device. A hardware counter reading of <strong>4 scans</strong> across divergent locations is definitive cryptographic evidence of a <strong>cloning or tag replay attack</strong>: unauthorized third parties copied or emulated the tag identifier onto counterfeit bottles to deceive buyers in secondary markets.
            </p>
          </div>

          <div className="tamper-analysis__card">
            <h4>3. Jar Refill &amp; Seal Tampering Fraud</h4>
            <p>
              Adulteration syndicates frequently harvest discarded genuine packaging, refill empty jars with low-grade corn or inverted sugar syrup (violating FSSAI / NABL purity standards), and reseal them with counterfeit caps. Because the NXP NTAG 424 DNA silicon hardware counter is burned into hardware and increments automatically upon each radio frequency excitation, repeated scan attempts reveal that the bottle has been recycled or compromised.
            </p>
          </div>

          <div className="tamper-analysis__card">
            <h4>4. Smart Contract Enforcement &amp; Escrow Protection</h4>
            <p>
              Under HoneyChain’s smart contract rule engine (<code>ProcessingRegistry.sol</code> &amp; <code>Escrow.sol</code>), any bottle presenting a failed cryptogram or scan count exceeding the verification threshold is automatically flagged as revoked (<code>isRevoked = true</code>). This immediately activates dispute protocols, freezes remaining farmer/processor escrow reserves for lot PB-00481, and protects consumer trust by preventing compromised stock from circulating.
            </p>
          </div>

          <div className="tamper-analysis__advisory">
            <strong>Consumer Safety Advisory:</strong>
            Do not ingest this honey. Please return this unit to the point of purchase or submit this bottle ID (<code>{bottle.id}</code>) to HoneyChain Security at <code>compliance@honeychain.in</code>.
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthenticPassView({ bottle, onExploreDetails }: { bottle: typeof mockBottles[number]; onExploreDetails: () => void }) {
  const { lineage } = bottle;
  const source = lineage.sources[0];
  return (
    <section className="authentic-passport" role="region" aria-label="Verified Authentic Bottle Certificate">
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div className="authentic-passport__mark">
        <ShieldCheck aria-hidden="true" />
      </div>
      <p>HoneyChain verification certificate / {bottle.id}</p>
      <h1>AUTHENTIC — this bottle is<br /><em>safe to consume.</em></h1>

      <div className="authentic-passport__verdict">
        <span>01</span>
        <div>
          <strong>Genuine, unadulterated honey confirmed.</strong>
          <p>The physical NFC seal, laboratory purity test, and cryptographic custody chain are fully validated. This {source?.floralSource || 'Wildflower'} honey can be traced directly from {source?.farmName || 'its origin apiary'} to your table.</p>
        </div>
      </div>

      <div className="authentic-passport__pillars">
        <div className="authentic-pillar">
          <div className="authentic-pillar__icon"><CircleCheck aria-hidden="true" /></div>
          <div>
            <strong>1st Verified Scan</strong>
            <p>Single device unboxing. Silicon counter = 1. No tag duplication, cloning, or replay detected.</p>
          </div>
        </div>
        <div className="authentic-pillar">
          <div className="authentic-pillar__icon"><Fingerprint aria-hidden="true" /></div>
          <div>
            <strong>NFC Cryptogram Validated</strong>
            <p>NTAG 424 DNA AES-128 cryptographic challenge-response matches on-chain registry key.</p>
          </div>
        </div>
        <div className="authentic-pillar">
          <div className="authentic-pillar__icon"><ShieldCheck aria-hidden="true" /></div>
          <div>
            <strong>Induction Seal Intact</strong>
            <p>Factory tamper-evident membrane and metallic cap seal verified unbroken upon receipt.</p>
          </div>
        </div>
        <div className="authentic-pillar">
          <div className="authentic-pillar__icon"><FlaskConical aria-hidden="true" /></div>
          <div>
            <strong>{lineage.postProcessingLab.purity}% Laboratory Purity</strong>
            <p>Tested negative for C4 sugars, moisture {lineage.postProcessingLab.moisture}% (passed NABL certified lab check).</p>
          </div>
        </div>
      </div>

      <div className="authentic-passport__actions">
        <button type="button" onClick={onExploreDetails} className="button button--amber">
          Look for more details <ArrowDown aria-hidden="true" />
        </button>
        <Link href="/verify" className="authentic-passport__text-link">
          Verify another bottle
        </Link>
      </div>
    </section>
  );
}

export default function VerifyBottlePage({ params }: { params: Promise<{ bottleId: string }> }) {
  const { bottleId } = use(params);
  const bottle = mockBottles.find((item) => item.id === bottleId);
  const [open, setOpen] = useState<Record<DetailKey, boolean>>({ origin: false, hiveEvidence: false, lab: false, route: false, seal: false, ledger: false });

  useEffect(() => { if (bottleId) honeyApi.verifyBottle(bottleId).catch(() => undefined); }, [bottleId]);

  if (!bottle) return <PassportNotFound id={bottleId} />;

  const lineage = bottle.lineage;
  const authenticated = lineage.nfc.isAuthentic && lineage.bottle.sealIntact;
  const source = lineage.sources[0];
  const toggle = (key: DetailKey) => setOpen((current) => ({ ...current, [key]: !current[key] }));

  const handleExploreDetails = () => {
    const el = document.getElementById('bottle-dossier');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!authenticated) return <TamperAlert bottle={bottle} />;

  return (
    <>
      {/* 1. Full-impact Authentic Status Certificate */}
      <AuthenticPassView bottle={bottle} onExploreDetails={handleExploreDetails} />

      {/* 2. Detailed dossier containing all evidence, telemetry, labs, and blockchain records */}
      <main id="bottle-dossier" className="passport-shell passport-shell--valid">
        <header className="passport-nav">
          <Link href="/verify" className="passport-back"><ArrowLeft aria-hidden="true" /> Verify another bottle</Link>
          <Link href="/" className="home-brand"><span className="home-brand__mark"><Hexagon aria-hidden="true" /></span><span>HoneyChain</span></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <span className="passport-nav__status">
              <CircleCheck aria-hidden="true" /> Seal verified
            </span>
          </div>
        </header>

        <section className="passport-hero">
          <div className="passport-hero__scene"><HoneyDropScene /></div>
          <div className="passport-hero__copy">
            <p className="home-eyebrow"><span /> Bottle passport / verified</p>
            <h1>This jar has<br />a <em>clear story.</em></h1>
            <p className="passport-hero__lede">
              The NFC tag, physical seal and its linked records agree. This {source?.floralSource || 'honey'} honey can be traced from {source?.farmName || 'its apiary'} to your hand.
            </p>
            <div className="passport-hero__verdict">
              <ShieldCheck aria-hidden="true" />
              <span><strong>Authentic HoneyChain bottle</strong><small>First secure scan · seal intact · record linked</small></span>
            </div>
          </div>
        </section>

        <section className="passport-label" aria-label="Bottle summary">
          <div className="passport-label__top"><span>HONEYCHAIN / BOTTLE PASSPORT</span><span>{bottle.id}</span></div>
          <div className="passport-label__main"><div><span>FLORAL SOURCE</span><strong>{source?.floralSource || 'Wildflower'}</strong></div><div><span>NET WEIGHT</span><strong>{lineage.packaging.netWeight}g</strong></div><div><span>LOT</span><strong>{lineage.lot.id}</strong></div><div><span>BOTTLED</span><strong>{new Date(lineage.lot.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div></div>
          <div className="passport-label__bottom"><span>SEAL ID / {bottle.sealId}</span><span>BEST BEFORE / {lineage.packaging.expiryDate.split(' (')[0]}</span></div>
        </section>

      <section className="passport-thread" aria-labelledby="journey-heading">
        <div className="passport-thread__heading"><p className="home-eyebrow"><span /> A short route with a long memory</p><h2 id="journey-heading">Follow this<br /><em>one jar.</em></h2></div>
        <div className="passport-thread__steps">
          <article><span>01</span><Sprout aria-hidden="true" /><strong>Apiary</strong><small>{source?.farmLocation || 'Origin recorded'}</small></article>
          <article><span>02</span><Route aria-hidden="true" /><strong>Custody</strong><small>{lineage.transport.distanceKm} km logged</small></article>
          <article><span>03</span><FlaskConical aria-hidden="true" /><strong>Laboratory</strong><small>{lineage.postProcessingLab.purity}% purity</small></article>
          <article><span>04</span><Fingerprint aria-hidden="true" /><strong>Seal</strong><small>{authenticated ? 'NFC checked' : 'Needs review'}</small></article>
        </div>
      </section>

      <section id="diagnostic-record" className="passport-details" aria-label="Detailed bottle records">
        <PassportSection index="01" title="Where this honey began" subtitle={`${lineage.sources.length} source record${lineage.sources.length === 1 ? '' : 's'} · ${lineage.lot.totalWeight} kg lot`} icon={MapPin} open={open.origin} onToggle={() => toggle('origin')}>
          <div className="passport-origin">
            <div className="passport-origin__map"><span className="passport-origin__pin" /><span>{source?.farmCoordinates.lat.toFixed(4)}° N · {source?.farmCoordinates.lng.toFixed(4)}° E</span></div>
            {lineage.sources.map((farm) => <div key={farm.drumId} className="passport-origin__farm"><div><p>{farm.farmName}</p><small>{farm.farmLocation} · {farm.hiveName}</small></div><span>{farm.floralSource}</span><div className="passport-origin__farm-meta"><span>Harvested {new Date(farm.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><span>Hive health {farm.hiveHealth.healthScore}%</span><span>Moisture {farm.iotSnapshot.moistureContent}%</span></div></div>)}
          </div>
        </PassportSection>

        <PassportSection index="02" title="Hive telemetry & harvest evidence" subtitle="Temperature, humidity, acoustics, harvest weight and camera records" icon={AudioLines} open={open.hiveEvidence} onToggle={() => toggle('hiveEvidence')}>
          <HiveEvidencePanel sources={lineage.sources} />
        </PassportSection>

        <PassportSection index="03" title="What the laboratory found" subtitle={`${lineage.preProcessingLab.labName} · pre & post-processing reports`} icon={FlaskConical} open={open.lab} onToggle={() => toggle('lab')}>
          <div className="passport-labs">
            <LabDocket title="Before processing" report={lineage.preProcessingLab} />
            <LabDocket title="Before bottling" report={lineage.postProcessingLab} />
          </div>
        </PassportSection>

        <PassportSection index="04" title="How the lot travelled" subtitle={`${lineage.transport.distanceKm} km · ${lineage.transport.checkpoints.length} documented checkpoints`} icon={Route} open={open.route} onToggle={() => toggle('route')}>
          <div className="passport-route"><div className="passport-route__summary"><div><span>From</span><strong>{source?.farmLocation}</strong></div><span className="passport-route__line" /><div><span>To</span><strong>{lineage.lot.processorAddress}</strong></div></div><div className="passport-route__checks">{lineage.transport.checkpoints.map((checkpoint, index) => <div key={`${checkpoint.timestamp}-${index}`}><span className={checkpoint.sealIntact ? '' : 'is-alert'}>{checkpoint.sealIntact ? <Check aria-hidden="true" /> : <CircleX aria-hidden="true" />}</span><p><strong>{new Date(checkpoint.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong><small>{checkpoint.temperature}°C · seal {checkpoint.sealIntact ? 'intact' : 'flagged'} · {checkpoint.gps.lat.toFixed(3)}, {checkpoint.gps.lng.toFixed(3)}</small>{checkpoint.note && <em>“{checkpoint.note}”</em>}</p></div>)}</div></div>
        </PassportSection>

        <PassportSection index="05" title="The seal on this bottle" subtitle={`${lineage.nfc.tagType} · ${lineage.nfc.manufacturer}`} icon={Fingerprint} open={open.seal} onToggle={() => toggle('seal')}>
          <div className="passport-seal"><div className="passport-seal__stamp">{authenticated ? <ShieldCheck aria-hidden="true" /> : <ShieldAlert aria-hidden="true" />}<span>{authenticated ? 'seal<br />intact' : 'review<br />required'}</span></div><div><DataLine label="Tag" value={lineage.nfc.tagId} /><DataLine label="Physical scan" value={lineage.nfc.scanCount === 1 ? 'First verified scan' : `${lineage.nfc.scanCount} scans registered`} tone={lineage.nfc.scanCount === 1 ? 'is-good' : 'is-alert'} /><DataLine label="Signature" value={lineage.nfc.isAuthentic ? 'Cryptogram matched' : 'Cryptogram did not match'} tone={lineage.nfc.isAuthentic ? 'is-good' : 'is-alert'} /><DataLine label="Embed location" value={lineage.packaging.nfcEmbedLocation} /></div></div>
        </PassportSection>

        <PassportSection index="06" title="The permanent record" subtitle={`${lineage.blockchain.network} · ${lineage.blockchain.allTransactions.length} signed events`} icon={Link2} open={open.ledger} onToggle={() => toggle('ledger')}>
          <div className="passport-ledger"><p>HoneyChain records a digest of each evidence event. The readable history stays here; the signed trail makes it durable.</p>{lineage.blockchain.allTransactions.map((transaction, index) => <div key={`${transaction.txHash}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{transaction.step}</strong><small>Block {transaction.blockNumber.toLocaleString()} · {new Date(transaction.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small><code>{transaction.txHash.substring(0, 17)}…{transaction.txHash.slice(-6)}</code></div></div>)}</div>
        </PassportSection>
      </section>

      <section className="passport-qr"><div><p className="home-eyebrow"><span /> Share this passport</p><h2>One jar.<br /><em>One record.</em></h2><p>Scan this code from another device to return to this exact bottle record.</p></div><div className="passport-qr__code"><QRCodeSVG value={`https://honeychain.in/verify/${bottle.id}`} size={124} /><span>{bottle.id}</span></div></section>
      <footer className="passport-footer"><Link href="/">HoneyChain</Link><span>Every drop has a beginning. We make it visible.</span><span>SIH 26021</span></footer>
    </main>
    </>
  );
}

function LabDocket({ title, report }: { title: string; report: BottleLineage['preProcessingLab'] }) {
  const values = [
    ['Purity', `${report.purity}%`, report.purity >= 95], ['Moisture', `${report.moisture}%`, report.moisture <= 20],
    ['HMF', `${report.hmf} mg/kg`, report.hmf <= 40], ['Sucrose', `${report.sucrose}%`, report.sucrose <= 5],
  ];
  const pdf = title === 'Before processing' ? '/reports/LAB-PRE-00481-original.pdf' : '/reports/LAB-POST-00481-original.pdf';
  return <article className="lab-docket"><div className="lab-docket__head"><span>{title}</span><b>{report.passed ? 'Passed' : 'Flagged'}</b></div><div className="lab-docket__grid">{values.map(([label, value, good]) => <div key={String(label)}><span>{label}</span><strong className={good ? 'is-good' : 'is-alert'}>{value}</strong></div>)}</div><p>{report.labName} · Certificate {report.labCertNumber}</p><a href={pdf} target="_blank" rel="noreferrer" className="lab-docket__pdf"><FileDown /> Open original laboratory PDF</a></article>;
}
