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
```

#### Contracts (.env)

Create `contracts/.env`:

```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
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

## MetaMask Setup

1. Install MetaMask browser extension
2. Create or import wallet
3. Switch to Polygon Mumbai Testnet:
   - Network Name: Polygon Mumbai
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: https://mumbai.polygonscan.com

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
