const express = require('express');
const cors = require('cors');
const { env, validateEnv } = require('./config/env');
const { pool } = require('./config/database');
const { testConnection } = require('./db/client');

// Validate environment variables
validateEnv();

const app = express();

// Middleware 
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'DeReFund API - Decentralized Donation & Relief Tracking System',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth'
    }
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.status(200).json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// API Routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const disasterRoutes = require('./routes/disasters');
const donationRoutes = require('./routes/donations');
const milestoneRoutes = require('./routes/milestones');
const adminRoutes = require('./routes/admin');
const volunteerVerificationRoutes = require('./routes/volunteerVerification');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteer-verification', volunteerVerificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'DeReFund API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      campaigns: '/api/campaigns',
      disasters: '/api/disasters',
      donations: '/api/donations',
      milestones: '/api/milestones',
      admin: '/api/admin'
    }
  });
});

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware (must be last)
const { globalErrorHandler } = require('./middleware/errorHandler');
app.use(globalErrorHandler);

// Start server
const PORT = env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  
  // Test database connection (non-blocking)
  testConnection().then(connected => {
    if (connected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed - check your .env file and Neon connection');
      console.log('💡 Server will continue running, but database operations may fail');
    }
  }).catch(err => {
    console.log('❌ Database connection test error:', err.message);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});

module.exports = app;

