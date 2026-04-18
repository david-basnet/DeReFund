const express = require('express');
const router = express.Router();
const { authenticate, maybeAuthenticate } = require('../middleware/auth');
const { validateDonation } = require('../utils/validators');
const { create, getById, getByCampaign, getByDonor, getAll } = require('../controllers/donationController');

// Get all donations (public ledger)
router.get('/all', getAll);

// Get donations by donor (authenticated)
router.get('/my-donations', authenticate, getByDonor);

// Get donations by campaign (public)
router.get('/campaign/:campaignId', getByCampaign);

// Get donation by ID (public)
router.get('/:donationId', getById);

// Create donation (authenticated or guest)
router.post('/', maybeAuthenticate, validateDonation, create);

module.exports = router;

