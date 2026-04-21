const express = require('express');
const router = express.Router();
const {
  validateRegister,
  validateLogin,
  validateRegistrationCode,
  validateForgotPassword,
  validateResetPassword,
} = require('../utils/validators');
const { authenticate } = require('../middleware/auth');
const {
  register,
  verifyRegistrationCode,
  login,
  requestPasswordResetCode,
  resetPasswordWithCode,
  getProfile,
  getVerificationStatus,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');

// Register route
router.post('/register', validateRegister, register);

// Verify email code and create account
router.post('/register/verify', validateRegistrationCode, verifyRegistrationCode);

// Login route
router.post('/login', validateLogin, login);

// Password reset code flow
router.post('/password/forgot', validateForgotPassword, requestPasswordResetCode);
router.post('/password/reset', validateResetPassword, resetPasswordWithCode);

// Get current user profile
router.get('/me', authenticate, getProfile);

// Get current user's verification status
router.get('/verification-status', authenticate, getVerificationStatus);

// Update profile
router.patch('/profile', authenticate, updateProfile);

// Change password
router.patch('/password', authenticate, changePassword);

// Delete account
router.delete('/account', authenticate, deleteAccount);

module.exports = router;

