const express = require('express');
const router = express.Router();
const { authenticate, isNGO, isAdmin } = require('../middleware/auth');
const { validateCampaign } = require('../utils/validators');
const { create, getById, getAll, update } = require('../controllers/campaignController');

// All routes require authentication
router.use(authenticate);

// Get all campaigns
router.get('/', getAll);

// Get campaign by ID
router.get('/:campaignId', getById);

// Create campaign (NGO only)
router.post('/', isNGO, validateCampaign, create);

// Update campaign (NGO owner or Admin)
router.patch('/:campaignId', update);

module.exports = router;

