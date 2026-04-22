require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
  }
};

// Export environment variables with defaults
const env = {
  // Server
  PORT: parseInt(process.env.PORT || '5000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SSL: process.env.DB_SSL === 'true',
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  
  // Blockchain
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || process.env.ETHEREUM_SEPOLIA_RPC_URL || '',
  PRIVATE_KEY: process.env.PRIVATE_KEY || '',
  ESCROW_DEPLOYER_PRIVATE_KEY: process.env.ESCROW_DEPLOYER_PRIVATE_KEY || '',
  ESCROW_ADMIN_WALLET: process.env.ESCROW_ADMIN_WALLET || '',
  ESCROW_ETH_USD_RATE: parseFloat(process.env.ESCROW_ETH_USD_RATE || '2500'),
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',

  // SMTP email verification
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'DeReFund',
  MAIL_FROM: process.env.MAIL_FROM || '',
  EMAIL_CODE_TTL_MINUTES: parseInt(process.env.EMAIL_CODE_TTL_MINUTES || '10'),
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = {
  env,
  validateEnv,
};

