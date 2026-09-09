'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, Camera, CheckCircle2, ChevronDown, FileVideo, Globe2, Leaf,
  MapPin, Plus, Scale, Thermometer, Droplets, ExternalLink, Loader2, IndianRupee, ShieldCheck,
} from 'lucide-react';
import { honeyApi } from '@/lib/api';
import { mockBatches, mockHives } from '@/lib/mock-data';
import { useWeb3 } from '@/lib/web3-context';
import { DEPLOYED_CONTRACTS, BATCH_REGISTRY_ABI } from '@/lib/contracts';
import type { Language } from '@/lib/translations';
import PaymentConfigModal, { getFarmerPaymentConfig, FarmerPaymentConfig } from '@/components/farmer/PaymentConfigModal';

function sentenceCase(value: string) {
  return value.replace(/_/g, ' ');
}

export default function HarvestRecordsPage() {
  const router = useRouter();
  const { executeContractTransaction, account, isConnected, connectWallet } = useWeb3();

  const [lang, setLang] = useState<Language>('en');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedHive, setSelectedHive] = useState(mockHives[0]?.id ?? '');
  const [floralSource, setFloralSource] = useState('Mustard');
  const [quantity, setQuantity] = useState('');
  const [harvestDate, setHarvestDate] = useState('2026-09-06');
  const [cameraReference, setCameraReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<{ txHash: string; blockNumber: number; batchId: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<FarmerPaymentConfig | null>(null);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('farmer_lang') as Language | null;
      if (savedLang === 'hi' || savedLang === 'en') {
        setLang(savedLang);
      }
    } catch { }

    setPaymentConfig(getFarmerPaymentConfig());
    const handleUpdate = () => setPaymentConfig(getFarmerPaymentConfig());
    window.addEventListener('farmer_payment_config_updated', handleUpdate);
    return () => window.removeEventListener('farmer_payment_config_updated', handleUpdate);
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'hi' ? 'en' : 'hi';
    setLang(next);
    try {
      localStorage.setItem('farmer_lang', next);
    } catch { }
  };

  const isHindi = lang === 'hi';

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('create') !== 'true') return;
    const openForm = window.setTimeout(() => setFormOpen(true), 0);
    return () => window.clearTimeout(openForm);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Connect wallet if not yet connected (auto-connects to relayer)
      if (!isConnected) await connectWallet();

      // 2. Generate a batch ID for the chain record
      const batchId = `HC-${Date.now().toString().slice(-6)}`;
      const farmerId = 'USR-FM001';
      const hiveId   = selectedHive;

      // 3. Build a deterministic data hash (SHA-256 equivalent as bytes32)
      const dataString = `${batchId}:${farmerId}:${hiveId}:${floralSource}:${quantity}:${harvestDate}:${cameraReference}`;
      const dataBytes  = new TextEncoder().encode(dataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
      const hashHex    = '0x' + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      // 4. Call BatchRegistry.registerBatch() on the EVM (real Hardhat tx or MetaMask)
      const result = await executeContractTransaction({
        contractAddress: DEPLOYED_CONTRACTS.BatchRegistry,
        contractName:    'BatchRegistry',
        abi:             BATCH_REGISTRY_ABI as unknown as any[],
        method:          'registerBatch',
        args: [
          batchId,
          farmerId,
          hiveId,
          floralSource,
          BigInt(Math.round(Number(quantity) || 0)),
          hashHex as `0x${string}`,
        ],
      });

      // 5. Persist to backend DB (tx hash stored on the Batch record)
      try {
        await honeyApi.createBatch({
          batch_id: batchId,
          hive_id: hiveId,
          floral_source: floralSource,
          quantity: Number(quantity) || 0,
          harvest_date: harvestDate,
          price: 420,
        } as any);
      } catch { /* backend optional — chain record is canonical */ }

      setTxResult({ txHash: result.txHash, blockNumber: result.blockNumber, batchId });
      setFormOpen(false);
    } catch (err: any) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="harvest-book animate-fadeUp">
      <header className="harvest-book__header">
        <div>
          <p>{isHindi ? 'शर्मा एपियरी · शहद कटाई खाता' : 'Sharma Apiary · harvest record book'}</p>
          <h1>
            {isHindi ? (
              <>कटाई का स्पष्ट<br /><em>डिजिटल अभिलेख।</em></>
            ) : (
              <>Make the harvest<br /><em>legible.</em></>
            )}
          </h1>
          <small>
            {isHindi
              ? 'समीक्षा के लिए भेजने से पहले स्रोत बक्सा व प्रत्यक्ष प्रमाण दर्ज करें।'
              : 'Record the source hive and real supporting evidence before the batch goes to review.'}
          </small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            type="button"
            onClick={toggleLanguage}
            className="tab-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.9rem' }}
          >
            <Globe2 size={15} aria-hidden="true" />
            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Payment rail trigger button */}
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="tab-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.9rem',
              borderColor: paymentConfig?.mode === 'inr' ? '#10b981' : '#fbb638',
              background: paymentConfig?.mode === 'inr' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(251, 182, 56, 0.12)',
            }}
          >
            <IndianRupee size={15} color={paymentConfig?.mode === 'inr' ? '#10b981' : '#fbb638'} />
            <span>
              {isHindi
                ? (paymentConfig?.mode === 'inr' ? 'भुगतान: UPI (₹)' : 'भुगतान: क्रिप्टो')
                : (paymentConfig?.mode === 'inr' ? 'Payout: Direct INR' : 'Payout: Crypto')}
            </span>
          </button>

          <button type="button" onClick={() => { setFormOpen(true); setTxResult(null); setSubmitError(null); }}>
            <Plus />{isHindi ? 'कटाई दर्ज करें' : 'Record a harvest'}
          </button>
        </div>
      </header>

      {/* Blockchain Confirmation Banner */}
      {txResult && (
        <div className="harvest-book__saved" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 style={{ color: '#10b981', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>{isHindi ? `खेप ${txResult.batchId} हार्डहैट ब्लॉकचेन पर दर्ज — ब्लॉक #${txResult.blockNumber}` : `Batch ${txResult.batchId} anchored on Hardhat EVM — Block #${txResult.blockNumber}`}</strong>
            <small style={{ display: 'block', marginTop: '0.25rem', fontFamily: 'var(--mono)', fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--amber-dark)' }}>
              TX: {txResult.txHash}
            </small>
          </div>
          <a
            href={`/blockchain`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--amber-dark)', textDecoration: 'none' }}
          >
            <ExternalLink size={13} /> {isHindi ? 'खाता देखें' : 'Ledger'}
          </a>
        </div>
      )}

      {formOpen && (
        <section className="harvest-book__form">
          <header>
            <div>
              <p>{isHindi ? 'नया कटाई रिकॉर्ड' : 'New harvest record'}</p>
              <h2>{isHindi ? 'प्रत्यक्ष अवलोकनों से शुरुआत करें।' : 'Start with what was observed.'}</h2>
            </div>
            <button type="button" onClick={() => setFormOpen(false)}>{isHindi ? 'बंद करें' : 'Close'}</button>
          </header>

          <form onSubmit={submit}>
            <div className="harvest-book__form-grid">
              <label>
                <span>{isHindi ? 'स्रोत बक्सा (Hive)' : 'Source hive'}</span>
                <select value={selectedHive} onChange={(e) => setSelectedHive(e.target.value)}>
                  {mockHives.map((hive) => <option key={hive.id} value={hive.id}>{hive.name} · {hive.floralSource}</option>)}
                </select>
              </label>
              <label>
                <span>{isHindi ? 'पुष्प स्रोत (Floral Source)' : 'Floral source'}</span>
                <input value={floralSource} onChange={(e) => setFloralSource(e.target.value)} required />
              </label>
              <label>
                <span>{isHindi ? 'कटाई की तारीख' : 'Harvest date'}</span>
                <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} required />
              </label>
              <label>
                <span>{isHindi ? 'घोषित वजन (kg)' : 'Declared weight (kg)'}</span>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 140" required />
              </label>
              <label className="harvest-book__form-wide">
                <span>{isHindi ? 'कटाई वीडियो / कैमरा प्रमाण संदर्भ' : 'Harvest CCTV / camera record reference'}</span>
                <div>
                  <FileVideo />
                  <input value={cameraReference} onChange={(e) => setCameraReference(e.target.value)} placeholder={isHindi ? 'वीडियो फ़ाइल नाम, कैमरा ID या संदर्भ' : 'Clip filename, camera ID or custody reference'} />
                </div>
                <small>{isHindi ? 'स्रोत संदर्भ संलग्न करें; यह सेंसर इतिहास के साथ समीक्षक को उपलब्ध होगा।' : 'Attach the recorded source reference; it becomes available to the reviewer alongside the sensor history.'}</small>
              </label>
            </div>

            <div className="harvest-book__sensor-note">
              <Thermometer />
              <div>
                <span>{isHindi ? 'सेंसर स्थितियां संलग्न' : 'Attached hive conditions'}</span>
                <strong>{isHindi ? 'चयनित बक्से से तापमान, नमी, वजन और ध्वनि गतिविधि स्वचालित रूप से जुड़ जाएगी।' : 'Temperature, humidity, weight and acoustic activity will be linked from the selected hive record.'}</strong>
              </div>
            </div>

            {/* Payout Rail Active Configuration Callout */}
            <div
              style={{
                background: paymentConfig?.mode === 'inr' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(251, 182, 56, 0.08)',
                border: paymentConfig?.mode === 'inr' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(251, 182, 56, 0.25)',
                borderRadius: '8px',
                padding: '0.8rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={18} color={paymentConfig?.mode === 'inr' ? '#10b981' : '#fbb638'} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                  <strong>{isHindi ? 'एस्क्रो भुगतान गंतव्य:' : 'Escrow Settlement Destination:'}</strong>{' '}
                  {paymentConfig?.mode === 'inr'
                    ? (isHindi ? `सीधे बैंक / UPI (${paymentConfig.upiId}) · 85% अग्रिम डिस्पैच पर स्वतः जमा होगा` : `Direct INR to UPI (${paymentConfig.upiId}) · 85% auto-credited on dispatch`)
                    : (isHindi ? `Web3 क्रिप्टो वॉलेट (${paymentConfig?.walletAddress.slice(0, 10)}...)` : `Web3 Wallet (${paymentConfig?.walletAddress.slice(0, 10)}...)`)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fbb638',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                {isHindi ? 'बदलें' : 'Change'}
              </button>
            </div>

            <footer>
              <button type="button" onClick={() => setFormOpen(false)} disabled={submitting}>{isHindi ? 'रद्द करें' : 'Cancel'}</button>
              <button type="submit" disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {isHindi ? 'ब्लॉकचेन पर दर्ज हो रहा है…' : 'Signing & Mining…'}</>
                ) : (
                  <>{isHindi ? 'समीक्षा के लिए भेजें' : 'Submit record for review'} <ArrowUpRight /></>
                )}
              </button>
            </footer>
          </form>
        </section>
      )}

      <section className="harvest-book__manifest">
        <header>
          <div>
            <p>{isHindi ? 'पंजीकृत कटाइयां' : 'Registered harvests'}</p>
            <h2>{isHindi ? 'प्रत्येक खेप एक फील्ड रिकॉर्ड से शुरू होती है।' : 'Every batch starts as a field record.'}</h2>
          </div>
          <span>{mockBatches.length} {isHindi ? 'प्रविष्टियां' : 'entries'}</span>
        </header>
        <div className="harvest-book__list">
          {mockBatches.map((batch) => (
            <details key={batch.id}>
              <summary>
                <span>{batch.id}</span>
                <strong>{batch.floralSource} · {batch.quantity} kg</strong>
                <small>{batch.hiveName} · {new Date(batch.harvestDate).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                <em>{sentenceCase(batch.status)}</em>
                <ChevronDown />
              </summary>
              <div className="harvest-book__record">
                <div><MapPin /><span>{isHindi ? 'स्रोत बक्सा' : 'Source hive'}</span><strong>{batch.hiveName}</strong></div>
                <div><Thermometer /><span>{isHindi ? 'तापमान' : 'Temperature'}</span><strong>{batch.iotSnapshot.temperature}°C</strong></div>
                <div><Droplets /><span>{isHindi ? 'नमी' : 'Humidity'}</span><strong>{batch.iotSnapshot.humidity}%</strong></div>
                <div><Scale /><span>{isHindi ? 'कटाई वजन' : 'Harvest weight'}</span><strong>{batch.iotSnapshot.weight} kg</strong></div>
                <div><Camera /><span>{isHindi ? 'प्रमाण संदर्भ' : 'Evidence references'}</span><strong>{Object.keys(batch.images).length ? `${Object.keys(batch.images).length} attached` : 'No file reference'}</strong></div>
                <button type="button" onClick={() => router.push('/farmer/hives')}><Leaf />{isHindi ? 'बक्सा विवरण खोलें' : 'Open hive record'} <ArrowUpRight /></button>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Farmer Payout Configuration Modal */}
      <PaymentConfigModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        isHindi={isHindi}
      />
    </div>
  );
}

