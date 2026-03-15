const express = require('express');
const router = express.Router();
const { validateRegister, validateLogin } = require('../utils/validators');
const { authenticate } = require('../middleware/auth');
const { register, login, getProfile, getVerificationStatus, updateProfile, changePassword, deleteAccount } = require('../controllers/authController');

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

// Delete account
router.delete('/account', authenticate, deleteAccount);

module.exports = router;

