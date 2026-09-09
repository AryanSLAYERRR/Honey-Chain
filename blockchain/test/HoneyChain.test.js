const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyChain Smart Contract Suite", function () {
  let batchRegistry, custodyChain, processingRegistry, escrow;
  let owner, farmer, transporter, processor, consumer;

  beforeEach(async function () {
    [owner, farmer, transporter, processor, consumer] = await ethers.getSigners();

    const BatchRegistry = await ethers.getContractFactory("BatchRegistry");
    batchRegistry = await BatchRegistry.deploy();

    const CustodyChain = await ethers.getContractFactory("CustodyChain");
    custodyChain = await CustodyChain.deploy();

    const ProcessingRegistry = await ethers.getContractFactory("ProcessingRegistry");
    processingRegistry = await ProcessingRegistry.deploy();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
  });

  describe("1. BatchRegistry", function () {
    it("should register a harvest batch with IoT telemetry hash", async function () {
      const dummyHash = ethers.keccak256(ethers.toUtf8Bytes("telemetry-data-123"));
      await batchRegistry.connect(farmer).registerBatch(
        "HC-40921",
        "USR-FM001",
        "H-019",
        "Mustard",
        140,
        dummyHash
      );

      const batch = await batchRegistry.getBatch("HC-40921");
      expect(batch.batchId).to.equal("HC-40921");
      expect(batch.quantityKg).to.equal(140);
      expect(batch.status).to.equal(1); // Submitted
    });

    it("should allow admin to verify batch with AI trust score", async function () {
      const dummyHash = ethers.keccak256(ethers.toUtf8Bytes("telemetry-data-123"));
      await batchRegistry.connect(farmer).registerBatch(
        "HC-40921",
        "USR-FM001",
        "H-019",
        "Mustard",
        140,
        dummyHash
      );

      await batchRegistry.connect(owner).verifyBatch("HC-40921", 96, true);
      const batch = await batchRegistry.getBatch("HC-40921");
      expect(batch.aiTrustScore).to.equal(96);
      expect(batch.status).to.equal(2); // Verified
    });
  });

  describe("2. CustodyChain", function () {
    it("should register drum and log transport checkpoint", async function () {
      await custodyChain.connect(farmer).registerDrum("DRUM-40921-A", "NFC-DRUM-001");
      
      const gpsHash = ethers.keccak256(ethers.toUtf8Bytes("31.3260,75.5762"));
      await custodyChain.connect(farmer).addCheckpoint(
        "DRUM-40921-A",
        "Phagwara Apiary Gate",
        gpsHash,
        245, // 24.5 C
        true,
        "Driver: Gurpreet Singh"
      );

      const cps = await custodyChain.getCheckpoints("DRUM-40921-A");
      expect(cps.length).to.equal(1);
      expect(cps[0].locationName).to.equal("Phagwara Apiary Gate");
      expect(cps[0].sealIntact).to.be.true;
    });
  });

  describe("3. ProcessingRegistry", function () {
    it("should create processing lot and mint authentic bottle", async function () {
      const preHash = ethers.keccak256(ethers.toUtf8Bytes("pre-lab-fssai-pass"));
      const postHash = ethers.keccak256(ethers.toUtf8Bytes("post-lab-fssai-pass"));

      await processingRegistry.createProcessingLot(
        "PB-00481",
        "PROC-001",
        ["DRUM-40921-A", "DRUM-40922-A"],
        preHash,
        postHash,
        600,
        true
      );

      const cryptogramHash = ethers.keccak256(ethers.toUtf8Bytes("AES128:testcryptogram"));
      await processingRegistry.registerBottle(
        "HC-BTL-000184",
        "PB-00481",
        "NFC-NTAG424-184",
        cryptogramHash
      );

      const bottle = await processingRegistry.getBottle("HC-BTL-000184");
      expect(bottle.bottleId).to.equal("HC-BTL-000184");
      expect(bottle.nfcTagId).to.equal("NFC-NTAG424-184");
    });

    it("should reject duplicate NFC tag assignments", async function () {
      const preHash = ethers.keccak256(ethers.toUtf8Bytes("pre-lab"));
      const postHash = ethers.keccak256(ethers.toUtf8Bytes("post-lab"));

      await processingRegistry.createProcessingLot(
        "PB-00481",
        "PROC-001",
        ["DRUM-1"],
        preHash,
        postHash,
        300,
        true
      );

      const cryptHash = ethers.keccak256(ethers.toUtf8Bytes("crypto"));
      await processingRegistry.registerBottle("BTL-1", "PB-00481", "NFC-DUPLICATE-TEST", cryptHash);

      await expect(
        processingRegistry.registerBottle("BTL-2", "PB-00481", "NFC-DUPLICATE-TEST", cryptHash)
      ).to.be.revertedWith("NFC Tag ID already assigned to another bottle");
    });
  });

  describe("4. Escrow (85/15 Split)", function () {
    it("should lock funds, release 85% advance and 15% reserve", async function () {
      const totalAmount = ethers.parseEther("1.0");
      const farmerInitialBalance = await ethers.provider.getBalance(farmer.address);

      await escrow.connect(processor).createEscrow(
        "ORD-001",
        "HC-40921",
        farmer.address,
        { value: totalAmount }
      );

      let record = await escrow.getEscrow("ORD-001");
      expect(record.advanceAmount).to.equal(ethers.parseEther("0.85"));
      expect(record.reserveAmount).to.equal(ethers.parseEther("0.15"));

      // Release advance (85%)
      await escrow.connect(processor).releaseAdvance("ORD-001");
      record = await escrow.getEscrow("ORD-001");
      expect(record.status).to.equal(1); // AdvanceReleased

      // Release reserve (15%) after lab report verification
      await escrow.connect(processor).releaseReserve("ORD-001");
      record = await escrow.getEscrow("ORD-001");
      expect(record.status).to.equal(2); // Completed

      const farmerFinalBalance = await ethers.provider.getBalance(farmer.address);
      expect(farmerFinalBalance - farmerInitialBalance).to.equal(totalAmount);
    });
  });
});
