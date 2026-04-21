const {
  createUser,
  getUserByEmail,
  getUserWithPassword,
  getUserById,
  updateUser,
  deleteUser,
  getLatestVerificationStatus,
} = require('../services/userService');
const { hashPassword, comparePassword, generateToken, formatResponse } = require('../utils/helpers');
const { AppError } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');
const {
  createEmailAuthCode,
  getActiveEmailAuthCode,
  consumeEmailAuthCode,
} = require('../services/emailAuthCodeService');
const { sendAuthCodeEmail } = require('../services/mailService');
const { env } = require('../config/env');
const crypto = require('crypto');

const isValidWalletAddress = (value) => !value || /^0x[a-fA-F0-9]{40}$/.test(value);
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const generateEmailCode = () => String(crypto.randomInt(100000, 1000000));
const hashEmailCode = (email, purpose, code) =>
  crypto.createHash('sha256').update(`${normalizeEmail(email)}:${purpose}:${code}`).digest('hex');

const authCodeResponseData = (mailResult) => {
  if (env.NODE_ENV !== 'development' || !mailResult?.devCode) return null;
  return { dev_code: mailResult.devCode };
};

const issueEmailCode = async ({ email, purpose, payload }) => {
  const normalizedEmail = normalizeEmail(email);
  const code = generateEmailCode();
  const expiresAt = new Date(Date.now() + env.EMAIL_CODE_TTL_MINUTES * 60 * 1000);

  await createEmailAuthCode({
    email: normalizedEmail,
    purpose,
    code_hash: hashEmailCode(normalizedEmail, purpose, code),
    payload,
    expires_at: expiresAt,
  });

  return sendAuthCodeEmail({ to: normalizedEmail, code, purpose });
};

// Register user
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, wallet_address } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const cleanedWalletAddress = wallet_address ? String(wallet_address).trim() : '';

    if (!isValidWalletAddress(cleanedWalletAddress)) {
      return res.status(400).json(formatResponse(false, 'Wallet address must be a valid 0x Ethereum address'));
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json(formatResponse(false, 'User with this email already exists'));
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const userData = {
      name,
      email: normalizedEmail,
      password_hash,
      role: role || 'DONOR',
      wallet_address: cleanedWalletAddress || null
    };

    const mailResult = await issueEmailCode({
      email: normalizedEmail,
      purpose: 'REGISTER',
      payload: userData,
    });

    res.status(200).json(formatResponse(true, 'Verification code sent to your email', {
      email: normalizedEmail,
      requires_verification: true,
      ...authCodeResponseData(mailResult),
    }));
  } catch (error) {
    next(error);
  }
};

const verifyRegistrationCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json(formatResponse(false, 'User with this email already exists'));
    }

    const authCode = await getActiveEmailAuthCode(normalizedEmail, 'REGISTER');
    if (!authCode || authCode.code_hash !== hashEmailCode(normalizedEmail, 'REGISTER', code)) {
      return res.status(400).json(formatResponse(false, 'Invalid or expired verification code'));
    }

    const user = await createUser(authCode.payload);
    await consumeEmailAuthCode(authCode.auth_code_id);

    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role
    });

    res.status(201).json(formatResponse(true, 'Account verified and created successfully', {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address
      },
      token
    }));
  } catch (error) {
    next(error);
  }
};

const requestPasswordResetCode = async (req, res, next) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const user = await getUserByEmail(normalizedEmail);

    if (user) {
      const mailResult = await issueEmailCode({
        email: normalizedEmail,
        purpose: 'PASSWORD_RESET',
        payload: { user_id: user.user_id },
      });

      return res.json(formatResponse(true, 'Password reset code sent to your email', {
        email: normalizedEmail,
        ...authCodeResponseData(mailResult),
      }));
    }

    res.json(formatResponse(true, 'If this email exists, a password reset code has been sent'));
  } catch (error) {
    next(error);
  }
};

const resetPasswordWithCode = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json(formatResponse(false, 'Invalid or expired reset code'));
    }

    const authCode = await getActiveEmailAuthCode(normalizedEmail, 'PASSWORD_RESET');
    if (!authCode || authCode.code_hash !== hashEmailCode(normalizedEmail, 'PASSWORD_RESET', code)) {
      return res.status(400).json(formatResponse(false, 'Invalid or expired reset code'));
    }

    const password_hash = await hashPassword(newPassword);
    await updateUser(user.user_id, { password_hash });
    await consumeEmailAuthCode(authCode.auth_code_id);

    res.json(formatResponse(true, 'Password reset successfully. You can sign in now.'));
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const user = await getUserWithPassword(email);
    if (!user) {
      return res.status(401).json(formatResponse(false, 'Invalid email or password'));
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json(formatResponse(false, 'Account is deactivated'));
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json(formatResponse(false, 'Invalid email or password'));
    }

    // Generate token
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role
    });

    res.json(formatResponse(true, 'Login successful', {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address
      },
      token
    }));
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // If NGO, check if wallet is set and create notification if not
    if (user.role === 'NGO') {
      await notificationService.checkAndCreateWalletNotification(userId, user.wallet_address);
    }

    res.json(formatResponse(true, 'Profile retrieved successfully', { user }));
  } catch (error) {
    next(error);
  }
};

// Get current user's verification status
const getVerificationStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const verificationStatus = await getLatestVerificationStatus(userId);

    res.json(
      formatResponse(true, 'Verification status retrieved successfully', {
        verification_status: verificationStatus || null,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, email, wallet_address } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (wallet_address !== undefined) {
      const cleanedWalletAddress = String(wallet_address || '').trim();
      if (!isValidWalletAddress(cleanedWalletAddress)) {
        return res.status(400).json(formatResponse(false, 'Wallet address must be a valid 0x Ethereum address'));
      }
      updates.wallet_address = cleanedWalletAddress || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatResponse(false, 'No fields to update'));
    }

    // Check if email is being changed and already exists
    if (email && email !== req.user.email) {
      const existingUser = await getUserByEmail(email);
      if (existingUser && existingUser.user_id !== userId) {
        return res.status(409).json(formatResponse(false, 'Email already in use'));
      }
    }

    const updatedUser = await updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    res.json(formatResponse(true, 'Profile updated successfully', { user: updatedUser }));
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json(formatResponse(false, 'Current password and new password are required'));
    }

    // Get user with password
    const user = await getUserWithPassword(req.user.email);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json(formatResponse(false, 'Current password is incorrect'));
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json(formatResponse(false, 'New password must be at least 8 characters'));
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword);

    // Update password
    await updateUser(userId, { password_hash });

    res.json(formatResponse(true, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};

// Delete account
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json(formatResponse(false, 'Password is required to delete account'));
    }

    // Get user with password
    const user = await getUserWithPassword(req.user.email);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json(formatResponse(false, 'Password is incorrect'));
    }

    // Delete user
    await deleteUser(userId);

    res.json(formatResponse(true, 'Account deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyRegistrationCode,
  login,
  requestPasswordResetCode,
  resetPasswordWithCode,
  getProfile,
  getVerificationStatus,
  updateProfile,
  changePassword,
  deleteAccount
};
