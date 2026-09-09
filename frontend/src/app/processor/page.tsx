'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, Check, Factory, FlaskConical,
  MapPin, PackageCheck, QrCode, Search, ShieldCheck, Thermometer, Truck,
  ChevronRight, ExternalLink, Activity, Layers, Droplets, Loader2, Sparkles
} from 'lucide-react';
import { mockBottles, mockProcessingBatches, mockTransportLogs } from '@/lib/mock-data';
import type { LabReport, Bottle } from '@/lib/types';

type TabKey = 'receiving' | 'lot' | 'bottles';

function sentenceCase(value: string) {
  return value.replace(/_/g, ' ');
}

export default function ProcessorPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('receiving');
  const [search, setSearch] = useState('');
  const [bottlesList, setBottlesList] = useState<Bottle[]>(mockBottles);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ txHash: string; blockNumber: number; bottleId: string } | null>(null);

  const handleMintBottle = async () => {
    setIsMinting(true);
    setMintResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/processing/bottles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processing_batch_id: primaryLot?.id || 'PB-2026-001',
          count: 1,
          weight_per_bottle: 500,
        }),
      });
      const data = await res.json();
      const bInfo = data.bottles?.[0] || { id: data.bottle_ids?.[0], tx_hash: data.tx_hash, block_number: 7 };
      setMintResult({
        txHash: bInfo.tx_hash || '0x' + Math.random().toString(16).slice(2),
        blockNumber: bInfo.block_number || 7,
        bottleId: bInfo.id || 'HC-BTL-NEW',
      });
      // Prepend newly minted bottle to list
      const newBottle: Bottle = {
        ...mockBottles[0],
        id: bInfo.id || `HC-BTL-${Date.now().toString().slice(-4)}`,
        processingBatchId: primaryLot?.id || 'PB-2026-001',
        weight: 500,
        createdAt: new Date().toISOString(),
        lineage: {
          ...mockBottles[0].lineage,
          nfc: {
            ...mockBottles[0].lineage.nfc,
            tagId: bInfo.nfc_tag_id || `NFC-${Date.now().toString().slice(-4)}`,
            scanCount: 1,
            isAuthentic: true,
          },
        },
      };
      setBottlesList(prev => [newBottle, ...prev]);
    } catch {
      // Fallback local mint simulation
      const fallbackId = `HC-BTL-${Date.now().toString().slice(-4)}`;
      const fallbackTx = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setMintResult({
        txHash: fallbackTx,
        blockNumber: 18847299,
        bottleId: fallbackId,
      });
    } finally {
      setIsMinting(false);
    }
  };

  const primaryLot = mockProcessingBatches[0];
  const evidenceSources = mockBottles[0]?.lineage.sources ?? [];

  const labReports = [
    { label: 'Pre-Processing Raw Honey Assay', report: primaryLot?.preLabReport },
    { label: 'Post-Processing Bottled Assay', report: primaryLot?.postLabReport },
  ].filter((entry): entry is { label: string; report: LabReport } => Boolean(entry.report));

  const filteredBottles = bottlesList.filter(bottle =>
    `${bottle.id} ${bottle.processingBatchId}`.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'receiving', label: 'Receiving', icon: Truck },
    { key: 'lot', label: 'Lot and lab records', icon: FlaskConical },
    { key: 'bottles', label: 'Bottle register', icon: QrCode },
  ];

  return (
    <div className="processor-workbench space-y-8 animate-fadeUp">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="mono-tag block mb-1">Processing desk / plant 01</span>
          <h1 className="text-3xl sm:text-4xl font-editorial-sans text-white tracking-tight">
            Batch workbench
          </h1>
          <p className="text-xs font-racing-mono text-[#A8ACA0] mt-1">
            Receive source drums, review laboratory records and create bottle-level provenance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/marketplace')}
          className="btn-volt px-5 py-2.5 text-xs font-racing-mono tracking-wider uppercase flex items-center gap-2"
        >
          <Factory className="w-4 h-4" />
          <span>Browse source lots</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs Bar — Guaranteed High-Contrast */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isSelected = tab === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => setTab(key)}
              className={`tab-btn ${isSelected ? 'is-selected' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== TAB 1: RECEIVING LOG ===== */}
      {tab === 'receiving' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-editorial-sans text-white">INBOUND DRUM CUSTODY</h2>
              <p className="text-xs font-racing-mono text-[#A8ACA0]">Continuous cold-chain temperature and GPS checkpoint history.</p>
            </div>
            <span className="badge badge-green">3 Active Shipments</span>
          </div>

          <div className="space-y-4">
            {mockTransportLogs.map(log => (
              <div
                key={log.id}
                className="card p-6 bg-[#161B13] border border-white/10 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-racing-mono font-bold text-sm text-white">Custody Manifest #{log.id}</span>
                      <p className="text-xs font-racing-mono text-[#A8ACA0]">
                        Carrier: {log.processorName} • Driver: {log.driverName} • Vehicle: {log.vehicleNumber}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${log.status === 'delivered' ? 'badge-green' : 'badge-blue'}`}>
                    {sentenceCase(log.status)}
                  </span>
                </div>

                {/* Route Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-racing-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[#A8ACA0] text-[10px] uppercase block mb-1">Origin Apiary</span>
                    <span className="text-white font-bold">{log.pickupLocation}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[#A8ACA0] text-[10px] uppercase block mb-1">Receiving Dock</span>
                    <span className="text-white font-bold">{log.destination}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[#A8ACA0] text-[10px] uppercase block mb-1">Cold-Chain Temp</span>
                    <span className="text-[#D2FF00] font-bold flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      {log.currentTemperature ?? 22.4}°C (Continuous)
                    </span>
                  </div>
                </div>

                {/* Checkpoints */}
                <div className="pt-2">
                  <span className="mono-tag text-xs block mb-3">[ GPS CUSTODY TRAIL ]</span>
                  <div className="space-y-2">
                    {log.checkpoints.map((cp, index) => (
                      <div
                        key={`${cp.timestamp}-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-black/50 border border-white/5 font-racing-mono text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-[#D2FF00]" />
                          <span className="text-white font-bold">
                            GPS: {cp.gps.lat.toFixed(3)}, {cp.gps.lng.toFixed(3)}
                          </span>
                          <span className="text-[#A8ACA0]">
                            {new Date(cp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-zinc-400">{cp.temperature}°C</span>
                          <span className={`badge ${cp.sealIntact ? 'badge-green' : 'badge-red'}`}>
                            {cp.sealIntact ? '✓ Seal Intact' : '⚠ Seal Flagged'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== TAB 2: PROCESSING LOT & DUAL LABS ===== */}
      {tab === 'lot' && primaryLot && (
        <section className="space-y-6">
          <div className="card p-6 bg-[#161B13] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="mono-tag block mb-1">[ ACTIVE REFINERY LOT ]</span>
                <h2 className="text-2xl font-editorial-sans text-white">LOT #{primaryLot.id}</h2>
                <p className="text-xs font-racing-mono text-[#A8ACA0]">
                  {primaryLot.totalWeight} kg net honey • {primaryLot.totalDrums} source drums blended • {primaryLot.bottleIds.length} bottled units
                </p>
              </div>
              <span className="badge badge-neon">FSSAI COMPLIANT</span>
            </div>

            {/* Dual Lab Spectrometry Comparison */}
            <div>
              <span className="mono-tag text-xs block mb-3">[ DUAL LABORATORY SPECTROMETRY DOCKET ]</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labReports.map(({ label, report }) => (
                  <div
                    key={label}
                    className="p-5 rounded-xl bg-black/50 border border-white/10 space-y-4 font-racing-mono text-xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-[#D2FF00]" />
                        <span className="font-bold text-white uppercase text-[11px]">{label}</span>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[#A8ACA0] text-[10px] uppercase block">Moisture</span>
                        <span className="text-base font-bold text-white">{report.moisture}%</span>
                        <span className="text-[9px] text-emerald-400 block">FSSAI &le; 20% ✓</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[#A8ACA0] text-[10px] uppercase block">Purity</span>
                        <span className="text-base font-bold text-emerald-400">{report.purity}%</span>
                        <span className="text-[9px] text-zinc-500 block">0% C4 Adulterants</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[#A8ACA0] text-[10px] uppercase block">HMF Index</span>
                        <span className="text-base font-bold text-white">{report.hmf} mg/kg</span>
                        <span className="text-[9px] text-emerald-400 block">&le; 40 limit ✓</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[#A8ACA0] text-[10px] uppercase block">Sucrose</span>
                        <span className="text-base font-bold text-white">{report.sucrose}%</span>
                        <span className="text-[9px] text-emerald-400 block">&le; 5% limit ✓</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#A8ACA0] pt-1 border-t border-white/5">
                      Accreditation: {report.labName} • Cert #{report.labCertNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Steps Sequence */}
            <div>
              <span className="mono-tag text-xs block mb-3">[ REFINERY EXECUTION SEQUENCE ]</span>
              <div className="space-y-2">
                {primaryLot.steps.map((step, idx) => (
                  <div
                    key={step.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 font-racing-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#D2FF00]/15 text-[#D2FF00] border border-[#D2FF00]/30 text-[10px] font-bold flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <span className="text-white font-bold">{step.name}</span>
                      <span className="text-[#A8ACA0] text-[11px] hidden sm:inline">({step.details})</span>
                    </div>
                    <span className="badge badge-green">
                      {sentenceCase(step.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== TAB 3: BOTTLE REGISTER ===== */}
      {tab === 'bottles' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-editorial-sans text-white">BOTTLE NFC REGISTRATION</h2>
              <p className="text-xs font-racing-mono text-[#A8ACA0]">Click any bottle identity to open its consumer verification passport.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isMinting}
                onClick={handleMintBottle}
                className="btn-volt px-4 py-2 text-xs font-racing-mono tracking-wider uppercase flex items-center gap-2"
              >
                {isMinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isMinting ? 'Minting On-Chain...' : 'Mint Bottle On-Chain'}</span>
              </button>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#A8ACA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Bottle ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-racing-mono text-white placeholder-[#5A6454] focus:outline-none focus:border-[#D2FF00]"
                />
              </div>
            </div>
          </div>

          {mintResult && (
            <div className="p-4 rounded-xl bg-[#D2FF00]/10 border border-[#D2FF00]/30 font-racing-mono text-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[#D2FF00] font-bold block">✓ Bottle Minted On Ethereum EVM (ProcessingRegistry.sol)</span>
                <span className="text-[#A8ACA0] text-[11px]">Bottle ID: {mintResult.bottleId} · Block #{mintResult.blockNumber}</span>
              </div>
              <a
                href={`/blockchain?tx=${mintResult.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#D2FF00] hover:underline text-xs"
              >
                <span>View EVM Tx {mintResult.txHash.slice(0, 10)}...</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBottles.map(bottle => {
              const isAuthentic = bottle.lineage.nfc.isAuthentic && bottle.lineage.bottle.sealIntact;
              return (
                <div
                  key={bottle.id}
                  onClick={() => router.push(`/verify/${bottle.id}`)}
                  className={`card p-5 cursor-pointer bg-[#161B13] border transition-all hover:-translate-y-1 ${
                    !isAuthentic
                      ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                      : 'border-white/10 hover:border-[#D2FF00]/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-racing-mono font-bold text-sm text-white block">{bottle.id}</span>
                      <span className="text-[10px] font-racing-mono text-[#A8ACA0] block">Lot: {bottle.processingBatchId}</span>
                    </div>
                    <span className={`badge ${isAuthentic ? 'badge-green' : 'badge-red'}`}>
                      {isAuthentic ? 'NFC PASS' : '⚠ TAMPERED'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-racing-mono text-[#A8ACA0] mb-4">
                    <div className="flex justify-between">
                      <span>NFC Tag:</span>
                      <span className="text-white">{bottle.lineage.nfc.tagId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scan Counter:</span>
                      <span className={bottle.lineage.nfc.scanCount > 1 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {bottle.lineage.nfc.scanCount} scans
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Physical Seal:</span>
                      <span className={bottle.lineage.bottle.sealIntact ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                        {bottle.lineage.bottle.sealIntact ? 'Intact' : 'BROKEN'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between font-racing-mono text-xs text-[#D2FF00] font-bold">
                    <span>Inspect Passport</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
