const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateDonation } = require('../utils/validators');
const { create, getById, getByCampaign, getByDonor } = require('../controllers/donationController');

// Get donations by donor (authenticated)
router.get('/my-donations', authenticate, getByDonor);

// Get donations by campaign (public)
router.get('/campaign/:campaignId', getByCampaign);

// Get donation by ID (public)
router.get('/:donationId', getById);

// Create donation (authenticated)
router.post('/', authenticate, validateDonation, create);

module.exports = router;

