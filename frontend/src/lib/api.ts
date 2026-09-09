/**
 * HoneyChain Unified API Client
 * Connects to FastAPI backend (http://127.0.0.1:8000/api)
 * Falls back seamlessly to local mock data if backend is unreachable.
 */

import {
  mockBatches,
  mockHives,
  mockFarmerStats,
  mockBottles,
  mockBlockchainRecords,
  mockProcessingBatches
} from './mock-data';
import type { Batch, Bottle, BlockchainRecord, Hive } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchWithFallback<T>(url: string, fallbackData: T, options?: RequestInit): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[API] Server responded with ${response.status} for ${url}, falling back.`);
      return fallbackData;
    }

    const data = await response.json();
    return data as T;
  } catch (err) {
    console.info(`[API] Backend unavailable for ${url}, using simulated mock data.`);
    return fallbackData;
  }
}

export const honeyApi = {
  // Health
  async checkHealth(): Promise<{ status: string; database: string }> {
    return fetchWithFallback('/health', { status: 'mock_mode', database: 'in_memory' });
  },

  // Marketplace
  async getMarketplaceListings() {
    return fetchWithFallback('/marketplace/listings', mockBatches.filter(b => b.status === 'verified' || b.status === 'listed'));
  },

  async buyListing(batchId: string, buyerId: string = 'USR-PROC01') {
    return fetchWithFallback('/marketplace/buy', { success: true, order_id: `ORD-${Date.now()}` }, {
      method: 'POST',
      body: JSON.stringify({ batch_id: batchId, buyer_id: buyerId })
    });
  },

  // Batches
  async getBatches(): Promise<Batch[]> {
    return fetchWithFallback<Batch[]>('/batches', mockBatches);
  },

  async getBatchById(id: string): Promise<Batch | undefined> {
    return fetchWithFallback<Batch | undefined>(`/batches/${id}`, mockBatches.find(b => b.id === id));
  },

  async createBatch(batchData: Partial<Batch>) {
    return fetchWithFallback('/batches', { ...batchData, id: `HC-${Date.now().toString().slice(-5)}` }, {
      method: 'POST',
      body: JSON.stringify(batchData)
    });
  },

  async approveBatch(batchId: string) {
    return fetchWithFallback(`/batches/${batchId}/approve`, { status: 'verified' }, {
      method: 'POST'
    });
  },

  // Verification & Bottles
  async verifyBottle(bottleId: string): Promise<Bottle | null> {
    const fallback = mockBottles.find(b => b.id === bottleId) || null;
    return fetchWithFallback<Bottle | null>(`/verify/${bottleId}`, fallback);
  },

  // Blockchain Records
  async getBlockchainRecords(): Promise<BlockchainRecord[]> {
    return fetchWithFallback<BlockchainRecord[]>('/blockchain/records', mockBlockchainRecords);
  },

  // IoT Readings
  async getLatestIoT(hiveId: string) {
    return fetchWithFallback(`/iot/hives/${hiveId}/latest`, {
      temperature: 34.2,
      humidity: 61,
      weight: 42.8,
      status: 'optimal'
    });
  }
};
