const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("🐝 Deploying HoneyChain Smart Contracts...");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer Address: ${deployer.address}`);

  // 1. BatchRegistry
  const BatchRegistry = await hre.ethers.getContractFactory("BatchRegistry");
  const batchRegistry = await BatchRegistry.deploy();
  await batchRegistry.waitForDeployment();
  const batchRegistryAddress = await batchRegistry.getAddress();
  console.log(`✓ BatchRegistry deployed at: ${batchRegistryAddress}`);

  // 2. CustodyChain
  const CustodyChain = await hre.ethers.getContractFactory("CustodyChain");
  const custodyChain = await CustodyChain.deploy();
  await custodyChain.waitForDeployment();
  const custodyChainAddress = await custodyChain.getAddress();
  console.log(`✓ CustodyChain deployed at:  ${custodyChainAddress}`);

  // 3. ProcessingRegistry
  const ProcessingRegistry = await hre.ethers.getContractFactory("ProcessingRegistry");
  const processingRegistry = await ProcessingRegistry.deploy();
  await processingRegistry.waitForDeployment();
  const processingRegistryAddress = await processingRegistry.getAddress();
  console.log(`✓ ProcessingRegistry at:     ${processingRegistryAddress}`);

  // 4. Escrow
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`✓ Escrow deployed at:        ${escrowAddress}`);

  // 5. HoneyToken ($HONEY)
  const HoneyToken = await hre.ethers.getContractFactory("HoneyToken");
  const honeyToken = await HoneyToken.deploy();
  await honeyToken.waitForDeployment();
  const honeyTokenAddress = await honeyToken.getAddress();
  console.log(`✓ HoneyToken ($HONEY) at:    ${honeyTokenAddress}`);

  // Save deployment metadata
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BatchRegistry: batchRegistryAddress,
      CustodyChain: custodyChainAddress,
      ProcessingRegistry: processingRegistryAddress,
      Escrow: escrowAddress,
      HoneyToken: honeyTokenAddress,
    },
  };

  const outputPath = path.join(__dirname, "../deployed-contracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Saved deployment config to: ${outputPath}`);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
