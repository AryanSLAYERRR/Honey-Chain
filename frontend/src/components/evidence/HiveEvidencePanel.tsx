'use client';

import { useMemo, useState } from 'react';
import {
  AudioLines, Camera, ChartNoAxesCombined, CircleAlert, FileVideo,
  Thermometer, Droplets, Scale, Waves, Play,
} from 'lucide-react';
import type { BottleSource } from '@/lib/types';
import CCTVVideoModal from './CCTVVideoModal';

type EvidenceMode = 'consumer' | 'review';

function average(values: number[]) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function range(values: number[]) {
  if (!values.length) return '—';
  return `${Math.min(...values).toFixed(1)}–${Math.max(...values).toFixed(1)}`;
}

function SignalTrace({ values }: { values: number[] }) {
  const points = useMemo(() => {
    if (!values.length) return '';
    const low = Math.min(...values);
    const high = Math.max(...values);
    const spread = high - low || 1;
    return values.map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 30 - ((value - low) / spread) * 22;
      return `${x},${y}`;
    }).join(' ');
  }, [values]);

  return (
    <svg className="evidence-trace" viewBox="0 0 100 36" preserveAspectRatio="none" aria-label="Recorded signal trace" role="img">
      <path d="M0 30H100" />
      <polyline points={points} />
    </svg>
  );
}

export default function HiveEvidencePanel({
  sources,
  mode = 'consumer',
}: {
  sources: BottleSource[];
  mode?: EvidenceMode;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCCTVOpen, setIsCCTVOpen] = useState(false);
  const source = sources[selectedIndex] ?? sources[0];

  if (!source) {
    return <p className="evidence-empty">No hive evidence was attached to this record.</p>;
  }

  const temperatures = source.sensorHistory.map((reading) => reading.temperature);
  const humidity = source.sensorHistory.map((reading) => reading.humidity);
  const acoustic = source.sensorHistory.map((reading) => reading.soundLevel);
  const highActivity = source.sensorHistory.filter((reading) => reading.activity === 'high').length;
  const firstReading = source.sensorHistory[0];
  const lastReading = source.sensorHistory.at(-1);
  const cameraRef = source.media.cctvClipUrl?.split('/').at(-1) ?? 'no camera record attached';

  return (
    <section className={`hive-evidence hive-evidence--${mode}`} aria-label="Hive evidence">
      <div className="hive-evidence__intro">
        <div>
          <p className="evidence-kicker">Primary records · not an automated score</p>
          <h3>Hive conditions at harvest</h3>
          <p>Four recorded signals, a camera reference and the full sensor window are attached to this source.</p>
        </div>
        <div className="evidence-count"><strong>{sources.length}</strong><span>source {sources.length === 1 ? 'drum' : 'drums'}</span></div>
      </div>

      {sources.length > 1 && (
        <div className="evidence-source-wrapper">
          <div className="evidence-source-header">
            <span className="evidence-source-hint">Select a source hive to view telemetry ({sources.length} drums attached to this lot · scroll sideways for all):</span>
          </div>
          <div className="evidence-source-list" role="tablist" aria-label="Source drum records" tabIndex={0}>
            {sources.map((item, index) => (
              <button
                key={item.drumId}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
                className={selectedIndex === index ? 'is-selected' : ''}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.hiveName}</strong>
                <small>{item.farmName} · {item.weight} kg</small>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="evidence-record-scroll" tabIndex={0} aria-label="Scroll sideways to inspect hive telemetry">
      <div className="evidence-record">
        <div className="evidence-record__heading">
          <div>
            <p>{source.farmName} · {source.farmLocation}</p>
            <h4>{source.hiveName} <span>/{source.drumId}</span></h4>
          </div>
          <p className="evidence-record__ref">Harvested {new Date(source.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · batch {source.batchId}</p>
        </div>

        <div className="evidence-metrics" aria-label="Harvest signal summary">
          <article>
            <Thermometer aria-hidden="true" />
            <span>Temperature</span>
            <strong>{source.iotSnapshot.avgTemperature.toFixed(1)}°C</strong>
            <small>{range(temperatures)}°C recorded range</small>
          </article>
          <article>
            <Droplets aria-hidden="true" />
            <span>Humidity</span>
            <strong>{source.iotSnapshot.avgHumidity.toFixed(0)}%</strong>
            <small>{range(humidity)}% recorded range</small>
          </article>
          <article>
            <AudioLines aria-hidden="true" />
            <span>Hive acoustics</span>
            <strong>{average(acoustic).toFixed(0)} dB</strong>
            <small>{range(acoustic)} dB · {highActivity} high activity samples</small>
          </article>
          <article>
            <Scale aria-hidden="true" />
            <span>Harvest weight</span>
            <strong>{source.iotSnapshot.weightAtHarvest.toFixed(1)} kg</strong>
            <small>Moisture {source.iotSnapshot.moistureContent.toFixed(1)}% · drum {source.weight} kg</small>
          </article>
        </div>

        <div className="evidence-supporting-records">
          <article
            className="evidence-camera-record"
            onClick={() => setIsCCTVOpen(true)}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            title="Click to play CCTV audit recording"
            role="button"
            tabIndex={0}
          >
            <div className="evidence-camera-record__icon"><Camera aria-hidden="true" /></div>
            <div>
              <p>Harvest camera record</p>
              <h5>CCTV footage was attached to this harvest</h5>
              <small>Record reference: {cameraRef} · linked to {source.drumId}</small>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', color: '#fbb638', fontSize: '0.74rem', fontWeight: 600 }}>
                <Play size={12} fill="#fbb638" />
                <span>Play audit clip (15s CCTV)</span>
              </div>
            </div>
            <FileVideo aria-hidden="true" />
          </article>
          <article className="evidence-health-record">
            <Waves aria-hidden="true" />
            <div><span>Hive health at harvest</span><strong>{source.hiveHealth.healthScore}%</strong></div>
            <p>{source.hiveHealth.recommendation}</p>
          </article>
        </div>

        <details className="evidence-details">
          <summary>Open full sensor history and audit notes</summary>
          <div className="evidence-traces">
            <div><span>Temperature trace</span><SignalTrace values={temperatures} /></div>
            <div><span>Humidity trace</span><SignalTrace values={humidity} /></div>
            <div><span>Acoustic trace</span><SignalTrace values={acoustic} /></div>
            <div><span>Weight trace</span><SignalTrace values={source.sensorHistory.map((reading) => reading.weight)} /></div>
          </div>
          <div className="evidence-audit-lines">
            <span><ChartNoAxesCombined aria-hidden="true" /> Signal window {firstReading ? new Date(firstReading.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}–{lastReading ? new Date(lastReading.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</span>
            <span><CircleAlert aria-hidden="true" /> {source.hiveHealth.alerts.length ? source.hiveHealth.alerts.join(' · ') : 'No health alerts recorded for this source'}</span>
          </div>
        </details>
      </div>
      </div>

      {/* CCTV Video Audit Lightbox Modal */}
      <CCTVVideoModal
        isOpen={isCCTVOpen}
        onClose={() => setIsCCTVOpen(false)}
        cameraRef={cameraRef}
        drumId={source.drumId}
        farmName={source.farmName}
        harvestDate={new Date(source.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      />
    </section>
  );
}
