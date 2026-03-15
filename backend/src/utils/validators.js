const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  body('role')
    .isIn(['DONOR', 'NGO', 'ADMIN'])
    .withMessage('Role must be DONOR, NGO, or ADMIN'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Campaign validation
const validateCampaign = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('target_amount')
    .isFloat({ min: 0.01 })
    .withMessage('Target amount must be greater than 0'),
  body('case_id')
    .notEmpty()
    .withMessage('A disaster case must be selected')
    .isUUID()
    .withMessage('Invalid case ID format'),
  handleValidationErrors
];

// Disaster case validation
const validateDisasterCase = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('location')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Location must be between 3 and 150 characters'),
  body('severity')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Severity must be LOW, MEDIUM, HIGH, or CRITICAL'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  handleValidationErrors
];

// Milestone validation
const validateMilestone = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be between 5 and 150 characters'),
  body('amount_to_release')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('order_index')
    .isInt({ min: 0 })
    .withMessage('Order index must be a non-negative integer'),
  handleValidationErrors
];

// Donation validation
const validateDonation = [
  body('campaign_id')
    .isUUID()
    .withMessage('Invalid campaign ID format'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('tx_hash')
    .trim()
    .isLength({ min: 64, max: 66 })
    .withMessage('Transaction hash must be a valid hash'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateCampaign,
  validateDisasterCase,
  validateMilestone,
  validateDonation
};

