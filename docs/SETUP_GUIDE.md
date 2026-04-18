# Setup Guide

Complete setup instructions for running DeReFund locally.

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v15 or higher
- Git
- MetaMask browser extension (for blockchain features)

## Automated Setup (Recommended)

```powershell
# Run from project root
.\setup-all.ps1
```

## Manual Setup

### 1. Clone and Install Dependencies

```powershell
# Clone repository
git clone <repository-url>
cd DeReFund

# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install contract dependencies
cd ../contracts
npm install
```

### 2. Database Setup

#### Install PostgreSQL

Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).

#### Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE derefund;

-- Exit psql
\q
```

#### Run Migrations

```powershell
cd backend
npm run db:generate    # Generate migration files
npm run db:migrate     # Apply migrations
```

Or run migrations directly:
```powershell
cd backend
npx drizzle-kit push
```

### 3. Environment Configuration

#### Backend (.env)

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=derefund
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
```

#### Frontend (.env)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_REOWN_PROJECT_ID=your_reown_project_id
```

#### Contracts (.env)

Create `contracts/.env`:

```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 4. Running the Application

#### Start Backend

```powershell
cd backend
npm run dev
```

Backend runs at: `http://localhost:5000`

#### Start Frontend

```powershell
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

#### Compile Contracts (Optional)

```powershell
cd contracts
npx hardhat compile
npx hardhat test
```

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from Dashboard
3. Add to backend `.env` file

## MetaMask & Web3 Setup

### 1. Install MetaMask
- Install the MetaMask browser extension from [metamask.io](https://metamask.io/).
- Create a new wallet and **securely save your Secret Recovery Phrase**.

### 2. Configure Sepolia Testnet (Academic/Testing)
- In MetaMask, click the network selector (top-left).
- Toggle "Show test networks" to ON.
- Select **Sepolia**.
- To get test ETH (free), use a faucet like:
  - [Sepolia Faucet by Alchemy](https://sepoliafaucet.com/)
  - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### 3. Get Reown Project ID (for WalletConnect)
- Go to [Reown Cloud](https://cloud.reown.com/) (formerly WalletConnect).
- Create a new project named "DeReFund".
- Copy the **Project ID** and paste it into `frontend/.env` as `VITE_REOWN_PROJECT_ID`.

### 4. Update Web3 Config
- The project uses `frontend/src/config/web3.js`. 
- It will automatically look for `VITE_REOWN_PROJECT_ID` in your environment variables.

## Troubleshooting

### Database Connection Issues

```bash
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -U postgres -d derefund
```

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # macOS/Linux

# Kill the process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                   # macOS/Linux
```

### Node Module Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```
