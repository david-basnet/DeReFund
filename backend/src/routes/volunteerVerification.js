const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  verifyCampaign, 
  getPendingVerificationCampaigns,
  getCampaignVerificationStatus 
} = require('../controllers/volunteerVerificationController');

// Get campaigns pending verification (authenticated - for volunteers)
router.get('/pending', authenticate, authorize('DONOR'), getPendingVerificationCampaigns);

// Get verification status for a campaign (public, but shows user-specific info if authenticated)
router.get('/campaign/:campaignId', getCampaignVerificationStatus);

// Verify a campaign (volunteer action - authenticated)
router.post('/campaign/:campaignId/verify', authenticate, authorize('DONOR'), verifyCampaign);

module.exports = router;

