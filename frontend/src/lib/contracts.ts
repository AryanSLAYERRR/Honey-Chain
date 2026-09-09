/**
 * HoneyChain Smart Contract ABIs and deployed addresses.
 * Synced from /blockchain/deployed-contracts.json (Hardhat localhost deploy).
 *
 * If you redeploy, update the addresses below from blockchain/deployed-contracts.json.
 */

export const DEPLOYED_CONTRACTS = {
  BatchRegistry:     '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CustodyChain:      '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  ProcessingRegistry:'0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  Escrow:            '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  HoneyToken:        '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
} as const;

export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_RPC_URL  = 'http://127.0.0.1:8545';

// Hardhat Account #0 — deployer / in-app relayer wallet (pre-funded with 10,000 ETH)
export const RELAYER_ADDRESS     = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
// Hardhat Account #1 — default seller address for marketplace escrow
export const DEFAULT_SELLER_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
export const RELAYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// ─── ABIs (minimal — only functions used by the frontend) ─────────────────────

export const BATCH_REGISTRY_ABI = [
  {
    name: 'registerBatch',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_batchId',      type: 'string'  },
      { name: '_farmerId',     type: 'string'  },
      { name: '_hiveId',       type: 'string'  },
      { name: '_floralSource', type: 'string'  },
      { name: '_quantityKg',   type: 'uint256' },
      { name: '_dataHash',     type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'verifyBatch',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_batchId',      type: 'string' },
      { name: '_aiTrustScore', type: 'uint8'  },
      { name: '_approve',      type: 'bool'   },
    ],
    outputs: [],
  },
  {
    name: 'getBatch',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_batchId', type: 'string' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'batchId',          type: 'string'  },
          { name: 'farmerId',         type: 'string'  },
          { name: 'hiveId',           type: 'string'  },
          { name: 'floralSource',     type: 'string'  },
          { name: 'quantityKg',       type: 'uint256' },
          { name: 'harvestTimestamp', type: 'uint256' },
          { name: 'dataHash',         type: 'bytes32' },
          { name: 'aiTrustScore',     type: 'uint8'   },
          { name: 'status',           type: 'uint8'   },
          { name: 'registeredBy',     type: 'address' },
        ],
      },
    ],
  },
  {
    name: 'getTotalBatches',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'BatchRegistered',
    type: 'event',
    inputs: [
      { name: 'batchId',      type: 'string',  indexed: true  },
      { name: 'farmerId',     type: 'string',  indexed: false },
      { name: 'hiveId',       type: 'string',  indexed: false },
      { name: 'quantityKg',   type: 'uint256', indexed: false },
      { name: 'dataHash',     type: 'bytes32', indexed: false },
      { name: 'registeredBy', type: 'address', indexed: true  },
    ],
  },
] as const;

export const ESCROW_ABI = [
  {
    name: 'createEscrow',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_orderId', type: 'string'  },
      { name: '_batchId', type: 'string'  },
      { name: '_seller',  type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'releaseAdvance',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_orderId', type: 'string' }],
    outputs: [],
  },
  {
    name: 'releaseReserve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_orderId', type: 'string' }],
    outputs: [],
  },
  {
    name: 'getEscrow',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_orderId', type: 'string' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'orderId',       type: 'string'  },
          { name: 'batchId',       type: 'string'  },
          { name: 'buyer',         type: 'address' },
          { name: 'seller',        type: 'address' },
          { name: 'totalAmount',   type: 'uint256' },
          { name: 'advanceAmount', type: 'uint256' },
          { name: 'reserveAmount', type: 'uint256' },
          { name: 'status',        type: 'uint8'   },
          { name: 'createdAt',     type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'EscrowCreated',
    type: 'event',
    inputs: [
      { name: 'orderId', type: 'string',  indexed: true  },
      { name: 'batchId', type: 'string',  indexed: true  },
      { name: 'buyer',   type: 'address', indexed: false },
      { name: 'seller',  type: 'address', indexed: false },
      { name: 'total',   type: 'uint256', indexed: false },
    ],
  },
] as const;

export const CUSTODY_CHAIN_ABI = [
  {
    name: 'addCheckpoint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_batchId',      type: 'string' },
      { name: '_location',     type: 'string' },
      { name: '_custodian',    type: 'string' },
      { name: '_temperatureC', type: 'int256' },
      { name: '_sealIntact',   type: 'bool'   },
      { name: '_notes',        type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'getCheckpoints',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_batchId', type: 'string' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'batchId',      type: 'string'  },
          { name: 'location',     type: 'string'  },
          { name: 'custodian',    type: 'string'  },
          { name: 'temperatureC', type: 'int256'  },
          { name: 'sealIntact',   type: 'bool'    },
          { name: 'notes',        type: 'string'  },
          { name: 'timestamp',    type: 'uint256' },
          { name: 'reporter',     type: 'address' },
        ],
      },
    ],
  },
] as const;

export const HONEY_TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to',     type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;
