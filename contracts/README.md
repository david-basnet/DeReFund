# DeReFund Smart Contracts

Smart contracts for the DeReFund decentralized donation and relief tracking system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## Compile Contracts

```bash
npx hardhat compile
```

## Test Contracts

```bash
npx hardhat test
```

## Deploy to Mumbai Testnet

```bash
npx hardhat run scripts/deploy.js --network mumbai
```

## Verify on Polygonscan

```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

