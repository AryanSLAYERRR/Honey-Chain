// ==========================================
// HONEYCHAIN — Type Definitions (v2: Deep Transparency)
// ==========================================

// --- Users & Roles ---
// Merged: Producer + Processor + Transporter => 'processor' (buys, transports, tests, bottles)
export type UserRole = 'farmer' | 'admin' | 'processor' | 'consumer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
  phone: string;
}


// --- Farm & Hive ---
export interface Farm {
  id: string;
  name: string;
  farmerId: string;
  location: string;
  state: string;
  district: string;
  coordinates: { lat: number; lng: number };
  totalHives: number;
  activeHives: number;
  registeredDate: string;
}

export interface Hive {
  id: string;
  farmId: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'alert';
  installedDate: string;
  lastInspection: string;
  currentHealth: number;
  diseaseRisk: 'low' | 'medium' | 'high';
  predictedYield: number;
  floralSource: string;
}

// --- IoT Readings ---
export interface IoTReading {
  id: string;
  hiveId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
  activity: 'low' | 'medium' | 'high';
  batteryLevel: number;
}

export interface IoTTimeSeries {
  hiveId: string;
  readings: IoTReading[];
}

// --- Batches ---
export type BatchStatus =
  | 'draft'
  | 'submitted'
  | 'ai_reviewing'
  | 'verified'
  | 'rejected'
  | 'listed'
  | 'sold'
  | 'in_transit'
  | 'processing'
  | 'bottled';

export interface HoneyBatch {
  id: string;
  farmerId: string;
  farmName: string;
  hiveId: string;
  hiveName: string;
  floralSource: string;
  harvestDate: string;
  quantity: number;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
  images: {
    honey?: string;
    farm?: string;
    cctvClip?: string;
  };
  iotSnapshot: {
    temperature: number;
    humidity: number;
    weight: number;
    moisture: number;
  };
  aiAnalysis?: AIAnalysis;
  blockchainTxHash?: string;
  price?: number;
}

export type Batch = HoneyBatch;

// --- AI Analysis ---
export interface AIAnalysis {
  id: string;
  batchId: string;
  timestamp: string;
  checks: {
    hiveConsistency: { passed: boolean; score: number; details: string };
    imageVerification: { passed: boolean; score: number; details: string };
    moistureCheck: { passed: boolean; score: number; details: string };
    sensorConsistency: { passed: boolean; score: number; details: string };
    yieldMatch: { passed: boolean; score: number; details: string };
  };
  fraudRisk: number;
  recommendation: 'approve' | 'review' | 'reject';
  aiInsight: string;
}

// --- AI Hive Insight ---
export interface HiveAIInsight {
  hiveId: string;
  timestamp: string;
  healthScore: number;
  diseaseRisk: 'low' | 'medium' | 'high';
  predictedYield: number;
  alerts: string[];
  recommendation: string;
}

// --- Drums (Barrels) ---
export interface Drum {
  id: string;
  batchId: string;
  farmId: string;
  farmName: string;
  hiveIds: string[];   // which hives contributed
  weight: number;
  sealId: string;
  sealIntact: boolean;
  nfcTagId: string;
  nfcCryptogram: string;  // anti-counterfeiting cryptographic hash
  status: 'sealed' | 'in_transit' | 'delivered' | 'opened';
  currentHolder: string;
}

// --- Transport (now managed by Processor, not a separate role) ---
export interface TransportLog {
  id: string;
  drumIds: string[];
  processorId: string;
  processorName: string;
  pickupLocation: string;
  pickupCoordinates: { lat: number; lng: number };
  destination: string;
  destinationCoordinates: { lat: number; lng: number };
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  currentGPS?: { lat: number; lng: number };
  currentTemperature?: number;
  checkpoints: TransportCheckpoint[];
  blockchainTxHash?: string;
}

export interface TransportCheckpoint {
  timestamp: string;
  gps: { lat: number; lng: number };
  temperature: number;
  sealIntact: boolean;
  note?: string;
}

// --- Lab Reports (DUAL: pre-processing & post-processing) ---
export interface LabReport {
  id: string;
  type: 'pre_processing' | 'post_processing';
  processingBatchId: string;
  moisture: number;
  purity: number;
  hmf: number;
  diastase: number;
  sucrose: number;
  fructoseGlucoseRatio: number;
  color: string;
  taste: string;
  adulterants: string[];    // empty = none found
  pesticides: string[];     // empty = none found
  antibiotics: string[];    // empty = none found
  passed: boolean;
  testedAt: string;
  labName: string;
  labCertNumber: string;
  blockchainTxHash?: string;
}

// --- Processing (Lot) ---
export type ProcessingStatus = 'receiving' | 'pre_lab' | 'processing' | 'post_lab' | 'bottling' | 'complete';

export interface ProcessingBatch {
  id: string;
  processorId: string;
  processorName: string;
  sourceDrums: DrumSource[];   // enriched: which barrels from which farms/hives
  totalDrums: number;
  totalWeight: number;
  status: ProcessingStatus;
  createdAt: string;
  completedAt?: string;
  steps: ProcessingStep[];
  bottleIds: string[];
  preLabReport: LabReport;     // DUAL lab report
  postLabReport?: LabReport;   // DUAL lab report
  blockchainTxHash?: string;
}

export interface DrumSource {
  drumId: string;
  farmName: string;
  farmLocation: string;
  hiveIds: string[];
  floralSource: string;
  weight: number;
  batchId: string;
  aiFraudRisk: number;
  aiVerified: boolean;
  nfcTagId: string;
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  details?: string;
}

// --- Bottles (with NFC anti-counterfeiting) ---
export interface Bottle {
  id: string;
  processingBatchId: string;
  qrCode: string;
  nfcTagId: string;
  nfcCryptogram: string;
  sealId: string;
  sealIntact: boolean;
  weight: number;
  scanCount: number;   // anti-cloning: >1 on different devices = tampered
  lastScanLocation?: string;
  createdAt: string;
  lineage: BottleLineage;
}

// --- Deep Lineage (EXHAUSTIVE consumer transparency) ---
export interface BottleLineage {
  // The lot this bottle came from
  lot: {
    id: string;
    totalDrums: number;
    totalWeight: number;
    processorName: string;
    processorLicense: string;
    processorAddress: string;
    processedAt: string;
  };
  // All source farms/barrels that went into this lot
  sources: BottleSource[];
  // Transport logs
  transport: {
    vehicleNumber: string;
    vehicleType: string;
    driverName: string;
    driverLicense: string;
    driverPhone: string;
    pickedUpAt: string;
    deliveredAt: string;
    distanceKm: number;
    avgTemperature: number;
    maxTemperature: number;
    minTemperature: number;
    sealIntactOnDelivery: boolean;
    checkpoints: TransportCheckpoint[];
  };
  // Processing details — what exactly was done to the honey
  processing: {
    steps: {
      name: string;
      description: string;
      startedAt: string;
      completedAt: string;
      operator: string;
      equipment: string;
      parameters?: Record<string, string>;
    }[];
    additivesUsed: {
      name: string;
      purpose: string;
      quantity: string;
      fssaiApproved: boolean;
    }[];
    nothingAdded: boolean; // explicit flag: was anything added?
    filterType: string;
    filterMeshSize: string;
    heatingApplied: boolean;
    maxHeatingTemp?: number;
    heatingDuration?: string;
    moistureReduction: { from: number; to: number; method: string };
  };
  // Packaging details
  packaging: {
    bottleType: string;
    bottleMaterial: string;
    capType: string;
    labelInfo: string;
    sealType: string;
    sealMechanism: string;
    nfcEmbedLocation: string;
    batchPrintedOn: string;
    expiryDate: string;
    storageInstructions: string;
    netWeight: number;
    grossWeight: number;
  };
  // DUAL lab reports
  preProcessingLab: LabReport;
  postProcessingLab: LabReport;
  // Blockchain — full transaction trail
  blockchain: {
    verified: boolean;
    txHash: string;
    contractAddress: string;
    network: string;
    blockNumber: number;
    allTransactions: {
      step: string;
      txHash: string;
      blockNumber: number;
      timestamp: string;
      gasUsed: number;
    }[];
  };
  // NFC Authentication — deep data
  nfc: {
    tagId: string;
    tagType: string;            // e.g. "NTAG 424 DNA"
    manufacturer: string;
    cryptogram: string;
    publicKey: string;
    scanCount: number;
    isAuthentic: boolean;
    firstScanAt?: string;
    firstScanLocation?: string;
    lastScanAt?: string;
    lastScanLocation?: string;
    dataStored: {
      field: string;
      value: string;
      description: string;
    }[];
    whyNfc: string;             // explanation of why NFC is used
    howItWorks: string;         // explanation of how anti-counterfeiting works
  };
  // Bottle details
  bottle: {
    id: string;
    sealId: string;
    sealIntact: boolean;
    weight: number;
    createdAt: string;
  };
  // AI Verification summary
  aiVerification: {
    overallScore: number;
    fraudRisk: number;
    recommendation: string;
    checks: {
      name: string;
      passed: boolean;
      score: number;
      details: string;
    }[];
    insight: string;
    modelVersion: string;
    analyzedAt: string;
  };
}

export interface BottleSource {
  drumId: string;
  drumSealId: string;
  drumNfcTag: string;
  farmName: string;
  farmLocation: string;
  farmCoordinates: { lat: number; lng: number };
  farmRegistrationId: string;
  farmRegisteredDate: string;
  farmTotalHives: number;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerRating: number;
  farmerTotalBatches: number;
  farmerSuccessRate: number;
  hiveIds: string[];
  hiveName: string;
  hiveInstalledDate: string;
  hiveLastInspection: string;
  floralSource: string;
  harvestDate: string;
  harvestMethod: string;
  weight: number;
  batchId: string;
  aiFraudRisk: number;
  aiVerified: boolean;
  // Full IoT sensor time-series for this hive
  sensorHistory: {
    timestamp: string;
    temperature: number;
    humidity: number;
    weight: number;
    soundLevel: number;
    activity: 'low' | 'medium' | 'high';
  }[];
  // Disease/health analysis for this hive
  hiveHealth: {
    healthScore: number;
    diseaseRisk: 'low' | 'medium' | 'high';
    alerts: string[];
    recommendation: string;
  };
  // CCTV / farm media
  media: {
    farmPhoto?: string;
    hivePhoto?: string;
    cctvClipUrl?: string;
    cctvThumbnail?: string;
    harvestPhoto?: string;
  };
  // IoT snapshot at harvest time
  iotSnapshot: {
    avgTemperature: number;
    avgHumidity: number;
    hiveHealth: number;
    weightAtHarvest: number;
    moistureContent: number;
  };
}

// --- Marketplace ---
export interface MarketplaceListing {
  id: string;
  batchId: string;
  farmerId: string;
  farmName: string;
  farmerReputation: number;
  farmerRating: number;
  honeyType: string;
  floralSource: string;
  quantity: number;
  availableQuantity: number;
  pricePerKg: number;
  totalPrice: number;
  fraudRiskScore: number;
  verified: {
    farm: boolean;
    iot: boolean;
    moisture: boolean;
    blockchain: boolean;
  };
  hiveData: {
    hiveId: string;
    health: number;
    diseaseRisk: string;
  };
  iotSnapshot: {
    temperature: number;
    humidity: number;
    moisture: number;
  };
  listedAt: string;
  location: string;
}

// --- Blockchain ---
export interface BlockchainEvent {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: string;
  entityId: string;
  details: string;
  contractAddress: string;
  gasUsed: number;
}

export interface BlockchainRecord {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  type: 'batch_registered' | 'batch_verified' | 'custody_transfer' | 'processing_complete' | 'bottle_created' | 'escrow_created' | 'payment_released' | 'lab_report_filed' | 'nfc_scan_logged';
  parties: string[];
  dataHash: string;
  contractAddress: string;
  gasUsed: number;
  details: string;
}

// --- Dashboard Stats ---
export interface FarmerStats {
  activeHives: number;
  averageHealth: number;
  expectedHarvest: number;
  pendingBatches: number;
  totalEarnings: number;
  reputationScore: number;
}

export interface AdminStats {
  pendingVerifications: number;
  approvedToday: number;
  rejectedToday: number;
  averageFraudRisk: number;
  totalBatches: number;
}

export interface MarketplaceStats {
  totalListings: number;
  totalVolume: number;
  averagePrice: number;
  activeOrders: number;
}

// --- Notifications ---
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
