'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, ChevronDown, Coins, Copy, ExternalLink,
  Flame, LogOut, Network, ShieldCheck, Wallet, X,
} from 'lucide-react';
import { useWeb3 } from '@/lib/web3-context';

export default function WalletConnectButton({ className = '' }: { className?: string }) {
  const {
    account,
    shortAccount,
    networkName,
    chainId,
    balanceETH,
    balanceHoney,
    isConnected,
    isConnecting,
    isMetaMaskInstalled,
    walletMode,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3();

  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  if (!isConnected) {
    return (
      <button
        type="button"
        onClick={connectWallet}
        disabled={isConnecting}
        className={`wallet-btn wallet-btn--connect ${className}`}
        title="Connect Web3 Wallet (MetaMask or In-App Relayer)"
      >
        <span className="wallet-btn__fox" aria-hidden="true">🦊</span>
        <span>{isConnecting ? 'Connecting…' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`wallet-btn wallet-btn--connected ${className}`}
        aria-expanded={modalOpen}
      >
        <span className="wallet-btn__pulse-dot" />
        <span className="wallet-btn__network">{chainId === 31337 ? 'EVM Local' : 'Polygon'}</span>
        <span className="wallet-btn__addr">{shortAccount}</span>
        <span className="wallet-btn__token-badge">
          <Coins size={12} aria-hidden="true" />
          <span>{balanceHoney} HNY</span>
        </span>
        <ChevronDown size={13} className="wallet-btn__chevron" aria-hidden="true" />
      </button>

      {modalOpen && (
        <div className="wallet-modal__backdrop" onClick={() => setModalOpen(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <header className="wallet-modal__header">
              <div className="wallet-modal__header-title">
                <Wallet size={18} className="text-amber-500" />
                <h3>Web3 dApp Wallet</h3>
              </div>
              <button
                type="button"
                className="wallet-modal__close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>

            <div className="wallet-modal__body">
              {/* Connected Account Box */}
              <div className="wallet-modal__account-card">
                <div className="wallet-modal__account-top">
                  <div className="wallet-modal__network-tag">
                    <span className="wallet-btn__pulse-dot" />
                    <span>{networkName}</span>
                  </div>
                  <span className="wallet-modal__badge">
                    {walletMode === 'metamask' ? 'MetaMask Provider' : 'Gasless Relayer'}
                  </span>
                </div>

                <div className="wallet-modal__address-row">
                  <code>{account}</code>
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="wallet-modal__copy-btn"
                    title="Copy Address"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Balances Strip */}
              <div className="wallet-modal__balances">
                <div className="wallet-balance-card">
                  <small>EVM Gas Balance</small>
                  <strong>{balanceETH} ETH</strong>
                  <span>Gas ready</span>
                </div>
                <div className="wallet-balance-card wallet-balance-card--token">
                  <small>HoneyChain Token</small>
                  <strong>{balanceHoney} $HONEY</strong>
                  <span>Quality Staking & Escrow</span>
                </div>
              </div>

              {/* Network Switcher */}
              <div className="wallet-modal__networks">
                <p>Switch Active EVM Network</p>
                <div className="wallet-network-pills">
                  <button
                    type="button"
                    className={`wallet-net-pill ${chainId === 31337 ? 'is-active' : ''}`}
                    onClick={() => switchNetwork(31337)}
                  >
                    Hardhat Local (31337)
                  </button>
                  <button
                    type="button"
                    className={`wallet-net-pill ${chainId === 80002 ? 'is-active' : ''}`}
                    onClick={() => switchNetwork(80002)}
                  >
                    Polygon Amoy (80002)
                  </button>
                  <button
                    type="button"
                    className={`wallet-net-pill ${chainId === 11155111 ? 'is-active' : ''}`}
                    onClick={() => switchNetwork(11155111)}
                  >
                    Ethereum Sepolia
                  </button>
                </div>
              </div>

              {/* Gas & Blockchain Link */}
              <div className="wallet-modal__links">
                <Link
                  href="/blockchain"
                  onClick={() => setModalOpen(false)}
                  className="wallet-modal__link-row"
                >
                  <Network size={15} className="text-amber-500" />
                  <span>Inspect On-Chain Ledger & Contract Blocks</span>
                  <ExternalLink size={13} className="ml-auto text-muted" />
                </Link>
              </div>
            </div>

            <footer className="wallet-modal__footer">
              <button
                type="button"
                onClick={() => {
                  disconnectWallet();
                  setModalOpen(false);
                }}
                className="wallet-modal__disconnect-btn"
              >
                <LogOut size={14} />
                <span>Disconnect</span>
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
