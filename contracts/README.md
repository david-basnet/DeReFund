# DeReFund Smart Contracts

Smart contracts for the DeReFund decentralized donation and relief tracking system.

## Current Contract

`DeReFundEscrow.sol` is a campaign-level escrow contract:

- Donors send funds to the contract instead of directly to the NGO.
- Funds stay locked in the contract balance.
- Admin adds milestone amounts up to the campaign target.
- NGO submits a proof URI, such as an IPFS or Cloudinary URL.
- Admin approves and releases each milestone amount to the NGO wallet.
- Admin can pause the contract in emergencies.
- Admin can cancel before any release, allowing donors to claim refunds.

Payment flow:

```text
Donor wallet -> DeReFundEscrow contract -> NGO wallet
```

This replaces the direct payment flow:

```text
Donor wallet -> NGO wallet
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Compile Contracts

```bash
npm run compile
```

## Test Contracts

```bash
npm test
```

## Deploy

Set the NGO wallet, optional admin wallet, and target amount:

```bash
NGO_WALLET=0xYourNgoWallet ADMIN_WALLET=0xYourAdminWallet TARGET_AMOUNT=0.01 npm run deploy:sepolia
```

If `ADMIN_WALLET` is omitted, the deployer becomes the admin/owner.

On Sepolia, `TARGET_AMOUNT` is measured in SepoliaETH.

## Verify on Polygonscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

