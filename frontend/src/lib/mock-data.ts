// ==========================================
// HONEYCHAIN — Mock Data for POC Demo
// Deep Transparency Edition
// ==========================================

import type {
  User, Farm, Hive, IoTReading, HoneyBatch, AIAnalysis,
  Drum, TransportLog, ProcessingBatch, Bottle, MarketplaceListing,
  BlockchainRecord, HiveAIInsight, FarmerStats, AdminStats, Notification,
  LabReport, DrumSource, BottleLineage
} from './types';

// ---- Pre-generated realistic Ethereum-style hashes ----
const TX_HASHES: Record<number, string> = {
  1:  '0x8a3f72c1d4e5b90612fa8c3e7d1b4a5f9e2c8d6b3a7f1e4d9c2b5a8f3e6d1c4b',
  2:  '0x1b7e4d9f2a5c8e3d6b1f4a7c9e2d5b8f3a6c1d4e7b9f2a5d8c3e6b1f4a7d9c2e',
  4:  '0x3c9f1e4d7b2a5c8e6d3f9a1b4c7e2d5f8a3b6c9d1e4f7a2b5c8d3e6f9a1b4c7d',
  5:  '0x4d2e7f1a5b8c3d6e9f2a4b7c1d5e8f3a6b9c2d4e7f1a3b6c8d2e5f9a1b4c7d3e',
  10: '0x5e3f8a2b6c9d1e4f7a3b5c8d2e6f9a1b4c7d3e8f2a5b9c1d4e7f3a6b8c2d5e9f',
  15: '0x6f4a9b3c7d2e5f8a1b4c6d9e3f7a2b5c8d1e4f9a3b6c7d2e5f8a1b4c9d3e6f7a',
  20: '0x7a5b1c4d8e3f6a9b2c5d7e1f4a8b3c6d9e2f5a7b1c4d8e3f6a9b2c5d7e1f4a8b',
  30: '0x8b6c2d5e9f4a7b1c3d6e8f2a5b9c1d4e7f3a6b8c2d5e9f4a7b1c3d6e8f2a5b9c',
  31: '0x9c7d3e6f1a5b8c2d4e7f9a3b6c8d1e5f2a4b7c9d3e6f1a5b8c2d4e7f9a3b6c8d',
  35: '0xa1d8e4f7b2c5a9d3e6f8b1c4a7d2e5f9b3c6a8d1e4f7b2c5a9d3e6f8b1c4a7d2',
  40: '0xb2e9f5a8c3d6b1e4f7a2c5d9b3e6f8a1c4d7b2e5f9a3c6d8b1e4f7a2c5d9b3e6',
  45: '0xc3f1a6b9d4e7c2f5a8b3d6e9c1f4a7b2d5e8c3f6a9b1d4e7c2f5a8b3d6e9c1f4',
};
const txHash = (i: number): string => TX_HASHES[i] || `0x${Array.from({length: 64}, (_, k) => '0123456789abcdef'[(i * 7 + k * 13) % 16]).join('')}`;

const CONTRACT_ADDRS: Record<number, string> = {
  1: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
  2: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  3: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  4: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
};
const contractAddr = (i: number): string => CONTRACT_ADDRS[i] || `0x${Array.from({length: 40}, (_, k) => '0123456789abcdef'[(i * 11 + k * 17) % 16]).join('')}`;

// ==========================================
// USERS (consolidated: no separate producer/transporter)
// ==========================================
export const mockUsers: Record<string, User> = {
  farmer: {
    id: 'USR-F001',
    name: 'Rajesh Sharma',
    role: 'farmer',
    email: 'rajesh@honeychain.in',
    phone: '+91 98765 43210',
    avatar: '/avatars/farmer.jpg',
  },
  admin: {
    id: 'USR-A001',
    name: 'Priya Verma',
    role: 'admin',
    email: 'priya@honeychain.in',
    phone: '+91 98765 43211',
  },
  processor: {
    id: 'USR-PR001',
    name: 'Golden Valley Processing',
    role: 'processor',
    email: 'ops@goldenvalley.in',
    phone: '+91 98765 43214',
  },
  consumer: {
    id: 'USR-C001',
    name: 'Consumer',
    role: 'consumer',
    email: 'consumer@example.com',
    phone: '+91 98765 00000',
  },
};

// ==========================================
// FARMS
// ==========================================
export const mockFarms: Farm[] = [
  {
    id: 'FARM-001',
    name: 'Sharma Apiary',
    farmerId: 'USR-F001',
    location: 'Phagwara, Punjab',
    state: 'Punjab',
    district: 'Kapurthala',
    coordinates: { lat: 31.224, lng: 75.770 },
    totalHives: 24,
    activeHives: 22,
    registeredDate: '2025-03-15',
  },
  {
    id: 'FARM-002',
    name: 'Kaur Bee Farm',
    farmerId: 'USR-F002',
    location: 'Jalandhar, Punjab',
    state: 'Punjab',
    district: 'Jalandhar',
    coordinates: { lat: 31.326, lng: 75.576 },
    totalHives: 18,
    activeHives: 16,
    registeredDate: '2025-06-01',
  },
  {
    id: 'FARM-003',
    name: 'Himalayan Apiaries',
    farmerId: 'USR-F003',
    location: 'Shimla, Himachal Pradesh',
    state: 'Himachal Pradesh',
    district: 'Shimla',
    coordinates: { lat: 31.105, lng: 77.172 },
    totalHives: 30,
    activeHives: 28,
    registeredDate: '2024-11-20',
  },
];

// ==========================================
// HIVES
// ==========================================
export const mockHives: Hive[] = [
  {
    id: 'HIVE-016',
    farmId: 'FARM-001',
    name: 'Hive H-016',
    status: 'active',
    installedDate: '2025-04-10',
    lastInspection: '2026-09-01',
    currentHealth: 96,
    diseaseRisk: 'low',
    predictedYield: 48.5,
    floralSource: 'Mustard',
  },
  {
    id: 'HIVE-017',
    farmId: 'FARM-001',
    name: 'Hive H-017',
    status: 'active',
    installedDate: '2025-04-10',
    lastInspection: '2026-09-02',
    currentHealth: 89,
    diseaseRisk: 'low',
    predictedYield: 41.2,
    floralSource: 'Mustard',
  },
  {
    id: 'HIVE-018',
    farmId: 'FARM-001',
    name: 'Hive H-018',
    status: 'alert',
    installedDate: '2025-05-20',
    lastInspection: '2026-09-03',
    currentHealth: 72,
    diseaseRisk: 'medium',
    predictedYield: 29.8,
    floralSource: 'Eucalyptus',
  },
  {
    id: 'HIVE-019',
    farmId: 'FARM-001',
    name: 'Hive H-019',
    status: 'active',
    installedDate: '2025-04-12',
    lastInspection: '2026-09-04',
    currentHealth: 94,
    diseaseRisk: 'low',
    predictedYield: 53.2,
    floralSource: 'Mustard',
  },
  {
    id: 'HIVE-020',
    farmId: 'FARM-001',
    name: 'Hive H-020',
    status: 'active',
    installedDate: '2025-06-01',
    lastInspection: '2026-09-01',
    currentHealth: 91,
    diseaseRisk: 'low',
    predictedYield: 44.0,
    floralSource: 'Litchi',
  },
  {
    id: 'HIVE-021',
    farmId: 'FARM-001',
    name: 'Hive H-021',
    status: 'maintenance',
    installedDate: '2025-05-15',
    lastInspection: '2026-08-28',
    currentHealth: 58,
    diseaseRisk: 'high',
    predictedYield: 15.0,
    floralSource: 'Jamun',
  },
];

// ==========================================
// IoT READINGS (time-series for HIVE-019)
// ==========================================
function generateIoTReadings(hiveId: string, days: number): IoTReading[] {
  const readings: IoTReading[] = [];
  const baseDate = new Date('2026-09-01T06:00:00');
  for (let d = 0; d < days; d++) {
    for (let h = 0; h < 24; h += 4) {
      const ts = new Date(baseDate);
      ts.setDate(ts.getDate() + d);
      ts.setHours(h);
      const dayVariation = Math.sin((h / 24) * Math.PI) * 3;
      readings.push({
        id: `IOT-${hiveId}-${d}-${h}`,
        hiveId,
        timestamp: ts.toISOString(),
        temperature: 33.5 + dayVariation + Math.sin(d * 13 + h * 7) * 0.75,
        humidity: 60 + Math.cos(d * 11 + h * 5) * 4,
        weight: 42 + d * 0.15 + Math.sin(d * 17 + h) * 0.25,
        soundLevel: 45 + Math.cos(d * 19 + h * 3) * 5,
        activity: h >= 8 && h <= 18 ? 'high' : h >= 6 && h <= 20 ? 'medium' : 'low',
        batteryLevel: 95 - d * 0.5,
      });
    }
  }
  return readings;
}

export const mockIoTReadings = generateIoTReadings('HIVE-019', 7);

// ==========================================
// HIVE AI INSIGHTS
// ==========================================
export const mockHiveInsights: HiveAIInsight[] = [
  {
    hiveId: 'HIVE-018',
    timestamp: '2026-09-05T14:30:00Z',
    healthScore: 72,
    diseaseRisk: 'medium',
    predictedYield: 29.8,
    alerts: [
      'Temperature fluctuations detected over last 72 hours',
      'Weight gain below expected rate',
    ],
    recommendation: 'Hive H-018 shows signs of early-stage stress. Colony activity has decreased 23% compared to baseline. Recommend physical inspection within 48 hours to check for Varroa mite presence or queen health issues.',
  },
  {
    hiveId: 'HIVE-019',
    timestamp: '2026-09-05T14:30:00Z',
    healthScore: 94,
    diseaseRisk: 'low',
    predictedYield: 53.2,
    alerts: [],
    recommendation: 'Hive H-019 is performing excellently. Weight gain trajectory suggests harvest readiness within 7-10 days. Colony activity is 15% above average for the season.',
  },
  {
    hiveId: 'HIVE-021',
    timestamp: '2026-09-05T14:30:00Z',
    healthScore: 58,
    diseaseRisk: 'high',
    predictedYield: 15.0,
    alerts: [
      'Significant drop in colony sound frequency detected',
      'Weight has decreased 8% in 5 days',
      'Temperature regulation appears compromised',
    ],
    recommendation: 'URGENT: Hive H-021 shows multiple indicators of colony distress. Acoustic analysis suggests possible queenless state. Immediate inspection required. Consider combining with a healthy colony if queen loss is confirmed.',
  },
];

// ==========================================
// HONEY BATCHES
// ==========================================
export const mockBatches: HoneyBatch[] = [
  {
    id: 'HC-00190',
    farmerId: 'USR-F001',
    farmName: 'Sharma Apiary',
    hiveId: 'HIVE-016',
    hiveName: 'Hive H-016',
    floralSource: 'Mustard',
    harvestDate: '2026-08-20',
    quantity: 280,
    status: 'bottled',
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-09-01T16:00:00Z',
    images: {},
    iotSnapshot: { temperature: 34.0, humidity: 59, weight: 41.2, moisture: 18.2 },
    blockchainTxHash: txHash(1),
    price: 320,
  },
  {
    id: 'HC-00191',
    farmerId: 'USR-F001',
    farmName: 'Sharma Apiary',
    hiveId: 'HIVE-017',
    hiveName: 'Hive H-017',
    floralSource: 'Mustard',
    harvestDate: '2026-08-28',
    quantity: 250,
    status: 'in_transit',
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    images: {},
    iotSnapshot: { temperature: 33.8, humidity: 61, weight: 39.8, moisture: 18.8 },
    blockchainTxHash: txHash(2),
    price: 310,
  },
  {
    id: 'HC-00192',
    farmerId: 'USR-F001',
    farmName: 'Sharma Apiary',
    hiveId: 'HIVE-019',
    hiveName: 'Hive H-019',
    floralSource: 'Mustard',
    harvestDate: '2026-09-06',
    quantity: 300,
    status: 'submitted',
    createdAt: '2026-09-06T06:00:00Z',
    updatedAt: '2026-09-06T06:00:00Z',
    images: {
      honey: '/demo/honey-sample.jpg',
      farm: '/demo/farm-view.jpg',
      cctvClip: '/demo/cctv-harvest-sep06.mp4',
    },
    iotSnapshot: { temperature: 34.1, humidity: 61, weight: 42.8, moisture: 18.6 },
    price: 330,
  },
  {
    id: 'HC-00193',
    farmerId: 'USR-F001',
    farmName: 'Sharma Apiary',
    hiveId: 'HIVE-020',
    hiveName: 'Hive H-020',
    floralSource: 'Litchi',
    harvestDate: '2026-09-04',
    quantity: 180,
    status: 'verified',
    createdAt: '2026-09-04T07:00:00Z',
    updatedAt: '2026-09-05T14:00:00Z',
    images: {},
    iotSnapshot: { temperature: 33.5, humidity: 63, weight: 38.5, moisture: 19.1 },
    blockchainTxHash: txHash(4),
    price: 380,
  },
];

// ==========================================
// AI ANALYSES
// ==========================================
export const mockAIAnalyses: AIAnalysis[] = [
  {
    id: 'AI-00192',
    batchId: 'HC-00192',
    timestamp: '2026-09-06T06:05:00Z',
    checks: {
      hiveConsistency: { passed: true, score: 97, details: 'Hive records match historical patterns. Colony size and activity consistent with expected output.' },
      imageVerification: { passed: true, score: 94, details: 'Honey color and viscosity match mustard honey profile. No signs of adulteration detected in visual analysis.' },
      moistureCheck: { passed: true, score: 96, details: 'Moisture at 18.6% — within FSSAI standard (≤20%). Optimal for long-term storage.' },
      sensorConsistency: { passed: true, score: 98, details: 'IoT sensor readings are internally consistent. No anomalous spikes or data gaps detected.' },
      yieldMatch: { passed: true, score: 91, details: 'Declared quantity of 300 kg aligns with hive weight delta and historical yield for this hive.' },
    },
    fraudRisk: 2.4,
    recommendation: 'approve',
    aiInsight: 'Batch HC-00192 shows excellent quality indicators across all verification parameters. The mustard honey profile is consistent with the declared floral source and the Punjab harvest season. Recommend approval.',
  },
  {
    id: 'AI-00193',
    batchId: 'HC-00193',
    timestamp: '2026-09-05T12:00:00Z',
    checks: {
      hiveConsistency: { passed: true, score: 93, details: 'Hive patterns nominal.' },
      imageVerification: { passed: true, score: 89, details: 'Litchi honey color profile matches expectations.' },
      moistureCheck: { passed: true, score: 88, details: 'Moisture at 19.1% — acceptable but on higher end.' },
      sensorConsistency: { passed: true, score: 95, details: 'All sensors reporting normally.' },
      yieldMatch: { passed: true, score: 90, details: 'Yield consistent with hive capacity.' },
    },
    fraudRisk: 5.1,
    recommendation: 'approve',
    aiInsight: 'Batch HC-00193 is litchi honey with slightly higher moisture but within acceptable limits. Quality is good.',
  },
];

// ==========================================
// DRUMS (with NFC anti-counterfeiting)
// ==========================================
export const mockDrums: Drum[] = [
  {
    id: 'DR-00919', batchId: 'HC-00190', farmId: 'FARM-001', farmName: 'Sharma Apiary',
    hiveIds: ['HIVE-016'], weight: 140, sealId: 'SEAL-A1001', sealIntact: true,
    nfcTagId: 'NFC-DR-00919', nfcCryptogram: '0xA7B3C9D1E5F2', status: 'opened', currentHolder: 'USR-PR001',
  },
  {
    id: 'DR-00920', batchId: 'HC-00190', farmId: 'FARM-001', farmName: 'Sharma Apiary',
    hiveIds: ['HIVE-016'], weight: 140, sealId: 'SEAL-A1002', sealIntact: true,
    nfcTagId: 'NFC-DR-00920', nfcCryptogram: '0xB8C4D2E6F3A1', status: 'opened', currentHolder: 'USR-PR001',
  },
  {
    id: 'DR-00921', batchId: 'HC-00191', farmId: 'FARM-001', farmName: 'Sharma Apiary',
    hiveIds: ['HIVE-017'], weight: 125, sealId: 'SEAL-A1003', sealIntact: true,
    nfcTagId: 'NFC-DR-00921', nfcCryptogram: '0xC9D5E3F7A2B4', status: 'in_transit', currentHolder: 'USR-PR001',
  },
  {
    id: 'DR-00922', batchId: 'HC-00191', farmId: 'FARM-001', farmName: 'Sharma Apiary',
    hiveIds: ['HIVE-017'], weight: 125, sealId: 'SEAL-A1004', sealIntact: true,
    nfcTagId: 'NFC-DR-00922', nfcCryptogram: '0xD1E6F4A8B3C5', status: 'in_transit', currentHolder: 'USR-PR001',
  },
  // Additional drums from other farms for the 30-barrel lot demonstration
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `DR-00${923 + i}`,
    batchId: i < 4 ? 'HC-EXT-001' : 'HC-EXT-002',
    farmId: i < 4 ? 'FARM-002' : 'FARM-003',
    farmName: i < 4 ? 'Kaur Bee Farm' : 'Himalayan Apiaries',
    hiveIds: i < 4 ? ['HIVE-K' + (i + 1).toString().padStart(3, '0')] : ['HIVE-H' + (i - 3).toString().padStart(3, '0')],
    weight: 100 + ((i * 13 + 7) % 51),
    sealId: `SEAL-A${1005 + i}`,
    sealIntact: true,
    nfcTagId: `NFC-DR-00${923 + i}`,
    nfcCryptogram: `0x${(923 + i).toString(16).toUpperCase().padStart(12, '0')}`,
    status: 'opened' as const,
    currentHolder: 'USR-PR001',
  })),
];

// ==========================================
// TRANSPORT LOGS (managed by Processor, not a separate role)
// ==========================================
export const mockTransportLogs: TransportLog[] = [
  {
    id: 'TRN-00412',
    drumIds: ['DR-00921', 'DR-00922'],
    processorId: 'USR-PR001',
    processorName: 'Golden Valley Processing',
    pickupLocation: 'Sharma Apiary, Phagwara',
    pickupCoordinates: { lat: 31.224, lng: 75.770 },
    destination: 'Golden Valley Processing, Ludhiana',
    destinationCoordinates: { lat: 30.901, lng: 75.857 },
    status: 'in_transit',
    vehicleNumber: 'PB-10-AB-1234',
    driverName: 'Vikram Singh',
    driverPhone: '+91 98765 43213',
    pickedUpAt: '2026-09-04T10:30:00Z',
    currentGPS: { lat: 31.052, lng: 75.812 },
    currentTemperature: 29.3,
    checkpoints: [
      {
        timestamp: '2026-09-04T10:30:00Z',
        gps: { lat: 31.224, lng: 75.770 },
        temperature: 28.1,
        sealIntact: true,
        note: 'Drums picked up. Seals verified.',
      },
      {
        timestamp: '2026-09-04T12:00:00Z',
        gps: { lat: 31.152, lng: 75.790 },
        temperature: 29.0,
        sealIntact: true,
      },
      {
        timestamp: '2026-09-04T14:00:00Z',
        gps: { lat: 31.052, lng: 75.812 },
        temperature: 29.3,
        sealIntact: true,
      },
    ],
    blockchainTxHash: txHash(10),
  },
  {
    id: 'TRN-00411',
    drumIds: ['DR-00919', 'DR-00920'],
    processorId: 'USR-PR001',
    processorName: 'Golden Valley Processing',
    pickupLocation: 'Sharma Apiary, Phagwara',
    pickupCoordinates: { lat: 31.224, lng: 75.770 },
    destination: 'Golden Valley Processing, Ludhiana',
    destinationCoordinates: { lat: 30.901, lng: 75.857 },
    status: 'delivered',
    vehicleNumber: 'PB-10-AB-1234',
    driverName: 'Vikram Singh',
    driverPhone: '+91 98765 43213',
    pickedUpAt: '2026-08-24T09:00:00Z',
    deliveredAt: '2026-08-25T14:00:00Z',
    checkpoints: [
      {
        timestamp: '2026-08-24T09:00:00Z',
        gps: { lat: 31.224, lng: 75.770 },
        temperature: 27.5,
        sealIntact: true,
        note: 'Drums picked up.',
      },
      {
        timestamp: '2026-08-25T14:00:00Z',
        gps: { lat: 30.901, lng: 75.857 },
        temperature: 28.2,
        sealIntact: true,
        note: 'Delivered to processor. Seals intact.',
      },
    ],
    blockchainTxHash: txHash(15),
  },
];

// ==========================================
// LAB REPORTS (DUAL: pre-processing & post-processing)
// ==========================================
const mockPreLabReport: LabReport = {
  id: 'LAB-PRE-00481',
  type: 'pre_processing',
  processingBatchId: 'PB-00481',
  moisture: 18.4,
  purity: 98.5,
  hmf: 14.2,
  diastase: 11.8,
  sucrose: 3.2,
  fructoseGlucoseRatio: 1.08,
  color: 'Light Amber',
  taste: 'Floral, mild sweetness with mustard undertones',
  adulterants: [],
  pesticides: [],
  antibiotics: [],
  passed: true,
  testedAt: '2026-09-01T10:00:00Z',
  labName: 'Punjab State Food Testing Lab',
  labCertNumber: 'PSFTA-2026-4821',
  blockchainTxHash: txHash(40),
};

const mockPostLabReport: LabReport = {
  id: 'LAB-POST-00481',
  type: 'post_processing',
  processingBatchId: 'PB-00481',
  moisture: 17.8,
  purity: 99.2,
  hmf: 12.5,
  diastase: 12.1,
  sucrose: 2.8,
  fructoseGlucoseRatio: 1.10,
  color: 'Light Amber',
  taste: 'Floral, mild sweetness — refined consistency',
  adulterants: [],
  pesticides: [],
  antibiotics: [],
  passed: true,
  testedAt: '2026-09-02T14:00:00Z',
  labName: 'Punjab State Food Testing Lab',
  labCertNumber: 'PSFTA-2026-4822',
  blockchainTxHash: txHash(45),
};

// ==========================================
// BOTTLE SOURCES — deeply enriched per-barrel data
// ==========================================
function generateSensorHistory(hiveId: string, days: number) {
  const readings = [];
  const base = new Date('2026-08-01T06:00:00');
  for (let d = 0; d < days; d++) {
    for (let h = 0; h < 24; h += 6) {
      const ts = new Date(base);
      ts.setDate(ts.getDate() + d);
      ts.setHours(h);
      const dayVar = Math.sin((h / 24) * Math.PI) * 2.5;
      readings.push({
        timestamp: ts.toISOString(),
        temperature: 33.2 + dayVar + Math.sin(d * 13 + h * 5) * 0.6,
        humidity: 58 + Math.cos(d * 7 + h * 3) * 3,
        weight: 40 + d * 0.2 + Math.sin(d * 11 + h) * 0.15,
        soundLevel: 42 + Math.cos(d * 17 + h * 2) * 4,
        activity: (h >= 8 && h <= 18 ? 'high' : h >= 6 && h <= 20 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      });
    }
  }
  return readings;
}

const bottleSources: BottleLineage['sources'] = [
  // ---- Sharma Apiary drums (2) ----
  {
    drumId: 'DR-00919', drumSealId: 'SEAL-A1001', drumNfcTag: 'NFC-DR-00919',
    farmName: 'Sharma Apiary', farmLocation: 'Phagwara, Punjab',
    farmCoordinates: { lat: 31.224, lng: 75.770 },
    farmRegistrationId: 'PB-FARM-2025-0147', farmRegisteredDate: '2025-03-15', farmTotalHives: 24,
    farmerId: 'USR-F001', farmerName: 'Rajesh Sharma', farmerPhone: '+91 98765 43210',
    farmerRating: 4.8, farmerTotalBatches: 23, farmerSuccessRate: 97.4,
    hiveIds: ['HIVE-016'], hiveName: 'Hive H-016',
    hiveInstalledDate: '2025-04-10', hiveLastInspection: '2026-08-18',
    floralSource: 'Mustard', harvestDate: '2026-08-20', harvestMethod: 'Manual Frame Extraction',
    weight: 140, batchId: 'HC-00190', aiFraudRisk: 1.8, aiVerified: true,
    sensorHistory: generateSensorHistory('HIVE-016', 20),
    hiveHealth: {
      healthScore: 96, diseaseRisk: 'low', alerts: [],
      recommendation: 'Hive H-016 is in excellent health. Colony activity 15% above seasonal average. Recommended for continued production.',
    },
    media: {
      farmPhoto: '/demo/sharma-apiary-aerial.jpg',
      hivePhoto: '/demo/hive-016-closeup.jpg',
      cctvClipUrl: '/demo/cctv-harvest-aug20.mp4',
      cctvThumbnail: '/demo/cctv-thumb-aug20.jpg',
      harvestPhoto: '/demo/harvest-aug20-frames.jpg',
    },
    iotSnapshot: { avgTemperature: 34.0, avgHumidity: 59, hiveHealth: 96, weightAtHarvest: 42.8, moistureContent: 18.2 },
  },
  {
    drumId: 'DR-00920', drumSealId: 'SEAL-A1002', drumNfcTag: 'NFC-DR-00920',
    farmName: 'Sharma Apiary', farmLocation: 'Phagwara, Punjab',
    farmCoordinates: { lat: 31.224, lng: 75.770 },
    farmRegistrationId: 'PB-FARM-2025-0147', farmRegisteredDate: '2025-03-15', farmTotalHives: 24,
    farmerId: 'USR-F001', farmerName: 'Rajesh Sharma', farmerPhone: '+91 98765 43210',
    farmerRating: 4.8, farmerTotalBatches: 23, farmerSuccessRate: 97.4,
    hiveIds: ['HIVE-017'], hiveName: 'Hive H-017',
    hiveInstalledDate: '2025-04-10', hiveLastInspection: '2026-08-19',
    floralSource: 'Mustard', harvestDate: '2026-08-20', harvestMethod: 'Manual Frame Extraction',
    weight: 140, batchId: 'HC-00190', aiFraudRisk: 2.1, aiVerified: true,
    sensorHistory: generateSensorHistory('HIVE-017', 20),
    hiveHealth: {
      healthScore: 89, diseaseRisk: 'low', alerts: [],
      recommendation: 'Hive H-017 showing healthy colony patterns. Minor weight dip on day 12 likely due to foraging disruption from rainfall.',
    },
    media: {
      farmPhoto: '/demo/sharma-apiary-aerial.jpg',
      hivePhoto: '/demo/hive-017-closeup.jpg',
      cctvClipUrl: '/demo/cctv-harvest-aug20.mp4',
      cctvThumbnail: '/demo/cctv-thumb-aug20.jpg',
      harvestPhoto: '/demo/harvest-aug20-frames.jpg',
    },
    iotSnapshot: { avgTemperature: 33.8, avgHumidity: 61, hiveHealth: 89, weightAtHarvest: 39.8, moistureContent: 18.8 },
  },
  // ---- Kaur Bee Farm drums (4) ----
  ...Array.from({ length: 4 }, (_, i) => ({
    drumId: `DR-00${923 + i}`, drumSealId: `SEAL-A${1003 + i}`, drumNfcTag: `NFC-DR-00${923 + i}`,
    farmName: 'Kaur Bee Farm', farmLocation: 'Jalandhar, Punjab',
    farmCoordinates: { lat: 31.326, lng: 75.576 },
    farmRegistrationId: 'PB-FARM-2025-0312', farmRegisteredDate: '2025-06-01', farmTotalHives: 18,
    farmerId: 'USR-F002', farmerName: 'Harpreet Kaur', farmerPhone: '+91 98765 43220',
    farmerRating: 4.5, farmerTotalBatches: 14, farmerSuccessRate: 92.1,
    hiveIds: [`HIVE-K${(i + 1).toString().padStart(3, '0')}`],
    hiveName: `Hive K-${(i + 1).toString().padStart(3, '0')}`,
    hiveInstalledDate: '2025-07-15', hiveLastInspection: '2026-08-22',
    floralSource: 'Eucalyptus', harvestDate: '2026-08-22', harvestMethod: 'Centrifugal Extraction',
    weight: 105 + i * 12, batchId: 'HC-EXT-001',
    aiFraudRisk: 3.2 + i * 0.4, aiVerified: true,
    sensorHistory: generateSensorHistory(`HIVE-K${(i + 1).toString().padStart(3, '0')}`, 18),
    hiveHealth: {
      healthScore: 86 + i * 2, diseaseRisk: 'low' as const,
      alerts: i === 2 ? ['Minor humidity spike detected on Aug 15'] : [],
      recommendation: `Hive K-${(i + 1).toString().padStart(3, '0')} is performing within normal parameters for eucalyptus source.`,
    },
    media: {
      farmPhoto: '/demo/kaur-farm-view.jpg',
      hivePhoto: `/demo/hive-k${(i + 1).toString().padStart(3, '0')}.jpg`,
      cctvClipUrl: '/demo/cctv-kaur-harvest.mp4',
      cctvThumbnail: '/demo/cctv-thumb-kaur.jpg',
      harvestPhoto: '/demo/harvest-kaur-aug22.jpg',
    },
    iotSnapshot: { avgTemperature: 33.2 + i * 0.2, avgHumidity: 58 + i, hiveHealth: 86 + i * 2, weightAtHarvest: 38 + i * 2, moistureContent: 18.9 },
  })),
  // ---- Himalayan Apiaries drums (4) ----
  ...Array.from({ length: 4 }, (_, i) => ({
    drumId: `DR-00${927 + i}`, drumSealId: `SEAL-A${1007 + i}`, drumNfcTag: `NFC-DR-00${927 + i}`,
    farmName: 'Himalayan Apiaries', farmLocation: 'Shimla, Himachal Pradesh',
    farmCoordinates: { lat: 31.105, lng: 77.172 },
    farmRegistrationId: 'HP-FARM-2024-0089', farmRegisteredDate: '2024-11-20', farmTotalHives: 30,
    farmerId: 'USR-F003', farmerName: 'Deepak Thakur', farmerPhone: '+91 98765 43230',
    farmerRating: 4.9, farmerTotalBatches: 31, farmerSuccessRate: 98.7,
    hiveIds: [`HIVE-H${(i + 1).toString().padStart(3, '0')}`],
    hiveName: `Hive H-${(i + 1).toString().padStart(3, '0')}`,
    hiveInstalledDate: '2025-03-01', hiveLastInspection: '2026-08-25',
    floralSource: 'Multi-flora (Wild Forest)', harvestDate: '2026-08-25', harvestMethod: 'Manual Frame Extraction',
    weight: 115 + i * 8, batchId: 'HC-EXT-002',
    aiFraudRisk: 1.2 + i * 0.3, aiVerified: true,
    sensorHistory: generateSensorHistory(`HIVE-H${(i + 1).toString().padStart(3, '0')}`, 22),
    hiveHealth: {
      healthScore: 92 + i, diseaseRisk: 'low' as const,
      alerts: [],
      recommendation: `Himalayan wild-forest hive performing excellently. Altitude conditions ideal for multi-flora honey production.`,
    },
    media: {
      farmPhoto: '/demo/himalayan-apiaries-view.jpg',
      hivePhoto: `/demo/hive-himalayan-${i + 1}.jpg`,
      cctvClipUrl: '/demo/cctv-himalayan-harvest.mp4',
      cctvThumbnail: '/demo/cctv-thumb-himalayan.jpg',
      harvestPhoto: '/demo/harvest-himalayan-aug25.jpg',
    },
    iotSnapshot: { avgTemperature: 32.1 + i * 0.2, avgHumidity: 55 + i, hiveHealth: 92 + i, weightAtHarvest: 36 + i * 2, moistureContent: 17.8 },
  })),
];

// ==========================================
// Derive DrumSource[] from bottleSources for ProcessingBatch compatibility
// ==========================================
const mockDrumSources: DrumSource[] = bottleSources.map(s => ({
  drumId: s.drumId,
  farmName: s.farmName,
  farmLocation: s.farmLocation,
  hiveIds: s.hiveIds,
  floralSource: s.floralSource,
  weight: s.weight,
  batchId: s.batchId,
  aiFraudRisk: s.aiFraudRisk,
  aiVerified: s.aiVerified,
  nfcTagId: s.drumNfcTag,
}));

// ==========================================
// PROCESSING BATCHES (with enriched lot breakdown + dual labs)
// ==========================================
export const mockProcessingBatches: ProcessingBatch[] = [
  {
    id: 'PB-00481',
    processorId: 'USR-PR001',
    processorName: 'Golden Valley Processing',
    sourceDrums: mockDrumSources,
    totalDrums: mockDrumSources.length,
    totalWeight: mockDrumSources.reduce((sum, d) => sum + d.weight, 0),
    status: 'complete',
    createdAt: '2026-09-01T08:00:00Z',
    completedAt: '2026-09-02T16:00:00Z',
    steps: [
      { name: 'Receiving & Inspection', status: 'completed', completedAt: '2026-09-01T09:00:00Z', details: 'All drums received with intact seals. Weight verified. NFC tags authenticated.' },
      { name: 'Pre-Processing Lab Test', status: 'completed', completedAt: '2026-09-01T10:00:00Z', details: 'Samples collected from all drums. Sent to Punjab State Food Testing Lab.' },
      { name: 'Filtration', status: 'completed', completedAt: '2026-09-01T14:00:00Z', details: 'Double-filtered through 200μm and 80μm stainless steel mesh. No foreign particles.' },
      { name: 'Moisture Adjustment', status: 'completed', completedAt: '2026-09-01T16:00:00Z', details: 'Vacuum dehumidification at 40°C for 2 hours. Moisture reduced from 18.4% to 17.8%.' },
      { name: 'Post-Processing Lab Test', status: 'completed', completedAt: '2026-09-02T14:00:00Z', details: 'Final product lab report issued. All FSSAI parameters within limits.' },
      { name: 'Bottling', status: 'completed', completedAt: '2026-09-02T16:00:00Z', details: '560 bottles generated (500g each). NFC NTAG 424 DNA tags embedded in cap seal.' },
    ],
    bottleIds: Array.from({ length: 12 }, (_, i) => `HC-BTL-${String(180 + i).padStart(6, '0')}`),
    preLabReport: mockPreLabReport,
    postLabReport: mockPostLabReport,
    blockchainTxHash: txHash(20),
  },
];

// ==========================================
// BOTTLES (with EXHAUSTIVE lineage)
// ==========================================
const baseLineage: BottleLineage = {
  lot: {
    id: 'PB-00481',
    totalDrums: bottleSources.length,
    totalWeight: bottleSources.reduce((sum, d) => sum + d.weight, 0),
    processorName: 'Golden Valley Processing',
    processorLicense: 'FSSAI-LIC-10716024000147',
    processorAddress: 'Plot 47, Industrial Area Phase-II, Ludhiana, Punjab 141003',
    processedAt: '2026-09-02T16:00:00Z',
  },
  sources: bottleSources,
  transport: {
    vehicleNumber: 'PB-10-AB-1234',
    vehicleType: 'Refrigerated Cargo Van (Tata Ace EV)',
    driverName: 'Vikram Singh',
    driverLicense: 'PB-0620050012345',
    driverPhone: '+91 98765 43213',
    pickedUpAt: '2026-08-24T09:00:00Z',
    deliveredAt: '2026-08-25T14:00:00Z',
    distanceKm: 142,
    avgTemperature: 28.1,
    maxTemperature: 29.3,
    minTemperature: 27.2,
    sealIntactOnDelivery: true,
    checkpoints: [
      { timestamp: '2026-08-24T09:00:00Z', gps: { lat: 31.224, lng: 75.770 }, temperature: 27.5, sealIntact: true, note: 'Drums picked up from Sharma Apiary. All NFC seals verified intact. Weight cross-checked.' },
      { timestamp: '2026-08-24T11:30:00Z', gps: { lat: 31.180, lng: 75.785 }, temperature: 28.1, sealIntact: true, note: 'Checkpoint at Jalandhar bypass. Seals intact.' },
      { timestamp: '2026-08-24T14:00:00Z', gps: { lat: 31.100, lng: 75.800 }, temperature: 28.8, sealIntact: true, note: 'Rest stop. Temperature within limits.' },
      { timestamp: '2026-08-24T17:00:00Z', gps: { lat: 31.000, lng: 75.830 }, temperature: 29.3, sealIntact: true, note: 'Peak temp recorded. AC adjusted. Still within 30°C limit.' },
      { timestamp: '2026-08-25T08:00:00Z', gps: { lat: 30.950, lng: 75.850 }, temperature: 27.2, sealIntact: true, note: 'Morning departure from overnight rest.' },
      { timestamp: '2026-08-25T14:00:00Z', gps: { lat: 30.901, lng: 75.857 }, temperature: 28.2, sealIntact: true, note: 'Arrived at Golden Valley Processing Plant. All seals verified intact at receiving dock.' },
    ],
  },
  processing: {
    steps: [
      {
        name: 'Receiving & NFC Verification',
        description: 'Each drum\'s NFC tag was scanned and verified against the blockchain record. Weight was cross-checked with the declared weight at farm gate. All seals were verified intact.',
        startedAt: '2026-09-01T08:00:00Z', completedAt: '2026-09-01T09:00:00Z',
        operator: 'Amandeep Gill (Plant Supervisor)', equipment: 'NFC Reader (ACR1252U), Industrial Scale (Mettler Toledo ICS435)',
        parameters: { 'Drums Verified': '10', 'Weight Variance': '< 0.5%', 'NFC Mismatches': '0' },
      },
      {
        name: 'Pre-Processing Lab Sampling',
        description: 'Representative samples drawn from each drum using sterile sampling probes. Composite sample sent to Punjab State Food Testing Lab (NABL accredited) for full FSSAI panel.',
        startedAt: '2026-09-01T09:00:00Z', completedAt: '2026-09-01T10:00:00Z',
        operator: 'Lab Technician Priya Mehta', equipment: 'Sterile Sampling Probes, Chain of Custody Bags',
        parameters: { 'Samples Taken': '10 individual + 1 composite', 'Lab Ref': 'PSFTA-2026-4821' },
      },
      {
        name: 'Double Filtration',
        description: 'Honey passed through two-stage stainless steel mesh filtration to remove wax particles, bee parts, and other foreign matter. No chemicals or heat used during filtration.',
        startedAt: '2026-09-01T10:30:00Z', completedAt: '2026-09-01T14:00:00Z',
        operator: 'Ranjit Kumar (Processing Lead)', equipment: 'SS304 Gravity Filter System (200μm + 80μm mesh)',
        parameters: { 'First Filter': '200μm mesh', 'Second Filter': '80μm mesh', 'Temperature': '25°C (ambient, no heating)', 'Foreign Matter Removed': '0.02% by weight' },
      },
      {
        name: 'Moisture Reduction',
        description: 'Moisture content reduced from 18.4% to 17.8% using vacuum dehumidification. Process operated at low temperature (40°C) to preserve enzyme activity and prevent HMF increase.',
        startedAt: '2026-09-01T14:30:00Z', completedAt: '2026-09-01T16:30:00Z',
        operator: 'Ranjit Kumar (Processing Lead)', equipment: 'Vacuum Dehumidifier (Beeflow VD-500)',
        parameters: { 'Starting Moisture': '18.4%', 'Final Moisture': '17.8%', 'Temperature': '40°C', 'Duration': '2 hours', 'Vacuum Pressure': '-0.08 MPa' },
      },
      {
        name: 'Homogenization & Blending',
        description: 'All filtered honey from the 10 drums was blended in a jacketed SS304 mixing tank with slow-speed paddle agitation. No additives, preservatives, or sugar syrups were introduced.',
        startedAt: '2026-09-01T17:00:00Z', completedAt: '2026-09-01T18:00:00Z',
        operator: 'Ranjit Kumar (Processing Lead)', equipment: 'SS304 Jacketed Mixing Tank (1000L), Paddle Agitator (20 RPM)',
        parameters: { 'Additives Used': 'NONE', 'Mixing Speed': '20 RPM', 'Duration': '60 minutes', 'Temperature': '28°C (ambient)' },
      },
      {
        name: 'Post-Processing Lab Test',
        description: 'Final blended honey sampled and sent to NABL-accredited lab for complete FSSAI compliance panel. Results confirmed all parameters within limits.',
        startedAt: '2026-09-02T08:00:00Z', completedAt: '2026-09-02T14:00:00Z',
        operator: 'Lab Technician Priya Mehta', equipment: 'Sterile Sampling, Chain of Custody',
        parameters: { 'Lab Ref': 'PSFTA-2026-4822', 'Result': 'ALL PARAMETERS PASSED' },
      },
      {
        name: 'Automated Bottling & NFC Embedding',
        description: 'Honey filled into food-grade PET bottles using automated filling line. Each bottle received a unique NFC NTAG 424 DNA tag embedded in the tamper-evident cap seal. QR codes printed on label.',
        startedAt: '2026-09-02T14:30:00Z', completedAt: '2026-09-02T16:00:00Z',
        operator: 'Automated Line (Supervised by Amandeep Gill)', equipment: 'Beeflow BF-500 Filling Line, NFC Tag Applicator (NXP NTAG 424 DNA)',
        parameters: { 'Bottles Produced': '560', 'Fill Weight': '500g ± 2g', 'NFC Tags Applied': '560', 'Reject Rate': '0.18%' },
      },
    ],
    additivesUsed: [],
    nothingAdded: true,
    filterType: 'Gravity filtration through stainless steel mesh (no pressure filtration)',
    filterMeshSize: '200μm primary + 80μm secondary',
    heatingApplied: false,
    moistureReduction: { from: 18.4, to: 17.8, method: 'Low-temperature vacuum dehumidification at 40°C' },
  },
  packaging: {
    bottleType: 'Hexagonal 500g Honey Jar',
    bottleMaterial: 'Food-grade BPA-free PET (Polyethylene Terephthalate)',
    capType: 'Tamper-evident twist-off metal lug cap with NFC inlay',
    labelInfo: 'Front: Brand, Net Weight, Floral Source, Best Before. Back: Batch ID, QR Code, NFC Scan Instructions, Nutritional Info, FSSAI License, Farmer Origin',
    sealType: 'Induction heat-sealed inner membrane + shrink-wrap tamper band',
    sealMechanism: 'Inner membrane provides airtight seal. Outer shrink band breaks visibly when cap is first opened. NFC tag in cap detects removal.',
    nfcEmbedLocation: 'Embedded inside the metal lug cap, between the liner and outer shell. Protected from external damage.',
    batchPrintedOn: 'Laser-etched on bottom of bottle: Lot PB-00481, Packed 02-Sep-2026',
    expiryDate: '02-Sep-2028 (24 months from packing)',
    storageInstructions: 'Store in a cool, dry place away from direct sunlight. Do not refrigerate. Crystallization is natural and does not indicate spoilage.',
    netWeight: 500,
    grossWeight: 580,
  },
  preProcessingLab: mockPreLabReport,
  postProcessingLab: mockPostLabReport,
  blockchain: {
    verified: true,
    txHash: txHash(30),
    contractAddress: contractAddr(1),
    network: 'Polygon POS (Mainnet)',
    blockNumber: 18235350,
    allTransactions: [
      { step: 'Batch HC-00190 Registered', txHash: txHash(1), blockNumber: 18234501, timestamp: '2026-08-20T08:05:00Z', gasUsed: 84521 },
      { step: 'AI Verification Passed', txHash: txHash(2), blockNumber: 18234612, timestamp: '2026-08-21T10:00:00Z', gasUsed: 62340 },
      { step: 'Escrow Created (₹89,600)', txHash: txHash(5), blockNumber: 18234780, timestamp: '2026-08-22T14:00:00Z', gasUsed: 112890 },
      { step: 'Custody Transfer to Processor', txHash: txHash(10), blockNumber: 18234890, timestamp: '2026-08-25T10:30:00Z', gasUsed: 72450 },
      { step: 'Drums Delivered — Seals Verified', txHash: txHash(15), blockNumber: 18235010, timestamp: '2026-08-25T14:00:00Z', gasUsed: 72450 },
      { step: 'Pre-Processing Lab Report Filed', txHash: txHash(40), blockNumber: 18235100, timestamp: '2026-09-01T10:00:00Z', gasUsed: 58200 },
      { step: 'Processing Complete', txHash: txHash(20), blockNumber: 18235280, timestamp: '2026-09-02T16:00:00Z', gasUsed: 134670 },
      { step: 'Post-Processing Lab Report Filed', txHash: txHash(45), blockNumber: 18235300, timestamp: '2026-09-02T14:00:00Z', gasUsed: 58200 },
      { step: 'Bottle HC-BTL-000184 Created', txHash: txHash(30), blockNumber: 18235350, timestamp: '2026-09-02T16:30:00Z', gasUsed: 45200 },
      { step: 'Farmer Payment Released', txHash: txHash(35), blockNumber: 18235400, timestamp: '2026-09-03T10:00:00Z', gasUsed: 52100 },
    ],
  },
  nfc: {
    tagId: 'NFC-BTL-000184',
    tagType: 'NXP NTAG 424 DNA',
    manufacturer: 'NXP Semiconductors (Netherlands)',
    cryptogram: '0xE4F8A2B6C9D1E5F7A3B5C8D2E6F9A1B4',
    publicKey: '0x04A3B7C9D1E5F2A8B6C4D3E7F1A9B5C2D8E6F4A1B3C7D9E2F5A8B4C6D1E3F7A9',
    scanCount: 1,
    isAuthentic: true,
    firstScanAt: '2026-09-06T13:00:00Z',
    firstScanLocation: 'Chandigarh, Punjab',
    dataStored: [
      { field: 'Bottle ID', value: 'HC-BTL-000184', description: 'Unique identifier for this specific bottle, linked to blockchain record' },
      { field: 'Processing Lot', value: 'PB-00481', description: 'The processing batch this bottle belongs to' },
      { field: 'Cryptographic Signature', value: '0xE4F8...A1B4', description: 'AES-128 encrypted signature generated by the NFC chip\'s tamper-proof secure element. Cannot be cloned or duplicated.' },
      { field: 'Scan Counter', value: '1', description: 'Hardware-level monotonic counter. Increments with each NFC tap. Cannot be reset. Value >1 from different locations = likely counterfeit.' },
      { field: 'UID', value: '04:A3:B7:C9:D1:E5:F2', description: 'Unique hardware ID burned into the NFC chip at manufacturing. Globally unique, cannot be changed.' },
      { field: 'Blockchain TX', value: txHash(30).substring(0, 20) + '...', description: 'Transaction hash linking this NFC tag to the on-chain bottle registration record' },
      { field: 'Verification URL', value: 'honeychain.in/verify/HC-BTL-000184', description: 'URL encoded in NFC NDEF record. Tapping the bottle auto-opens this verification page.' },
    ],
    whyNfc: 'NFC (Near Field Communication) tags are embedded in every HoneyChain bottle to provide tamper-proof anti-counterfeiting. Unlike QR codes which can be photographed and reprinted, NFC tags contain a secure cryptographic element that generates a unique signature on each scan. This makes it physically impossible to clone a bottle — even if someone copies the QR code, the NFC signature will not match. The hardware scan counter also tracks how many times a tag has been read, so a bottle scanned in Delhi cannot suddenly appear in Mumbai.',
    howItWorks: 'When you tap this bottle with your phone, the NFC chip (NTAG 424 DNA by NXP) performs a cryptographic challenge-response using its built-in AES-128 secure element. The chip generates a one-time authentication code (SUN message) that is verified against the blockchain-registered public key. If the chip is genuine and untampered, the cryptogram matches. If someone tries to clone the NFC data to a different chip, the cloned chip cannot reproduce the correct cryptographic response because it does not contain the original chip\'s secret key, which is burned into hardware and cannot be extracted.',
  },
  bottle: {
    id: 'HC-BTL-000184',
    sealId: 'BSEAL-000184',
    sealIntact: true,
    weight: 500,
    createdAt: '2026-09-02T16:00:00Z',
  },
  aiVerification: {
    overallScore: 97.2,
    fraudRisk: 2.4,
    recommendation: 'APPROVE — Batch shows excellent quality indicators across all parameters.',
    checks: [
      { name: 'Hive Consistency', passed: true, score: 97, details: 'Hive records match historical patterns. Colony size and activity consistent with expected output for all 10 source hives.' },
      { name: 'Image Verification', passed: true, score: 94, details: 'Farm photographs and CCTV footage verified by computer vision. Honey color and viscosity match declared floral profile.' },
      { name: 'Moisture Analysis', passed: true, score: 96, details: 'Moisture at 18.4% (pre) → 17.8% (post). Both within FSSAI standard ≤20%. Improvement consistent with declared processing method.' },
      { name: 'Sensor Consistency', passed: true, score: 98, details: 'IoT sensor readings from all 10 source hives are internally consistent. No anomalous spikes, data gaps, or signs of sensor tampering.' },
      { name: 'Expected Yield Match', passed: true, score: 91, details: 'Total declared quantity of 1,220 kg aligns with cumulative hive weight deltas and historical yields for these hives.' },
      { name: 'NFC Tag Integrity', passed: true, score: 100, details: 'All drum NFC tags verified authentic. No duplicate UIDs detected in the system.' },
      { name: 'Cross-Farm Correlation', passed: true, score: 95, details: 'Honey profiles from 3 farms show expected regional variation. No signs of common-source fraud.' },
    ],
    insight: 'This processing lot (PB-00481) scored 97.2% on the HoneyChain AI verification model. The lot combines mustard, eucalyptus, and multi-flora honey from 3 verified farms across Punjab and Himachal Pradesh. All 10 source barrels passed individual NFC authentication. The dual lab reports show quality improvement through processing (HMF decreased, purity increased). No adulterants, pesticides, or antibiotics detected in either pre or post-processing tests. This is a high-confidence batch.',
    modelVersion: 'HoneyChain AI v2.4.1 (Sept 2026)',
    analyzedAt: '2026-09-06T06:05:00Z',
  },
};

export const mockBottles: Bottle[] = [
  {
    id: 'HC-BTL-000184',
    processingBatchId: 'PB-00481',
    qrCode: 'https://honeychain.in/verify/HC-BTL-000184',
    nfcTagId: 'NFC-BTL-000184',
    nfcCryptogram: '0xE4F8A2B6C9D1E5F7A3B5C8D2E6F9A1B4',
    sealId: 'BSEAL-000184',
    sealIntact: true,
    weight: 500,
    scanCount: 1,
    createdAt: '2026-09-02T16:00:00Z',
    lineage: baseLineage,
  },
  {
    id: 'HC-BTL-000185',
    processingBatchId: 'PB-00481',
    qrCode: 'https://honeychain.in/verify/HC-BTL-000185',
    nfcTagId: 'NFC-BTL-000185',
    nfcCryptogram: '0xF5A9B3C7D2E6F8A1B4C5D9E3F7A2B6C8',
    sealId: 'BSEAL-000185',
    sealIntact: true,
    weight: 500,
    scanCount: 1,
    createdAt: '2026-09-02T16:00:00Z',
    lineage: {
      ...baseLineage,
      nfc: {
        ...baseLineage.nfc,
        tagId: 'NFC-BTL-000185',
        cryptogram: '0xF5A9B3C7D2E6F8A1B4C5D9E3F7A2B6C8',
        publicKey: '0x04B4C8D2E6F3A9B7C5D4E8F2A1B6C3D9E7F5A2B4C8D1E6F3A9B7C5D4E8F2A1B6',
      },
      bottle: {
        id: 'HC-BTL-000185', sealId: 'BSEAL-000185', sealIntact: true, weight: 500, createdAt: '2026-09-02T16:00:00Z',
      },
      blockchain: {
        ...baseLineage.blockchain,
        txHash: txHash(31),
        blockNumber: 18235355,
      },
    },
  },
  // TAMPERED / CLONED bottle for anti-counterfeiting demo
  {
    id: 'HC-BTL-000186',
    processingBatchId: 'PB-00481',
    qrCode: 'https://honeychain.in/verify/HC-BTL-000186',
    nfcTagId: 'NFC-BTL-000186',
    nfcCryptogram: '0xINVALID_CRYPTOGRAM_MISMATCH',
    sealId: 'BSEAL-000186',
    sealIntact: false,
    weight: 500,
    scanCount: 4,
    lastScanLocation: 'Mumbai, Maharashtra',
    createdAt: '2026-09-02T16:00:00Z',
    lineage: {
      ...baseLineage,
      nfc: {
        ...baseLineage.nfc,
        tagId: 'NFC-BTL-000186',
        cryptogram: '0xINVALID_CRYPTOGRAM_MISMATCH',
        scanCount: 4,
        isAuthentic: false,
        firstScanAt: '2026-09-03T10:00:00Z',
        firstScanLocation: 'Delhi, NCR',
        lastScanAt: '2026-09-06T12:45:00Z',
        lastScanLocation: 'Mumbai, Maharashtra',
      },
      bottle: {
        id: 'HC-BTL-000186', sealId: 'BSEAL-000186', sealIntact: false, weight: 500, createdAt: '2026-09-02T16:00:00Z',
      },
    },
  },
];

// ==========================================
// MARKETPLACE LISTINGS
// ==========================================
export const mockMarketplaceListings: MarketplaceListing[] = [
  {
    id: 'LST-001',
    batchId: 'HC-00192',
    farmerId: 'USR-F001',
    farmName: 'Sharma Apiary',
    farmerReputation: 4.8,
    farmerRating: 4.8,
    honeyType: 'Raw Mustard Honey',
    floralSource: 'Mustard',
    quantity: 300,
    availableQuantity: 300,
    pricePerKg: 330,
    totalPrice: 99000,
    fraudRiskScore: 2.4,
    verified: { farm: true, iot: true, moisture: true, blockchain: true },
    hiveData: { hiveId: 'HIVE-019', health: 94, diseaseRisk: 'low' },
    iotSnapshot: { temperature: 34.1, humidity: 61, moisture: 18.6 },
    listedAt: '2026-09-06T07:00:00Z',
    location: 'Phagwara, Punjab',
  },
  {
    id: 'LST-002',
    batchId: 'HC-00193',
    farmerId: 'USR-F001',
    farmName: 'Sharma Apiary',
    farmerReputation: 4.8,
    farmerRating: 4.8,
    honeyType: 'Pure Litchi Honey',
    floralSource: 'Litchi',
    quantity: 180,
    availableQuantity: 180,
    pricePerKg: 380,
    totalPrice: 68400,
    fraudRiskScore: 5.1,
    verified: { farm: true, iot: true, moisture: true, blockchain: true },
    hiveData: { hiveId: 'HIVE-020', health: 91, diseaseRisk: 'low' },
    iotSnapshot: { temperature: 33.5, humidity: 63, moisture: 19.1 },
    listedAt: '2026-09-05T15:00:00Z',
    location: 'Phagwara, Punjab',
  },
  {
    id: 'LST-003',
    batchId: 'HC-EXT-001',
    farmerId: 'USR-F002',
    farmName: 'Kaur Bee Farm',
    farmerReputation: 4.5,
    farmerRating: 4.5,
    honeyType: 'Organic Eucalyptus Honey',
    floralSource: 'Eucalyptus',
    quantity: 200,
    availableQuantity: 200,
    pricePerKg: 350,
    totalPrice: 70000,
    fraudRiskScore: 4.8,
    verified: { farm: true, iot: true, moisture: true, blockchain: false },
    hiveData: { hiveId: 'HIVE-K001', health: 88, diseaseRisk: 'low' },
    iotSnapshot: { temperature: 33.2, humidity: 58, moisture: 18.9 },
    listedAt: '2026-09-04T10:00:00Z',
    location: 'Jalandhar, Punjab',
  },
  {
    id: 'LST-004',
    batchId: 'HC-EXT-002',
    farmerId: 'USR-F003',
    farmName: 'Himalayan Apiaries',
    farmerReputation: 4.9,
    farmerRating: 4.9,
    honeyType: 'Wild Forest Honey',
    floralSource: 'Multi-flora',
    quantity: 120,
    availableQuantity: 120,
    pricePerKg: 520,
    totalPrice: 62400,
    fraudRiskScore: 1.5,
    verified: { farm: true, iot: true, moisture: true, blockchain: true },
    hiveData: { hiveId: 'HIVE-H001', health: 96, diseaseRisk: 'low' },
    iotSnapshot: { temperature: 32.8, humidity: 55, moisture: 17.8 },
    listedAt: '2026-09-03T08:00:00Z',
    location: 'Shimla, Himachal Pradesh',
  },
];

// ==========================================
// BLOCKCHAIN RECORDS
// ==========================================
export const mockBlockchainRecords: BlockchainRecord[] = [
  {
    txHash: txHash(1),
    blockNumber: 18234501,
    timestamp: '2026-08-20T08:05:00Z',
    type: 'batch_registered',
    parties: ['Sharma Apiary (USR-F001)'],
    dataHash: '0xabc123...',
    contractAddress: contractAddr(1),
    gasUsed: 84521,
    details: 'Batch HC-00190 registered on chain. 280 kg Mustard Honey from HIVE-016.',
  },
  {
    txHash: txHash(2),
    blockNumber: 18234612,
    timestamp: '2026-08-21T10:00:00Z',
    type: 'batch_verified',
    parties: ['HoneyChain AI', 'Admin (USR-A001)'],
    dataHash: '0xdef456...',
    contractAddress: contractAddr(1),
    gasUsed: 62340,
    details: 'Batch HC-00190 verified. AI fraud risk: 1.8%. Admin approved.',
  },
  {
    txHash: txHash(5),
    blockNumber: 18234780,
    timestamp: '2026-08-22T14:00:00Z',
    type: 'escrow_created',
    parties: ['Golden Valley Processing (USR-PR001)', 'Sharma Apiary (USR-F001)'],
    dataHash: '0x789abc...',
    contractAddress: contractAddr(2),
    gasUsed: 112890,
    details: 'Escrow created for order. ₹89,600 locked. ₹76,160 (85%) advanced to farmer.',
  },
  {
    txHash: txHash(10),
    blockNumber: 18234890,
    timestamp: '2026-08-25T10:30:00Z',
    type: 'custody_transfer',
    parties: ['Sharma Apiary (USR-F001)', 'Golden Valley Processing (USR-PR001)'],
    dataHash: '0xcde012...',
    contractAddress: contractAddr(3),
    gasUsed: 72450,
    details: 'Drums DR-00919, DR-00920 picked up by processor transport. Seals verified.',
  },
  {
    txHash: txHash(15),
    blockNumber: 18235010,
    timestamp: '2026-08-25T14:00:00Z',
    type: 'custody_transfer',
    parties: ['Transport (PB-10-AB-1234)', 'Golden Valley Processing (USR-PR001)'],
    dataHash: '0xfgh345...',
    contractAddress: contractAddr(3),
    gasUsed: 72450,
    details: 'Drums DR-00919, DR-00920 delivered to processing plant. Seals intact.',
  },
  {
    txHash: txHash(40),
    blockNumber: 18235100,
    timestamp: '2026-09-01T10:00:00Z',
    type: 'lab_report_filed',
    parties: ['Punjab State Food Testing Lab', 'Golden Valley Processing (USR-PR001)'],
    dataHash: '0xlab123...',
    contractAddress: contractAddr(4),
    gasUsed: 58200,
    details: 'Pre-processing lab report LAB-PRE-00481 filed. All parameters passed.',
  },
  {
    txHash: txHash(20),
    blockNumber: 18235280,
    timestamp: '2026-09-02T16:00:00Z',
    type: 'processing_complete',
    parties: ['Golden Valley Processing (USR-PR001)'],
    dataHash: '0xijk678...',
    contractAddress: contractAddr(4),
    gasUsed: 134670,
    details: 'Processing batch PB-00481 completed. 560 bottles generated. Dual lab reports: Passed.',
  },
  {
    txHash: txHash(45),
    blockNumber: 18235300,
    timestamp: '2026-09-02T14:00:00Z',
    type: 'lab_report_filed',
    parties: ['Punjab State Food Testing Lab', 'Golden Valley Processing (USR-PR001)'],
    dataHash: '0xlab456...',
    contractAddress: contractAddr(4),
    gasUsed: 58200,
    details: 'Post-processing lab report LAB-POST-00481 filed. Final quality verified.',
  },
  {
    txHash: txHash(30),
    blockNumber: 18235350,
    timestamp: '2026-09-02T16:30:00Z',
    type: 'bottle_created',
    parties: ['Golden Valley Processing (USR-PR001)'],
    dataHash: '0xlmn901...',
    contractAddress: contractAddr(4),
    gasUsed: 45200,
    details: 'Bottle HC-BTL-000184 created with full lineage hash. NFC tag NFC-BTL-000184 registered.',
  },
  {
    txHash: txHash(35),
    blockNumber: 18235400,
    timestamp: '2026-09-03T10:00:00Z',
    type: 'payment_released',
    parties: ['Escrow Contract', 'Sharma Apiary (USR-F001)'],
    dataHash: '0xopq234...',
    contractAddress: contractAddr(2),
    gasUsed: 52100,
    details: 'Remaining ₹13,440 (15%) released to farmer. Order completed.',
  },
];

// ==========================================
// FARMER STATS
// ==========================================
export const mockFarmerStats: FarmerStats = {
  activeHives: 22,
  averageHealth: 92,
  expectedHarvest: 1240,
  pendingBatches: 1,
  totalEarnings: 487500,
  reputationScore: 4.8,
};

// ==========================================
// ADMIN STATS
// ==========================================
export const mockAdminStats: AdminStats = {
  pendingVerifications: 2,
  approvedToday: 5,
  rejectedToday: 1,
  averageFraudRisk: 4.2,
  totalBatches: 193,
};

// ==========================================
// NOTIFICATIONS
// ==========================================
export const mockNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'success',
    title: 'Batch Verified',
    message: 'Batch HC-00193 has been verified and approved by admin.',
    timestamp: '2026-09-05T14:00:00Z',
    read: false,
    actionUrl: '/farmer/batches',
  },
  {
    id: 'NOTIF-002',
    type: 'warning',
    title: 'Hive Alert',
    message: 'Hive H-021 disease risk has increased to HIGH. Inspect immediately.',
    timestamp: '2026-09-05T12:00:00Z',
    read: false,
    actionUrl: '/farmer/hives',
  },
  {
    id: 'NOTIF-003',
    type: 'info',
    title: 'Transport Update',
    message: 'Drums DR-00921, DR-00922 are in transit to your processing plant. ETA: 4 hours.',
    timestamp: '2026-09-04T14:00:00Z',
    read: true,
  },
  {
    id: 'NOTIF-004',
    type: 'success',
    title: 'Payment Received',
    message: '₹76,160 advance payment received for batch HC-00190.',
    timestamp: '2026-09-03T10:00:00Z',
    read: true,
  },
];
