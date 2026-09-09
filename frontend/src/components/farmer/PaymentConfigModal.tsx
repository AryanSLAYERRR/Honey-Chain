'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, Wallet, Check, AlertCircle, Sparkles, Building2,
  QrCode, ArrowRight, ShieldCheck, RefreshCw, X, IndianRupee
} from 'lucide-react';

export interface FarmerPaymentConfig {
  mode: 'inr' | 'crypto';
  upiId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  walletAddress: string;
  preferredToken: 'ETH' | 'HONEY';
  autoOfframp: boolean;
}

export const DEFAULT_PAYMENT_CONFIG: FarmerPaymentConfig = {
  mode: 'inr',
  upiId: 'sharma.ramesh@okaxis',
  accountHolderName: 'Rajesh Sharma',
  bankName: 'Punjab National Bank (Phagwara GT Road)',
  accountNumber: '928301004819',
  ifscCode: 'PUNB0123400',
  walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  preferredToken: 'ETH',
  autoOfframp: true,
};

const STORAGE_KEY = 'honeychain_farmer_payment_config';

export function getFarmerPaymentConfig(): FarmerPaymentConfig {
  if (typeof window === 'undefined') return DEFAULT_PAYMENT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return DEFAULT_PAYMENT_CONFIG;
}

export function saveFarmerPaymentConfig(config: FarmerPaymentConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('farmer_payment_config_updated'));
  } catch { }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isHindi?: boolean;
}

export default function PaymentConfigModal({ isOpen, onClose, isHindi = false }: Props) {
  const [config, setConfig] = useState<FarmerPaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getFarmerPaymentConfig());
      setSavedToast(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveFarmerPaymentConfig(config);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 900);
  };

  return (
    <div
      className="payment-modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.2rem',
      }}
    >
      <div
        className="payment-modal-card animate-fadeUp"
        style={{
          background: 'var(--color-bg, #0f1712)',
          border: '1px solid var(--color-border, #273d2d)',
          borderRadius: '1.2rem',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          color: 'var(--color-text, #f0fdf4)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 1.8rem',
            borderBottom: '1px solid var(--color-border, #273d2d)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <span
                style={{
                  background: 'rgba(251, 182, 56, 0.15)',
                  color: '#fbb638',
                  borderRadius: '9999px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <ShieldCheck size={12} />
                {isHindi ? 'सुरक्षित भुगतान रेल' : 'Escrow Payout Rail'}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {isHindi ? 'भुगतान व निकासी विन्यास' : 'Farmer Payout Configuration'}
            </h2>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
              {isHindi
                ? 'तय करें कि प्रोसेसर से शहद का भुगतान सीधे बैंक/UPI (₹) में चाहिए या क्रिप्टो वॉलेट में।'
                : 'Choose whether buyer funds settle directly into your bank account via UPI or as on-chain crypto.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              opacity: 0.6,
              padding: '0.4rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div style={{ padding: '1.5rem 1.8rem 0.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', opacity: 0.85 }}>
            {isHindi ? 'पसंदीदा भुगतान माध्यम' : 'Settlement Rail Preference'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            {/* INR Option */}
            <div
              onClick={() => setConfig({ ...config, mode: 'inr' })}
              style={{
                border: config.mode === 'inr' ? '2px solid #10b981' : '1px solid var(--color-border, #273d2d)',
                background: config.mode === 'inr' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '0.8rem',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <IndianRupee size={16} />
                  </div>
                  <strong style={{ fontSize: '0.95rem' }}>{isHindi ? 'रुपया (INR / UPI)' : 'Direct INR (UPI / Bank)'}</strong>
                </div>
                {config.mode === 'inr' && <Check size={18} color="#10b981" />}
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.75, lineHeight: 1.4 }}>
                {isHindi
                  ? 'भारतीय किसानों के लिए अनुशंसित। 85% अग्रिम सीधे आपके बैंक खाते में।'
                  : 'Recommended for Indian beekeepers. 85% advance credited straight to bank.'}
              </p>
            </div>

            {/* Crypto Option */}
            <div
              onClick={() => setConfig({ ...config, mode: 'crypto' })}
              style={{
                border: config.mode === 'crypto' ? '2px solid #fbb638' : '1px solid var(--color-border, #273d2d)',
                background: config.mode === 'crypto' ? 'rgba(251, 182, 56, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '0.8rem',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fbb638', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1400' }}>
                    <Wallet size={16} />
                  </div>
                  <strong style={{ fontSize: '0.95rem' }}>{isHindi ? 'क्रिप्टो वॉलेट' : 'Web3 Crypto ($HONEY/ETH)'}</strong>
                </div>
                {config.mode === 'crypto' && <Check size={18} color="#fbb638" />}
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.75, lineHeight: 1.4 }}>
                {isHindi
                  ? 'निर्यातक या टेक सहकारी समितियों के लिए। सीधे ऑन-चेन स्मार्ट कॉन्ट्रैक्ट पेमेंट।'
                  : 'For export / cooperatives. Direct on-chain milestone settlement to your wallet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Detail Fields */}
        <div style={{ padding: '1rem 1.8rem 1.5rem' }}>
          {config.mode === 'inr' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.9 }}>
                  {isHindi ? 'यूपीआई आईडी (UPI VPA)' : 'UPI ID (Primary Payout)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={config.upiId}
                    onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                    placeholder="name@okhdfcbank"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border, #273d2d)',
                      borderRadius: '0.6rem',
                      color: 'inherit',
                      fontSize: '0.9rem',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.7rem',
                      color: '#10b981',
                      fontWeight: 600,
                    }}
                  >
                    ✓ UPI Auto-Credit
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.9 }}>
                    {isHindi ? 'खाताधारक का नाम' : 'Account Holder Name'}
                  </label>
                  <input
                    type="text"
                    value={config.accountHolderName}
                    onChange={(e) => setConfig({ ...config, accountHolderName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border, #273d2d)',
                      borderRadius: '0.6rem',
                      color: 'inherit',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.9 }}>
                    {isHindi ? 'आईएफएससी कोड (IFSC)' : 'IFSC Code'}
                  </label>
                  <input
                    type="text"
                    value={config.ifscCode}
                    onChange={(e) => setConfig({ ...config, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="PUNB0123400"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border, #273d2d)',
                      borderRadius: '0.6rem',
                      color: 'inherit',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.9 }}>
                  {isHindi ? 'बैंक नाम व खाता संख्या' : 'Bank Name & Account No.'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <input
                    type="text"
                    value={config.bankName}
                    onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                    placeholder="e.g. Punjab National Bank"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border, #273d2d)',
                      borderRadius: '0.6rem',
                      color: 'inherit',
                      fontSize: '0.9rem',
                    }}
                  />
                  <input
                    type="text"
                    value={config.accountNumber}
                    onChange={(e) => setConfig({ ...config, accountNumber: e.target.value })}
                    placeholder="Account Number"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border, #273d2d)',
                      borderRadius: '0.6rem',
                      color: 'inherit',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* Fiat Gateway explainer badge */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '0.6rem',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                }}
              >
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                  <strong style={{ color: '#10b981' }}>
                    {isHindi ? 'स्वायत्त एस्क्रो ऑटो-ऑफरेम्प (आरबीआई/टीआरईडील मानक)' : 'Autonomous Smart Escrow Auto-Offramp:'}
                  </strong>{' '}
                  {isHindi
                    ? 'जब खरीदार/प्रोसेसर लॉट बुक करेगा, तो ब्लॉकचेन एस्क्रो 85% अग्रिम को तुरंत बैंक आईएमपीएस/यूपीआई में बदल कर किसान को सीधे भेज देगा। आपको क्रिप्टो छूने की जरूरत नहीं है।'
                    : 'When the buyer funds Escrow.sol, the protocol initiates an immediate 85% liquidity advance directly to your UPI/Bank. Zero crypto exposure for the farmer.'}
                </div>
              </div>
            </div>
          ) : (
            /* Crypto Configuration */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.9 }}>
                  {isHindi ? 'ईवीएम वॉलेट पता (Polygon / Ethereum)' : 'EVM Wallet Address (Polygon / Ethereum)'}
                </label>
                <input
                  type="text"
                  value={config.walletAddress}
                  onChange={(e) => setConfig({ ...config, walletAddress: e.target.value })}
                  placeholder="0x..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--color-border, #273d2d)',
                    borderRadius: '0.6rem',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.9 }}>
                  {isHindi ? 'प्राथमिक टोकन' : 'Preferred Payout Token'}
                </label>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, preferredToken: 'ETH' })}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '0.5rem',
                      border: config.preferredToken === 'ETH' ? '2px solid #fbb638' : '1px solid var(--color-border, #273d2d)',
                      background: config.preferredToken === 'ETH' ? 'rgba(251, 182, 56, 0.15)' : 'transparent',
                      color: 'inherit',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ETH (Native)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, preferredToken: 'HONEY' })}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '0.5rem',
                      border: config.preferredToken === 'HONEY' ? '2px solid #fbb638' : '1px solid var(--color-border, #273d2d)',
                      background: config.preferredToken === 'HONEY' ? 'rgba(251, 182, 56, 0.15)' : 'transparent',
                      color: 'inherit',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    $HONEY Token
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: '1.2rem 1.8rem',
            borderTop: '1px solid var(--color-border, #273d2d)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.8rem',
            alignItems: 'center',
          }}
        >
          {savedToast && (
            <span style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={16} /> {isHindi ? 'विन्यास सहेजा गया!' : 'Payout configuration saved!'}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="tab-btn"
            style={{ padding: '0.6rem 1rem' }}
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="fieldbook__primary"
            style={{ padding: '0.6rem 1.4rem' }}
          >
            <Check size={16} />
            <span>{isHindi ? 'सेटिंग्स सहेजें' : 'Save Payout Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
