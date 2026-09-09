'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockBlockchainRecords } from '@/lib/mock-data';
import {
  Blocks, CheckCircle2, ChevronDown, ChevronUp, Copy,
  Cpu, ExternalLink, FileCode2, Filter, Fingerprint,
  Hash, Lock, Network, Search, ShieldCheck, Zap
} from 'lucide-react';

interface ContractSummary {
  name: string;
  file: string;
  address: string;
  desc: string;
  badge: string;
}

const contracts: ContractSummary[] = [
  {
    name: 'BatchRegistry',
    file: 'BatchRegistry.sol',
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    desc: 'Commits SHA-256 telemetry digests of hive conditions and AI risk scores.',
    badge: 'Harvest & AI',
  },
  {
    name: 'CustodyChain',
    file: 'CustodyChain.sol',
    address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    desc: 'Cryptographic multi-signature handoffs & cold-chain GPS integrity.',
    badge: 'Logistics',
  },
  {
    name: 'Escrow',
    file: 'Escrow.sol',
    address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    desc: 'Automates 85% advance on dispatch + 15% reserve released upon NABL lab pass.',
    badge: 'Financing',
  },
  {
    name: 'ProcessingRegistry',
    file: 'ProcessingRegistry.sol',
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    desc: 'Batch Merkle roots, dual NABL lab report anchoring, and NTAG 424 DNA NFC minting.',
    badge: 'Packaging',
  },
];

function getHumanTitle(type: string): string {
  switch (type) {
    case 'harvest_minted': return 'Apiary Harvest Registered';
    case 'iot_telemetry': return 'IoT Hive Conditions Locked';
    case 'escrow_deposit': return '85% Advance Dispatched to Farmer';
    case 'custody_transfer': return 'Refrigerated Cold-Chain Handoff';
    case 'lab_verified': return 'NABL Laboratory Purity Certified';
    case 'bottle_minted': return 'Anti-Counterfeit NFC Jar Minted';
    default: return type.replace(/_/g, ' ');
  }
}

export default function BlockchainPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const eventTypes = ['all', ...Array.from(new Set(mockBlockchainRecords.map((r) => r.type)))];

  const filteredRecords = mockBlockchainRecords.filter((r) => {
    const query = search.toLowerCase();
    const matchesSearch =
      r.txHash.toLowerCase().includes(query) ||
      r.details.toLowerCase().includes(query) ||
      r.type.toLowerCase().includes(query) ||
      String(r.blockNumber).includes(query);
    const matchesFilter = filter === 'all' || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const toggleExpand = (hash: string) => {
    setExpandedTx(expandedTx === hash ? null : hash);
  };

  return (
    <div className="ledger-page animate-fadeUp">
      {/* Header */}
      <header className="ledger-header">
        <div>
          <p className="home-eyebrow" style={{ justifyContent: 'flex-start', margin: '0 0 0.5rem' }}>
            <span /> Decentralized Provenance Ledger <span />
          </p>
          <h1>
            <Blocks className="w-8 h-8 text-amber-500" />
            Verified Ledger & Block Records
          </h1>
          <p>
            Immutable on-chain receipts recording every harvest telemetry hash, logistics handoff, NABL test docket, and bottle mint in plain human language.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/#blockchain" className="button button--ghost text-xs">
            Showcase View <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <a
            href="https://hardhat.org"
            target="_blank"
            rel="noreferrer"
            className="button button--ink text-xs"
          >
            Hardhat EVM Docs <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Network Metrics Cards */}
      <div className="ledger-metrics-grid">
        <div className="ledger-metric-card">
          <div className="ledger-metric-icon bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Blocks className="w-5 h-5" />
          </div>
          <div className="ledger-metric-content">
            <small>Consensus Protocol</small>
            <strong>Hardhat EVM (Node)</strong>
          </div>
        </div>

        <div className="ledger-metric-card">
          <div className="ledger-metric-icon bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div className="ledger-metric-content">
            <small>Total Mined Blocks</small>
            <strong suppressHydrationWarning>{mockBlockchainRecords.length} Blocks</strong>
          </div>
        </div>

        <div className="ledger-metric-card">
          <div className="ledger-metric-icon bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="ledger-metric-content">
            <small>Verified Contracts</small>
            <strong>4 Solidity Active</strong>
          </div>
        </div>

        <div className="ledger-metric-card">
          <div className="ledger-metric-icon bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="ledger-metric-content">
            <small>Average Block Time</small>
            <strong>~1.2 seconds</strong>
          </div>
        </div>
      </div>

      {/* Deployed Smart Contracts Directory */}
      <section className="ledger-contracts-section" aria-labelledby="contracts-title">
        <h3 id="contracts-title">
          <FileCode2 className="w-4 h-4 text-amber-500" />
          Deployed Smart Contracts Directory
        </h3>

        <div className="ledger-contracts-grid">
          {contracts.map((c) => (
            <div key={c.name} className="ledger-contract-box">
              <div className="ledger-contract-box__header">
                <span className="ledger-contract-box__sol">{c.file}</span>
                <span className="ledger-contract-box__status" title="Contract Verified on EVM" />
              </div>
              <strong>{c.name}</strong>
              <p>{c.desc}</p>
              <button
                type="button"
                className="ledger-contract-box__addr"
                onClick={() => copyToClipboard(c.address)}
                title="Click to copy address"
              >
                <span>{c.address.slice(0, 8)}…{c.address.slice(-6)}</span>
                {copiedHash === c.address ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Transactions Explorer Table */}
      <div className="ledger-table-card">
        {/* Toolbar: Search and Event Filters */}
        <div className="ledger-toolbar">
          <div className="ledger-search-box">
            <Search aria-hidden="true" />
            <input
              type="text"
              placeholder="Search Tx hash, block #, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ledger-search-input"
              aria-label="Search transaction ledger"
            />
          </div>

          <div className="ledger-filters" role="tablist" aria-label="Event type filters">
            {eventTypes.slice(0, 6).map((type) => {
              const isActive = filter === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={`ledger-filter-pill ${isActive ? 'is-active' : ''}`}
                  role="tab"
                  aria-selected={isActive}
                >
                  {type === 'all' ? 'All Events' : type.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction Rows */}
        <div className="ledger-tx-rows">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-muted">
              No blockchain transactions match the query "{search}".
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isExpanded = expandedTx === record.txHash;
              return (
                <div
                  key={record.txHash}
                  className={`ledger-tx-row ${isExpanded ? 'is-expanded' : ''}`}
                  onClick={() => toggleExpand(record.txHash)}
                >
                  {/* Left Icon */}
                  <div className="ledger-tx-icon-box">
                    <Hash className="w-4 h-4" />
                  </div>

                  {/* Primary Info */}
                  <div className="ledger-tx-primary">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {getHumanTitle(record.type)}
                      </strong>
                      <span className="ledger-tx-meta" suppressHydrationWarning>
                        Block #{record.blockNumber.toLocaleString('en-US')} ·{' '}
                        {new Date(record.timestamp).toISOString().slice(0, 16).replace('T', ' ')} UTC
                      </span>
                    </div>

                    <p className="ledger-tx-details">{record.details}</p>

                    <div className="ledger-tx-hashline" style={{ marginTop: '4px' }}>
                      <span className="ledger-tx-hash" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        Tx: {record.txHash.slice(0, 16)}…{record.txHash.slice(-8)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(record.txHash);
                        }}
                        className="text-muted hover:text-amber-500 p-1"
                        title="Copy Tx Hash"
                      >
                        {copiedHash === record.txHash ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Badges & Expand Arrow */}
                  <div className="ledger-tx-badges">
                    <span className="ledger-tx-badge border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                      {record.type.replace(/_/g, ' ')}
                    </span>
                    <span className="ledger-tx-gas" suppressHydrationWarning>
                      {record.gasUsed.toLocaleString('en-US')} gas
                    </span>
                    <button
                      type="button"
                      className="text-muted hover:text-amber-500 mt-1"
                      aria-label={isExpanded ? 'Collapse transaction details' : 'Expand transaction details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable Transaction Drawer */}
                  {isExpanded && (
                    <div
                      className="ledger-tx-drawer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="ledger-drawer-item">
                        <span>Contract Address:</span>
                        <code>{record.contractAddress}</code>
                      </div>
                      <div className="ledger-drawer-item">
                        <span>Cryptographic Data Hash:</span>
                        <code>{record.dataHash}</code>
                      </div>
                      <div className="ledger-drawer-item">
                        <span>Parties Involved:</span>
                        <code className="text-muted">{record.parties?.join(', ') || 'Smart Contract'}</code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
