'use client';

import { useMemo, useState } from 'react';
import {
  Check, CheckCircle2, ChevronRight, ClipboardCheck, FileText,
  MessageSquareText, ShieldCheck, Thermometer, X,
} from 'lucide-react';
import HiveEvidencePanel from '@/components/evidence/HiveEvidencePanel';
import { honeyApi } from '@/lib/api';
import {
  mockAdminStats, mockAIAnalyses, mockBatches, mockBottles, mockHives, mockIoTReadings,
} from '@/lib/mock-data';
import type { BottleSource, HoneyBatch } from '@/lib/types';

type Decision = 'approved' | 'clarification';

function sourceEvidenceFor(batch: HoneyBatch): BottleSource[] {
  const passportSources = mockBottles.flatMap((bottle) => bottle.lineage.sources);
  const linked = passportSources.filter((source) => source.batchId === batch.id || source.hiveIds.includes(batch.hiveId));
  if (linked.length) return linked;

  const hive = mockHives.find((item) => item.id === batch.hiveId);
  return [{
    drumId: `DR-${batch.id.slice(-5)}`,
    drumSealId: `SEAL-${batch.id.slice(-5)}`,
    drumNfcTag: `NFC-${batch.id.slice(-5)}`,
    farmName: batch.farmName,
    farmLocation: 'Phagwara, Punjab',
    farmCoordinates: { lat: 31.224, lng: 75.770 },
    farmRegistrationId: 'PB-FARM-2025-0147',
    farmRegisteredDate: '2025-03-15',
    farmTotalHives: 24,
    farmerId: batch.farmerId,
    farmerName: 'Rajesh Sharma',
    farmerPhone: '+91 98765 43210',
    farmerRating: 4.8,
    farmerTotalBatches: 23,
    farmerSuccessRate: 97.4,
    hiveIds: [batch.hiveId],
    hiveName: batch.hiveName,
    hiveInstalledDate: hive?.installedDate ?? '2025-04-12',
    hiveLastInspection: hive?.lastInspection ?? batch.harvestDate,
    floralSource: batch.floralSource,
    harvestDate: batch.harvestDate,
    harvestMethod: 'Manual Frame Extraction',
    weight: batch.quantity,
    batchId: batch.id,
    aiFraudRisk: 0,
    aiVerified: false,
    sensorHistory: mockIoTReadings,
    hiveHealth: {
      healthScore: hive?.currentHealth ?? 0,
      diseaseRisk: hive?.diseaseRisk ?? 'medium',
      alerts: [],
      recommendation: `${batch.hiveName} was inspected before the submitted harvest record.`,
    },
    media: {
      farmPhoto: batch.images.farm,
      harvestPhoto: batch.images.honey,
      cctvClipUrl: batch.images.cctvClip ?? `/demo/cctv-${batch.id.toLowerCase()}.mp4`,
    },
    iotSnapshot: {
      avgTemperature: batch.iotSnapshot.temperature,
      avgHumidity: batch.iotSnapshot.humidity,
      hiveHealth: hive?.currentHealth ?? 0,
      weightAtHarvest: batch.iotSnapshot.weight,
      moistureContent: batch.iotSnapshot.moisture,
    },
  }];
}

export default function AdminDashboard() {
  const pendingBatches = useMemo(
    () => mockBatches.filter((batch) => batch.status === 'submitted' || batch.status === 'ai_reviewing'),
    [],
  );
  const [selectedId, setSelectedId] = useState(pendingBatches[0]?.id ?? '');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [note, setNote] = useState('');

  const selected = pendingBatches.find((batch) => batch.id === selectedId) ?? pendingBatches[0];
  const analysis = mockAIAnalyses.find((item) => item.batchId === selected?.id);
  const evidence = selected ? sourceEvidenceFor(selected) : [];
  const decision = selected ? decisions[selected.id] : undefined;

  const approve = async () => {
    if (!selected) return;
    setDecisions((current) => ({ ...current, [selected.id]: 'approved' }));
    try {
      await honeyApi.approveBatch(selected.id);
    } catch {
      // The mock workspace remains usable when an optional backend is unavailable.
    }
  };

  const requestClarification = () => {
    if (!selected) return;
    setDecisions((current) => ({ ...current, [selected.id]: 'clarification' }));
  };

  const checks = analysis ? [
    { label: 'Hive continuity', check: analysis.checks.hiveConsistency },
    { label: 'Moisture threshold', check: analysis.checks.moistureCheck },
    { label: 'Declared yield', check: analysis.checks.yieldMatch },
    { label: 'Sensor continuity', check: analysis.checks.sensorConsistency },
    { label: 'Image chronology', check: analysis.checks.imageVerification },
  ] : [];

  if (!selected) {
    return <div className="review-empty"><ClipboardCheck /><h1>No harvest records are waiting for review.</h1></div>;
  }

  return (
    <div className="review-desk animate-fadeUp">
      <header className="review-desk__header">
        <div>
          <p className="review-kicker">Human review desk · Punjab</p>
          <h1>Approve the evidence,<br /><em>not a prediction.</em></h1>
          <p>Start with the underlying hive, camera and harvest records. The automated cross-check is only a second opinion.</p>
        </div>
        <div className="review-desk__principle"><ShieldCheck /><span><strong>Human signature required</strong><small>A reviewer, not a score, authorizes a batch.</small></span></div>
      </header>

      <section className="review-tally" aria-label="Review queue summary">
        <article><span>Waiting for review</span><strong>{mockAdminStats.pendingVerifications}</strong><small>harvest files</small></article>
        <article><span>Reviewed today</span><strong>{mockAdminStats.approvedToday}</strong><small>signed records</small></article>
        <article><span>Needs attention</span><strong>{mockAdminStats.rejectedToday}</strong><small>follow-ups</small></article>
        <article><span>Attached evidence</span><strong>{evidence.length * 4}</strong><small>record families open</small></article>
      </section>

      <div className="review-desk__layout">
        <aside className="review-queue" aria-label="Harvest records waiting for review">
          <div className="review-queue__heading"><p>Review queue</p><span>{pendingBatches.length} records</span></div>
          {pendingBatches.map((batch) => {
            const isCurrent = batch.id === selected.id;
            const currentDecision = decisions[batch.id];
            return (
              <button
                key={batch.id}
                type="button"
                onClick={() => { setSelectedId(batch.id); setNote(''); }}
                className={isCurrent ? 'is-selected' : ''}
              >
                <span className="review-queue__number">{batch.id}</span>
                <strong>{batch.floralSource} honey</strong>
                <small>{batch.hiveName} · {batch.quantity} kg</small>
                {currentDecision && <em>{currentDecision === 'approved' ? 'signed' : 'clarification requested'}</em>}
                <ChevronRight aria-hidden="true" />
              </button>
            );
          })}
        </aside>

        <div className="review-file">
          <section className="review-file__cover">
            <div><p>Harvest record / {selected.id}</p><h2>{selected.floralSource} honey from<br />{selected.hiveName}</h2><small>{selected.farmName} · harvested {new Date(selected.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</small></div>
            <dl><div><dt>Declared weight</dt><dd>{selected.quantity} kg</dd></div><div><dt>Harvest moisture</dt><dd>{selected.iotSnapshot.moisture}%</dd></div><div><dt>Source sensor</dt><dd>{selected.hiveId}</dd></div></dl>
          </section>

          <section className="review-file__section">
            <div className="review-section-heading"><span>01</span><div><h3>Primary source evidence</h3><p>Read these records before making a decision. They are not generated by the assessment model.</p></div></div>
            <HiveEvidencePanel sources={evidence} mode="review" />
          </section>

          <section className="review-file__section review-file__section--split">
            <div>
              <div className="review-section-heading"><span>02</span><div><h3>Harvest declaration</h3><p>The submitted values used for the lot record.</p></div></div>
              <div className="review-declaration">
                <div><Thermometer /><span>Hive temperature</span><strong>{selected.iotSnapshot.temperature}°C</strong></div>
                <div><FileText /><span>Floral source</span><strong>{selected.floralSource}</strong></div>
                <div><CheckCircle2 /><span>Farm registration</span><strong>PB-FARM-2025-0147</strong></div>
              </div>
            </div>

            <div>
              <div className="review-section-heading"><span>03</span><div><h3>Automated cross-check</h3><p>Useful for triage; it cannot approve a batch on its own.</p></div></div>
              <div className="review-crosscheck">
                {checks.map(({ label, check }) => {
                  return <details key={label}><summary><span className={check.passed ? 'is-pass' : 'is-flag'}>{check.passed ? <Check /> : <X />}</span><strong>{label}</strong><small>{check.score}% match</small></summary><p>{check.details}</p></details>;
                })}
                {analysis && <p className="review-crosscheck__note">System note: {analysis.aiInsight}</p>}
              </div>
            </div>
          </section>

          <section className="review-decision">
            <div><MessageSquareText /><div><h3>Reviewer’s note</h3><p>This annotation is stored with the approval decision.</p></div></div>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record what you checked, any exception, or why a follow-up is needed." rows={3} />
            {decision ? (
              <div className={`review-decision__result review-decision__result--${decision}`}><CheckCircle2 /><span><strong>{decision === 'approved' ? 'Record signed by reviewer' : 'Clarification requested from farmer'}</strong><small>{decision === 'approved' ? 'The signed batch can progress to the next custody step.' : 'This file remains open until the requested evidence is received.'}</small></span></div>
            ) : (
              <div className="review-decision__actions"><button type="button" onClick={requestClarification} className="review-decision__ask">Request clarification</button><button type="button" onClick={approve} className="review-decision__approve"><ShieldCheck />Approve this record</button></div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
