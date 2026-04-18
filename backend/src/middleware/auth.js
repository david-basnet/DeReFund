const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

// Verify JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      userId: decoded.userId || decoded.user_id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user is admin
const isAdmin = authorize('ADMIN');

// Check if user is NGO
const isNGO = authorize('NGO');

// Check if user is donor
const isDonor = authorize('DONOR');

// Check if user is donor or NGO
const isDonorOrNGO = authorize('DONOR', 'NGO');

const maybeAuthenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      userId: decoded.userId || decoded.user_id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    // If token is invalid, just proceed without user info
    next();
  }
};

module.exports = {
  authenticate,
  maybeAuthenticate,
  authorize,
  isAdmin,
  isNGO,
  isDonor,
  isDonorOrNGO
};

