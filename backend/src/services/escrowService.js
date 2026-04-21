const path = require('path');
const { ethers } = require('ethers');
const { env } = require('../config/env');

const artifactPath = path.resolve(
  __dirname,
  '../../../contracts/artifacts/contracts/DeReFundEscrow.sol/DeReFundEscrow.json'
);

function normalizePrivateKey(raw) {
  const key = String(raw || '').trim();
  if (!key) return '';
  return key.startsWith('0x') ? key : `0x${key}`;
}

function assertAddress(value, label) {
  if (!ethers.isAddress(value)) {
    throw new Error(`${label} must be a valid wallet address`);
  }
}

function getEscrowConfig() {
  const rpcUrl = env.SEPOLIA_RPC_URL;
  const privateKey = normalizePrivateKey(env.ESCROW_DEPLOYER_PRIVATE_KEY || env.PRIVATE_KEY);

  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL is required to auto-deploy campaign escrow contracts');
  }
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error('ESCROW_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY must be a valid 32-byte private key');
  }

  return { rpcUrl, privateKey };
}

function getEscrowContract(contractAddress) {
  assertAddress(contractAddress, 'Escrow contract');

  const { rpcUrl, privateKey } = getEscrowConfig();
  const artifact = require(artifactPath);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  return new ethers.Contract(contractAddress, artifact.abi, signer);
}

function getEthUsdRate() {
  const rate = Number(env.ESCROW_ETH_USD_RATE);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('ESCROW_ETH_USD_RATE must be greater than zero');
  }
  return rate;
}

function usdToEthString(usdAmount) {
  const numericAmount = Number(usdAmount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('USD amount must be greater than zero');
  }

  const ethAmount = numericAmount / getEthUsdRate();
  return ethAmount.toFixed(18).replace(/\.?0+$/, '');
}

async function deployCampaignEscrow({ ngoWallet, adminWallet, targetAmount }) {
  assertAddress(ngoWallet, 'NGO wallet');

  const numericTarget = Number(targetAmount);
  if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
    throw new Error('Campaign target amount must be greater than zero');
  }

  const { rpcUrl, privateKey } = getEscrowConfig();
  const artifact = require(artifactPath);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(privateKey, provider);
  const resolvedAdminWallet = adminWallet || deployer.address;
  assertAddress(resolvedAdminWallet, 'Admin wallet');

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const targetAmountEth = usdToEthString(targetAmount);

  const escrow = await factory.deploy(
    ngoWallet,
    ethers.parseEther(targetAmountEth),
    resolvedAdminWallet
  );
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  const tx = escrow.deploymentTransaction();

  return {
    contractAddress,
    deployerAddress: deployer.address,
    deploymentTxHash: tx?.hash || null,
  };
}

async function addEscrowMilestone({ contractAddress, title, amount }) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Milestone USD amount must be greater than zero');
  }

  const escrow = getEscrowContract(contractAddress);
  const countBefore = await escrow.milestoneCount();
  const amountEth = usdToEthString(amount);
  const tx = await escrow.addMilestone(title, ethers.parseEther(amountEth));
  const receipt = await tx.wait();

  return {
    escrowMilestoneId: Number(countBefore),
    txHash: receipt?.hash || tx.hash,
    amountEth,
  };
}

async function approveEscrowMilestone({ contractAddress, escrowMilestoneId }) {
  const escrow = getEscrowContract(contractAddress);
  const tx = await escrow.approveAndRelease(escrowMilestoneId);
  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || tx.hash,
  };
}

async function getEscrowMilestone({ contractAddress, escrowMilestoneId }) {
  const escrow = getEscrowContract(contractAddress);
  const milestone = await escrow.getMilestone(escrowMilestoneId);
  const amountWei = milestone.amount;

  return {
    amountWei,
    amountEth: ethers.formatEther(amountWei),
    title: milestone.title,
    proofURI: milestone.proofURI,
    proofSubmitted: milestone.proofSubmitted,
    released: milestone.released,
  };
}

async function getEscrowBalance({ contractAddress }) {
  assertAddress(contractAddress, 'Escrow contract');

  const rpcUrl = env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL is required to read campaign escrow balances');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const balanceWei = await provider.getBalance(contractAddress);

  return {
    balanceWei,
    balanceEth: ethers.formatEther(balanceWei),
  };
}

module.exports = {
  deployCampaignEscrow,
  addEscrowMilestone,
  approveEscrowMilestone,
  getEscrowMilestone,
  getEscrowBalance,
  usdToEthString,
};
