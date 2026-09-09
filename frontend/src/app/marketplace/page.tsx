'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Check, Coins, Copy, ExternalLink,
  Flame, Fuel, MapPin, Network, ShieldCheck, Sparkles,
  Wallet, X, Loader2, IndianRupee,
} from 'lucide-react';
import { honeyApi } from '@/lib/api';
import { mockMarketplaceListings } from '@/lib/mock-data';
import { useWeb3, Web3TransactionResult } from '@/lib/web3-context';
import { DEPLOYED_CONTRACTS, ESCROW_ABI, DEFAULT_SELLER_ADDRESS } from '@/lib/contracts';
import { getFarmerPaymentConfig, FarmerPaymentConfig } from '@/components/farmer/PaymentConfigModal';

type Listing = typeof mockMarketplaceListings[number];

export default function MarketplacePage() {
  const { isConnected, account, shortAccount, connectWallet, executeContractTransaction, balanceHoney } = useWeb3();
  const [selected, setSelected] = useState<Listing | null>(null);
  const [paymentToken, setPaymentToken] = useState<'ETH' | 'HONEY'>('ETH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txResult, setTxResult] = useState<Web3TransactionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [farmerConfig, setFarmerConfig] = useState<FarmerPaymentConfig | null>(null);

  useEffect(() => {
    setFarmerConfig(getFarmerPaymentConfig());
    const handleUpdate = () => setFarmerConfig(getFarmerPaymentConfig());
    window.addEventListener('farmer_payment_config_updated', handleUpdate);
    return () => window.removeEventListener('farmer_payment_config_updated', handleUpdate);
  }, []);

  const handleOpenModal = (listing: Listing) => {
    setSelected(listing);
    setErrorMessage(null);
  };

  const handleFundEscrow = async () => {
    if (!selected) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Generate unique order ID
      const orderId = `ORD-${Date.now().toString().slice(-8)}`;

      // 2. ETH value: ~0.045 ETH demo (matches gas reserve on Hardhat)
      const valueETH = paymentToken === 'ETH' ? '0.045' : '0';

      // 3. Call real Escrow.createEscrow(orderId, batchId, seller) with ETH value
      const sellerAddr = (farmerConfig?.mode === 'crypto' && farmerConfig.walletAddress.startsWith('0x'))
        ? farmerConfig.walletAddress
        : DEFAULT_SELLER_ADDRESS;

      const result = await executeContractTransaction({
        contractAddress: DEPLOYED_CONTRACTS.Escrow,
        contractName:    'Escrow.sol',
        abi:             ESCROW_ABI as unknown as any[],
        method:          'createEscrow',
        args: [
          orderId,
          selected.batchId,
          sellerAddr,
        ],
        valueETH,
      });

      // 4. Sync with backend
      await honeyApi.buyListing(selected.batchId).catch(() => undefined);

      setTxResult(result);
      setSelected(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Transaction rejected');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <section className="exchange-board animate-fadeUp">
      <header className="exchange-board__head">
        <div>
          <p className="fieldbook__eyebrow">Decentralized Honey Exchange · Smart Escrow Protocol</p>
          <h1>
            Buy the lot,<br />
            <em>read its proof.</em>
          </h1>
          <span>
            Every lot is an immutable harvest record anchored on Ethereum EVM. Funds are locked in <code>Escrow.sol</code> and released strictly upon laboratory purity verification.
          </span>
        </div>

        <div className="exchange-board__terms">
          <b>85 / 15</b>
          <span>dispatch / quality reserve</span>
        </div>
      </header>

      {/* Guide Header */}
      <div className="exchange-board__guide">
        <span>Lot ID</span>
        <span>Origin & On-Chain Proof</span>
        <span>Available Volume</span>
        <span>Market Terms</span>
      </div>

      {/* Listings */}
      <div className="exchange-board__list">
        {mockMarketplaceListings.map((listing) => (
          <article key={listing.id}>
            <div>
              <small>Lot</small>
              <b>{listing.batchId}</b>
              <span>{listing.floralSource} harvest</span>
            </div>

            <div>
              <small>Origin & evidence</small>
              <b>
                <MapPin size={15} className="inline mr-1 text-amber-500" />
                {listing.farmName}
              </b>
              <span>
                {listing.location} · NABL lab passed · rating {listing.farmerRating}/5
              </span>
            </div>

            <div>
              <small>Available</small>
              <b>{listing.availableQuantity} kg</b>
              <span>traceable source lot</span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenModal(listing)}
              className="exchange-row-action-btn"
            >
              <span>₹{listing.pricePerKg} / kg</span>
              <span>Review terms</span>
              <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>

      {/* Transaction Success Modal */}
      <AnimatePresence>
        {txResult && (
          <>
            <motion.div
              className="exchange-modal__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTxResult(null)}
            />
            <motion.div
              className="exchange-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
            >
              <button
                type="button"
                className="exchange-modal__close"
                onClick={() => setTxResult(null)}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#10b981', marginBottom: '0.5rem' }}>
                <Check size={22} />
                <span style={{ font: '700 0.72rem var(--mono)', textTransform: 'uppercase' }}>
                  Transaction Mined on EVM
                </span>
              </div>

              <h2 style={{ fontSize: '2.2rem', lineHeight: '1', margin: '0.4rem 0 1rem' }}>
                Escrow Funded Successfully.
              </h2>

              <div className="exchange-modal__numbers">
                <div>
                  <span>Contract</span>
                  <b>Escrow.sol (0xCf7E...0Fc9)</b>
                </div>
                <div>
                  <span>Mined Block</span>
                  <b>#{txResult.blockNumber.toLocaleString('en-US')}</b>
                </div>
                <div>
                  <span>Gas Consumed</span>
                  <b>{txResult.gasUsed.toLocaleString('en-US')} units ({txResult.gasFeeETH} ETH)</b>
                </div>
                <div>
                  <span>Transaction Hash</span>
                  <code style={{ fontSize: '0.68rem', color: 'var(--amber-dark)' }}>
                    {txResult.txHash.substring(0, 16)}…{txResult.txHash.slice(-8)}
                  </code>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                <Link
                  href="/blockchain"
                  onClick={() => setTxResult(null)}
                  className="button button--amber"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <Network size={14} />
                  <span>Inspect in Ledger Explorer</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setTxResult(null)}
                  className="button button--paper"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Escrow Purchase Terms Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.button
              type="button"
              className="exchange-modal__backdrop"
              aria-label="Close purchase terms"
              onClick={() => setSelected(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.section
              className="exchange-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="purchase-title"
            >
              <button
                type="button"
                className="exchange-modal__close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>Smart Escrow Terms / {selected.batchId}</p>
                <span style={{ font: '0.65rem var(--mono)', color: 'var(--amber-dark)' }}>
                  Solidity EVM
                </span>
              </div>

              <h2 id="purchase-title">
                {selected.floralSource}
                <br />
                <em>source lot.</em>
              </h2>

              {/* Farmer Settlement Rail Preference Callout */}
              <div
                style={{
                  background: farmerConfig?.mode === 'inr' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(251, 182, 56, 0.08)',
                  border: farmerConfig?.mode === 'inr' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(251, 182, 56, 0.25)',
                  borderRadius: '8px',
                  padding: '0.8rem 0.95rem',
                  margin: '0.8rem 0 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.7rem',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: farmerConfig?.mode === 'inr' ? '#10b981' : '#fbb638',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: farmerConfig?.mode === 'inr' ? '#fff' : '#1a1400',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {farmerConfig?.mode === 'inr' ? <IndianRupee size={15} /> : <Wallet size={15} />}
                </div>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <strong style={{ color: farmerConfig?.mode === 'inr' ? '#10b981' : '#fbb638' }}>
                      {farmerConfig?.mode === 'inr' ? 'Farmer Settlement: Direct INR (UPI)' : 'Farmer Settlement: Web3 Wallet'}
                    </strong>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {farmerConfig?.mode === 'inr' ? 'Fiat Auto-Offramp' : 'On-Chain Native'}
                    </span>
                  </div>
                  {farmerConfig?.mode === 'inr' ? (
                    <span style={{ opacity: 0.85, display: 'block' }}>
                      Buyer funds <code>Escrow.sol</code>. Upon dispatch milestone, the protocol converts 85% advance (<b>₹{Math.round(selected.availableQuantity * selected.pricePerKg * 0.85).toLocaleString('en-IN')}</b>) into direct INR bank credit to UPI: <b>{farmerConfig.upiId}</b>.
                    </span>
                  ) : (
                    <span style={{ opacity: 0.85, display: 'block' }}>
                      Funds will settle on-chain directly to farmer’s EVM address: <code>{farmerConfig?.walletAddress.slice(0, 10)}...</code>.
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Currency Selector */}
              <div style={{ background: 'rgba(0,0,0,0.04)', padding: '0.75rem', borderRadius: '8px', margin: '0 0 1.2rem', border: '1px solid var(--line)' }}>
                <span style={{ font: '0.65rem var(--mono)', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Select Buyer Funding Currency:
                </span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentToken('ETH')}
                    className={`wallet-net-pill ${paymentToken === 'ETH' ? 'is-active' : ''}`}
                    style={{ flex: 1, padding: '0.6rem' }}
                  >
                    <span>ETH (Local EVM)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentToken('HONEY')}
                    className={`wallet-net-pill ${paymentToken === 'HONEY' ? 'is-active' : ''}`}
                    style={{ flex: 1, padding: '0.6rem' }}
                  >
                    <Coins size={13} className="inline mr-1 text-amber-500" />
                    <span>$HONEY (0% Protocol Fee)</span>
                  </button>
                </div>
              </div>

              <div className="exchange-modal__numbers">
                <div>
                  <span>Total Lot Volume</span>
                  <b>{selected.availableQuantity} kg</b>
                </div>
                <div>
                  <span>Gross Contract Value</span>
                  <b>₹{(selected.availableQuantity * selected.pricePerKg).toLocaleString('en-IN')}</b>
                </div>
                <div>
                  <span>Dispatched to Farmer (85%)</span>
                  <b style={{ color: '#10b981' }}>
                    ₹{Math.round(selected.availableQuantity * selected.pricePerKg * 0.85).toLocaleString('en-IN')}
                  </b>
                </div>
                <div>
                  <span>NABL Quality Reserve (15%)</span>
                  <b style={{ color: 'var(--amber-dark)' }}>
                    ₹{Math.round(selected.availableQuantity * selected.pricePerKg * 0.15).toLocaleString('en-IN')}
                  </b>
                </div>
                <div>
                  <span>Estimated Web3 Gas</span>
                  <b style={{ font: '0.74rem var(--mono)', color: 'var(--muted)' }}>
                    <Fuel size={13} className="inline mr-1 text-amber-500" />
                    ~48,200 gas (0.0012 ETH)
                  </b>
                </div>
              </div>

              <p className="exchange-modal__note">
                <ShieldCheck size={18} />
                <span>
                  The 15% reserve is retained in <code>Escrow.sol</code> until the processor NABL lab tests confirm 0% C4 adulteration and &lt;20% moisture.
                </span>
              </p>

              {errorMessage && (
                <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
                  {errorMessage}
                </div>
              )}

              <div className="exchange-modal__actions">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>

                {!isConnected ? (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="button button--amber"
                  >
                    🦊 Connect Wallet to Sign
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFundEscrow}
                    disabled={isProcessing}
                    className="button button--amber"
                  >
                    {isProcessing
                      ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /><span>Mining on EVM…</span></>
                      : <><Sparkles size={14} /><span>Sign &amp; Fund Escrow</span></>
                    }
                  </button>
                )}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
