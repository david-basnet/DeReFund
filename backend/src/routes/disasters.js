const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { validateDisasterCase } = require('../utils/validators');
const { create, getById, getAll, updateStatus } = require('../controllers/disasterController');

// Get all disasters (public)
router.get('/', getAll);

// Get disaster by ID (public)
router.get('/:caseId', getById);

// Create disaster case (authenticated)
router.post('/', authenticate, validateDisasterCase, create);

// Approve/Reject disaster (Admin only)
router.patch('/:caseId/status', authenticate, isAdmin, updateStatus);

module.exports = router;

