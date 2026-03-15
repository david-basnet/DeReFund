# DeReFund - Decentralized Donation & Relief Tracking System

A blockchain-based platform for transparent disaster relief donations using Polygon testnet.

## 🏗️ Project Structure

```
fypp proj/
├── backend/          # Node.js + Express API
├── frontend/         # React + Tailwind UI
├── contracts/        # Solidity smart contracts
└── setup-all.ps1    # Quick setup script
```

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```powershell
# Run from project root
.\setup-all.ps1
```

### Option 2: Manual Setup

Follow the commands in `setup.md` file.

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- MetaMask browser extension
- Git

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=derefund
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
```

### Contracts (.env)
```
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## 🗄️ Database Setup

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE derefund;
```

3. Run migrations (will be created in backend)

## 🎯 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Blockchain**: Solidity + Hardhat + Polygon Testnet
- **Wallet**: MetaMask + Web3Modal
- **Storage**: Cloudinary

## 📝 Development

```powershell
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Contracts
cd contracts
npx hardhat compile
npx hardhat test
```

## 🔐 Security Notes

- Never commit `.env` files
- Use strong JWT secrets
- Keep private keys secure
- Test on testnet before mainnet

