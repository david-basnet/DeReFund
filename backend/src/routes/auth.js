const express = require('express');
const router = express.Router();
const {
  validateRegister,
  validateLogin,
  validateRegistrationCodeRequest,
  validateRegistrationCodeVerify,
  validatePasswordResetCodeRequest,
  validatePasswordResetWithCode,
} = require('../utils/validators');
const { authenticate } = require('../middleware/auth');
const {
  sendRegistrationCode,
  verifyRegistrationCode,
  register,
  login,
  getProfile,
  getVerificationStatus,
  updateProfile,
  changePassword,
  sendPasswordResetCode,
  resetPasswordWithCode,
  deleteAccount,
} = require('../controllers/authController');

// Send registration email code
router.post('/register/send-code', validateRegistrationCodeRequest, sendRegistrationCode);

// Verify registration email code and create account
router.post('/register/verify', validateRegistrationCodeVerify, verifyRegistrationCode);

// Register route
router.post('/register', validateRegister, register);

// Login route
router.post('/login', validateLogin, login);

// Get current user profile
router.get('/me', authenticate, getProfile);

// Get current user's verification status
router.get('/verification-status', authenticate, getVerificationStatus);

// Update profile
router.patch('/profile', authenticate, updateProfile);

// Change password
router.patch('/password', authenticate, changePassword);

// Send password reset email code
router.post('/password/forgot', validatePasswordResetCodeRequest, sendPasswordResetCode);

// Verify reset code and set new password
router.patch('/password/reset', validatePasswordResetWithCode, resetPasswordWithCode);

// Delete account
router.delete('/account', authenticate, deleteAccount);

module.exports = router;

