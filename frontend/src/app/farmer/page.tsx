'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, AudioLines, CalendarDays, CheckCircle2, ChevronRight,
  CircleAlert, Droplets, Eye, Factory, Globe2, Leaf, Lock, Phone,
  Plus, Scale, ShieldCheck, Sparkles, Thermometer, Volume2, IndianRupee, Settings
} from 'lucide-react';
import { mockBatches, mockFarmerStats, mockHives, mockIoTReadings } from '@/lib/mock-data';
import type { Language } from '@/lib/translations';
import PaymentConfigModal, { getFarmerPaymentConfig, FarmerPaymentConfig } from '@/components/farmer/PaymentConfigModal';

function formatBatchStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export default function FarmerDashboard() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<FarmerPaymentConfig | null>(null);

  useEffect(() => {
    setPaymentConfig(getFarmerPaymentConfig());
    const handleUpdate = () => setPaymentConfig(getFarmerPaymentConfig());
    window.addEventListener('farmer_payment_config_updated', handleUpdate);
    return () => window.removeEventListener('farmer_payment_config_updated', handleUpdate);
  }, []);

  const latestReading = mockIoTReadings.at(-1);
  const alertHives = mockHives.filter((hive) => hive.diseaseRisk !== 'low');
  const recentBatches = [...mockBatches].sort((a, b) => b.harvestDate.localeCompare(a.harvestDate)).slice(0, 3);
  const isHindi = lang === 'hi';

  const toggleLanguage = () => {
    const next = isHindi ? 'en' : 'hi';
    setLang(next);
    try {
      localStorage.setItem('farmer_lang', next);
    } catch { }
  };

  const playFieldNote = () => {
    setAudioPlaying(true);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(() => setAudioPlaying(false), 1200);
      return;
    }
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(
      isHindi
        ? 'शर्मा एपियरी में आज का मौसम शहद निकालने के लिए अनुकूल है। 24 में से 22 बक्से पूरी तरह स्वस्थ हैं। सरसों के बक्सों की कटाई शुरू की जा सकती है।'
        : 'Today at Sharma Apiary, 22 of 24 colonies are in prime health. Mustard foraging is peaking. Conditions are ideal for extraction.'
    );
    voice.lang = isHindi ? 'hi-IN' : 'en-IN';
    voice.onend = () => setAudioPlaying(false);
    voice.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(voice);
  };

  return (
    <div className="fieldbook animate-fadeUp">
      {/* Top Header with Dual-Mode Ergonomic Switcher & Language */}
      <header className="fieldbook__header">
        <div>
          <p className="fieldbook__eyebrow">Sharma Apiary · Phagwara, Punjab · GPS 31.22° N, 75.77° E</p>
          <h1>
            {isHindi ? (
              <>आज का<br /><em>एपियरी नोटबुक।</em></>
            ) : (
              <>Today at the<br /><em>apiary.</em></>
            )}
          </h1>
          <p>
            {isHindi
              ? 'कटाई, बक्से और ब्लॉकचेन प्रमाण को एक आरामदायक व सरल फील्ड रिकॉर्ड में रखें।'
              : 'Keep harvests, colonies and cryptographic escrow proof together in one comfortable field record.'}
          </p>
        </div>

        <div className="farmer-header-controls">
          {/* Dual-Mode Ergonomic Toggle */}
          <div className="farmer-view-toggle" role="group" aria-label="Dashboard view mode">
            <button
              type="button"
              className={viewMode === 'simple' ? 'active' : ''}
              onClick={() => setViewMode('simple')}
              title="Comfort mode: Big touch buttons, plain language, no sensory overload"
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>{isHindi ? 'सरल दृश्य' : 'Comfort View'}</span>
            </button>
            <button
              type="button"
              className={viewMode === 'detailed' ? 'active' : ''}
              onClick={() => setViewMode('detailed')}
              title="Detailed mode: Complete IoT telemetry, sensor charts & smart contract custody"
            >
              <Eye size={14} aria-hidden="true" />
              <span>{isHindi ? 'विस्तृत दृश्य' : 'Detailed Telemetry'}</span>
            </button>
          </div>

          <button type="button" onClick={toggleLanguage} className="tab-btn">
            <Globe2 size={15} aria-hidden="true" />
            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Farmer Payout Configuration Trigger */}
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="tab-btn"
            title="Configure your payout preference: Direct INR (UPI / Bank) or Web3 Crypto"
            style={{
              borderColor: paymentConfig?.mode === 'inr' ? '#10b981' : '#fbb638',
              background: paymentConfig?.mode === 'inr' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(251, 182, 56, 0.12)',
            }}
          >
            {paymentConfig?.mode === 'inr' ? <IndianRupee size={15} color="#10b981" /> : <Settings size={15} color="#fbb638" />}
            <span style={{ fontWeight: 600 }}>
              {isHindi
                ? (paymentConfig?.mode === 'inr' ? 'भुगतान: UPI (₹)' : 'भुगतान: क्रिप्टो')
                : (paymentConfig?.mode === 'inr' ? 'Payout: Direct INR' : 'Payout: Crypto')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/farmer/batches?create=true')}
            className="fieldbook__primary"
          >
            <Plus size={15} aria-hidden="true" />
            <span>{isHindi ? 'नई कटाई' : 'New harvest'}</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          VIEW 1: SIMPLE COMFORT MODE (Ergonomic, calm, big touch targets)
          ========================================================================= */}
      {viewMode === 'simple' && (
        <div className="farmer-simple-mode">
          {/* Welcoming status banner with 1-click audio advice */}
          <section className="farmer-hero-banner">
            <div className="farmer-hero-banner__text">
              <span className="evidence-kicker">{isHindi ? 'दैनिक सारांश' : 'Daily Apiary Health'}</span>
              <h2>{isHindi ? <>सभी बक्से <em>स्वस्थ व सक्रिय हैं।</em></> : <>All 24 colonies <em>calm and active.</em></>}</h2>
              <p>
                {isHindi
                  ? 'मौसम शहद निष्कर्षण के लिए अनुकूल है। सरसों का पराग भरपूर आ रहा है और आर्द्रता 58% पर स्थिर है।'
                  : 'Weather is optimal for extraction. Mustard pollen intake is high and brood nest temperature is stable at 34.2°C.'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end' }}>
              <div className="farmer-hero-banner__status">
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{isHindi ? '22 / 24 बक्से उत्तम स्थिति में' : '22 / 24 Colonies Prime'}</span>
              </div>
              <button
                type="button"
                onClick={playFieldNote}
                className={`tab-btn ${audioPlaying ? 'is-selected' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Volume2 size={15} aria-hidden="true" />
                <span>{audioPlaying ? (isHindi ? 'चल रहा है...' : 'Speaking...') : (isHindi ? 'आवाज में सुनें' : 'Listen in Audio')}</span>
              </button>
            </div>
          </section>

          {/* 4 Big Comfort Cards */}
          <section className="farmer-comfort-cards" aria-label="Key apiary indicators">
            <article className="farmer-comfort-card">
              <div className="farmer-comfort-card__top">
                <span>{isHindi ? 'औसत स्वास्थ्य' : 'Colony Health'}</span>
                <div className="farmer-comfort-card__icon"><Leaf size={18} aria-hidden="true" /></div>
              </div>
              <strong>{mockFarmerStats.averageHealth}%</strong>
              <p>{isHindi ? '24 में से 22 बक्से उत्तम, 2 बक्से सामान्य निरीक्षण में' : '22 hives excellent, 2 scheduled for mild check'}</p>
              <small>{mockFarmerStats.activeHives} active hives logged</small>
            </article>

            <article className="farmer-comfort-card">
              <div className="farmer-comfort-card__top">
                <span>{isHindi ? 'तैयार शहद' : 'Harvest Ready'}</span>
                <div className="farmer-comfort-card__icon"><Scale size={18} aria-hidden="true" /></div>
              </div>
              <strong>{mockFarmerStats.expectedHarvest} kg</strong>
              <p>{isHindi ? 'सरसों का मौसम चरम पर · 2 बक्से तुरंत निकालने योग्य' : 'Mustard nectar flow peaked · 2 supers ready for extraction'}</p>
              <small>{isHindi ? 'अगले 48 घंटों में कटाई करें' : 'Optimal window: next 48 hours'}</small>
            </article>

            <article className="farmer-comfort-card">
              <div className="farmer-comfort-card__top">
                <span>{isHindi ? 'एस्क्रो कमाई' : 'Smart Escrow'}</span>
                <div className="farmer-comfort-card__icon"><ShieldCheck size={18} aria-hidden="true" /></div>
              </div>
              <strong>₹{(mockFarmerStats.totalEarnings / 1000).toFixed(0)}k</strong>
              <p>{isHindi ? '85% डिलीवरी पर तुरंत भुगतान · 15% लैब पास पर रिजर्व' : '85% paid on dispatch · 15% auto-released on lab approval'}</p>
              <small>{isHindi ? 'अनुबंध: Escrow.sol (EVM)' : 'Contract: Escrow.sol (EVM)'}</small>
            </article>

            <article className="farmer-comfort-card">
              <div className="farmer-comfort-card__top">
                <span>{isHindi ? 'वातावरण' : 'Atmosphere'}</span>
                <div className="farmer-comfort-card__icon"><Thermometer size={18} aria-hidden="true" /></div>
              </div>
              <strong>{latestReading?.temperature.toFixed(1) ?? '24.8'}°C</strong>
              <p>{isHindi ? 'आर्द्रता 58% · मधुमक्खियों की भिनभिनाहट सामान्य (62 dB)' : 'Hive humidity 58% · acoustic hum steady at 62 dB'}</p>
              <small>{isHindi ? 'सेंसर गेटवे सक्रिय' : 'Simulated IoT gateway pinging'}</small>
            </article>
          </section>

          {/* 4 Big Touch Action Buttons for daily tasks */}
          <section className="farmer-big-actions" aria-label="Daily beekeeper quick actions">
            <button
              type="button"
              className="farmer-big-action-btn"
              onClick={() => router.push('/farmer/batches?create=true')}
            >
              <div className="farmer-big-action-btn__icon"><Plus size={22} aria-hidden="true" /></div>
              <strong>{isHindi ? 'शहद कटाई दर्ज करें' : 'Record New Harvest'}</strong>
              <p>{isHindi ? 'वजन और नमी दर्ज कर नया डिजिटल ड्रम बनाएं' : 'Log gross harvest weight and generate cryptographic drum seal'}</p>
              <span className="farmer-big-action-btn__arrow"><ChevronRight size={18} aria-hidden="true" /></span>
            </button>

            <button
              type="button"
              className="farmer-big-action-btn"
              onClick={() => router.push('/farmer/hives')}
            >
              <div className="farmer-big-action-btn__icon"><Leaf size={22} aria-hidden="true" /></div>
              <strong>{isHindi ? 'बक्सा निरीक्षण डायरी' : 'Inspect Hive Colonies'}</strong>
              <p>{isHindi ? 'रानी मक्खी, ब्रूड और मोम की स्थिति अपडेट करें' : 'View all 24 hives, health scores and disease risk telemetry'}</p>
              <span className="farmer-big-action-btn__arrow"><ChevronRight size={18} aria-hidden="true" /></span>
            </button>

            <button
              type="button"
              className="farmer-big-action-btn"
              onClick={() => setViewMode('detailed')}
            >
              <div className="farmer-big-action-btn__icon"><AudioLines size={22} aria-hidden="true" /></div>
              <strong>{isHindi ? 'लाइव सेंसर और टेलीमेट्री' : 'Live IoT Diagnostics'}</strong>
              <p>{isHindi ? 'तापमान, वजन और ध्वनि तरंगों का विस्तृत ग्राफ देखें' : 'Inspect real-time hive sensor graphs and acoustic telemetry'}</p>
              <span className="farmer-big-action-btn__arrow"><ChevronRight size={18} aria-hidden="true" /></span>
            </button>

            <button
              type="button"
              className="farmer-big-action-btn"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <div className="farmer-big-action-btn__icon" style={{ color: paymentConfig?.mode === 'inr' ? '#10b981' : '#fbb638' }}>
                <IndianRupee size={22} aria-hidden="true" />
              </div>
              <strong>{isHindi ? 'भुगतान व बैंक खाता विन्यास' : 'Payout & Bank Settings'}</strong>
              <p>
                {paymentConfig?.mode === 'inr'
                  ? (isHindi ? `सक्रिय: UPI (${paymentConfig.upiId}) · 85% अग्रिम सीधे बैंक में` : `Active: UPI (${paymentConfig.upiId}) · Direct INR off-ramp`)
                  : (isHindi ? `सक्रिय: Web3 (${paymentConfig?.walletAddress.slice(0, 10)}...)` : `Active: Web3 Wallet (${paymentConfig?.walletAddress.slice(0, 10)}...)`)}
              </p>
              <span className="farmer-big-action-btn__arrow"><ChevronRight size={18} aria-hidden="true" /></span>
            </button>

            <a
              href="tel:18001801551"
              className="farmer-big-action-btn"
              style={{ textDecoration: 'none' }}
            >
              <div className="farmer-big-action-btn__icon" style={{ color: 'var(--moss)' }}><Phone size={22} aria-hidden="true" /></div>
              <strong>{isHindi ? 'केवीके कृषि विशेषज्ञ' : 'Call KVK Helpline'}</strong>
              <p>{isHindi ? 'निःशुल्क परामर्श: 1800 180 1551 पर बात करें' : 'Toll-free 1800 180 1551 · Krishi Vigyan Kendra honey desk'}</p>
              <span className="farmer-big-action-btn__arrow"><ChevronRight size={18} aria-hidden="true" /></span>
            </a>
          </section>

          {/* Prompt to flip to Detailed View */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.6rem', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: '8px' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                {isHindi ? 'गहन डेटा या तकनीकी प्रमाण की आवश्यकता है?' : 'Looking for complete IoT graphs, smart contract hashes, or batch dockets?'}
              </strong>
              <small style={{ color: 'var(--muted)' }}>
                {isHindi
                  ? 'एक क्लिक में विस्तृत मोड खोलें—सभी 100% सेंसर और ब्लॉकचेन आंकड़े उपलब्ध हैं।'
                  : 'Toggle to Detailed Mode to access the full IoT telemetry strip, colony watchlist, and EVM settlement ledger.'}
              </small>
            </div>
            <button
              type="button"
              className="button button--ink"
              onClick={() => setViewMode('detailed')}
            >
              <Eye size={14} aria-hidden="true" />
              <span>{isHindi ? 'विस्तृत दृश्य खोलें' : 'Open Detailed Telemetry'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: DETAILED TELEMETRY & LINEAGE (Full data, no sensory cuts)
          ========================================================================= */}
      {viewMode === 'detailed' && (
        <div className="farmer-detailed-mode animate-fadeUp">
          {/* Detailed Mode Info Banner */}
          <div className="farmer-detail-banner">
            <div>
              <p>
                <strong>{isHindi ? 'विस्तृत तकनीकी मोड' : 'Full IoT Telemetry & Blockchain Lineage Gateway'}</strong> —{' '}
                {isHindi
                  ? 'लाइव सेंसर फ़ीड, कॉलोनी स्वास्थ्य निगरानी और स्मार्ट अनुबंध रिकॉर्ड'
                  : 'Live hardware sensor pings, colony watchlist, and cryptographic escrow settlement dockets.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('simple')}
              className="button button--paper"
              style={{ fontSize: '0.72rem', padding: '0.5rem 0.9rem' }}
            >
              <Sparkles size={13} aria-hidden="true" />
              <span>{isHindi ? 'सरल दृश्य में लौटें' : 'Switch to Comfort View'}</span>
            </button>
          </div>

          {/* Advisory */}
          <section className="fieldbook__advisory">
            <div className="fieldbook__advisory-icon"><CalendarDays /></div>
            <div>
              <p>{isHindi ? 'आज का फील्ड नोट' : 'Today’s field note'}</p>
              <strong>
                {isHindi
                  ? 'आर्द्रता स्थिर है। सरसों के बक्सों के लिए कटाई की परिस्थिति अनुकूल है।'
                  : 'Humidity is steady. Conditions are suitable for harvesting the mustard colonies.'}
              </strong>
            </div>
            <button
              type="button"
              onClick={playFieldNote}
              className={audioPlaying ? 'is-playing' : ''}
            >
              <Volume2 />
              {audioPlaying ? (isHindi ? 'चल रहा है' : 'Playing note') : (isHindi ? 'सुनें' : 'Listen')}
            </button>
          </section>

          {/* Season summary metrics strip */}
          <section className="fieldbook__metrics" aria-label="Season summary">
            <article>
              <span>Active hives</span>
              <strong>{mockFarmerStats.activeHives}</strong>
              <small>of 24 registered colonies</small>
            </article>
            <article>
              <span>Average health</span>
              <strong>{mockFarmerStats.averageHealth}%</strong>
              <small>across colonies (AI analyzed)</small>
            </article>
            <article>
              <span>Expected harvest</span>
              <strong>{mockFarmerStats.expectedHarvest} kg</strong>
              <small>this season (Mustard & Acacia)</small>
            </article>
            <article>
              <span>Total earnings</span>
              <strong>₹{(mockFarmerStats.totalEarnings / 1000).toFixed(0)}k</strong>
              <small>recorded to date in Escrow.sol</small>
            </article>
          </section>

          {/* Sensor Gateway & Watchlist */}
          <section className="fieldbook__grid">
            <article className="fieldbook__instrument">
              <header>
                <div>
                  <p>Remote hive sensor / hardware telemetry</p>
                  <h2>Hive H-019</h2>
                  <small>
                    Simulated field gateway · last ping{' '}
                    {latestReading
                      ? new Date(latestReading.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : '—'}
                  </small>
                </div>
                <AudioLines />
              </header>
              <div className="fieldbook__instrument-grid">
                <div>
                  <Thermometer />
                  <span>Temperature</span>
                  <strong>{latestReading?.temperature.toFixed(1) ?? '—'}°C</strong>
                </div>
                <div>
                  <Droplets />
                  <span>Humidity</span>
                  <strong>{latestReading?.humidity.toFixed(0) ?? '—'}%</strong>
                </div>
                <div>
                  <Scale />
                  <span>Hive weight</span>
                  <strong>{latestReading?.weight.toFixed(1) ?? '—'} kg</strong>
                </div>
                <div>
                  <AudioLines />
                  <span>Acoustic level</span>
                  <strong>{latestReading?.soundLevel.toFixed(0) ?? '—'} dB</strong>
                </div>
              </div>
              <button type="button" onClick={() => router.push('/farmer/hives')}>
                Open the full hive ledger <ArrowUpRight />
              </button>
            </article>

            <article className="fieldbook__watchlist">
              <header>
                <div>
                  <p>Needs a field look</p>
                  <h2>Colony watchlist</h2>
                </div>
                <CircleAlert />
              </header>
              {alertHives.length ? (
                alertHives.map((hive) => (
                  <button type="button" key={hive.id} onClick={() => router.push('/farmer/hives')}>
                    <span>
                      <strong>{hive.name}</strong>
                      <small>
                        {hive.floralSource} · last inspection{' '}
                        {new Date(hive.lastInspection).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </small>
                    </span>
                    <em>{hive.currentHealth}% health</em>
                    <ArrowUpRight />
                  </button>
                ))
              ) : (
                <p>No colonies need attention today.</p>
              )}
              <a href="tel:18001801551">
                <Phone />
                KVK helpline · 1800 180 1551
              </a>
            </article>
          </section>

          {/* Smart Contract Settlement & Lineage Strip */}
          <section style={{ background: 'var(--cream)', border: '1px solid var(--line)', padding: '1.5rem', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="evidence-kicker">On-Chain Escrow & Cryptographic Lineage</span>
                <h3 style={{ font: '700 1.4rem var(--serif)', margin: '0.2rem 0 0' }}>Solidity Escrow & Batch Dockets</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ font: '0.68rem var(--mono)', background: 'rgba(56, 122, 70, 0.12)', color: '#387a46', padding: '0.3rem 0.65rem', borderRadius: '4px' }}>
                  Escrow.sol · 0x9fE4...a6e0
                </span>
                <span style={{ font: '0.68rem var(--mono)', background: 'rgba(229, 165, 45, 0.12)', color: 'var(--amber-dark)', padding: '0.3rem 0.65rem', borderRadius: '4px' }}>
                  BatchRegistry.sol · 0x5FbD...0aa3
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.8rem' }}>
              <div style={{ border: '1px solid var(--line)', padding: '1rem', borderRadius: '4px' }}>
                <span style={{ font: '0.62rem var(--mono)', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Dispatched Advance (85%)</span>
                <strong style={{ font: '700 1.25rem var(--serif)', color: 'var(--ink)', display: 'block', margin: '0.3rem 0' }}>₹1,57,250</strong>
                <small style={{ color: 'var(--moss)' }}>Credited immediately upon drum tamper-seal log</small>
              </div>
              <div style={{ border: '1px solid var(--line)', padding: '1rem', borderRadius: '4px' }}>
                <span style={{ font: '0.62rem var(--mono)', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Retained Quality Escrow (15%)</span>
                <strong style={{ font: '700 1.25rem var(--serif)', color: 'var(--amber-dark)', display: 'block', margin: '0.3rem 0' }}>₹27,750</strong>
                <small style={{ color: 'var(--muted)' }}>Automatic release upon NABL dual-lab moisture clearance</small>
              </div>
              <div style={{ border: '1px solid var(--line)', padding: '1rem', borderRadius: '4px' }}>
                <span style={{ font: '0.62rem var(--mono)', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Multi-Sig Custody Status</span>
                <strong style={{ font: '700 1.25rem var(--serif)', color: '#387a46', display: 'block', margin: '0.3rem 0' }}>2 / 2 Signatures</strong>
                <small style={{ color: 'var(--muted)' }}>Sharma Apiary → Cold-chain transport verified</small>
              </div>
            </div>
          </section>

          {/* Recent harvest records */}
          <section className="fieldbook__records">
            <header>
              <div>
                <p>Recent harvest records</p>
                <h2>What moved through the apiary</h2>
              </div>
              <button type="button" onClick={() => router.push('/farmer/batches')}>
                Open harvest records <ArrowUpRight />
              </button>
            </header>
            <div className="fieldbook__record-list">
              {recentBatches.map((batch) => (
                <button
                  type="button"
                  onClick={() => router.push('/farmer/batches')}
                  key={batch.id}
                >
                  <span>{batch.id}</span>
                  <strong>{batch.floralSource} · {batch.quantity} kg</strong>
                  <small>
                    {batch.hiveName} · harvested{' '}
                    {new Date(batch.harvestDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </small>
                  <em>{formatBatchStatus(batch.status)}</em>
                  <ArrowUpRight />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Farmer Payout Configuration Modal */}
      <PaymentConfigModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        isHindi={isHindi}
      />
    </div>
  );
}
