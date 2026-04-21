const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  verifyCampaign, 
  unverifyCampaign,
  getPendingVerificationCampaigns,
  getCampaignVerificationStatus 
} = require('../controllers/volunteerVerificationController');

// Get campaigns pending verification (authenticated donor volunteers only)
router.get('/pending', authenticate, authorize('DONOR'), getPendingVerificationCampaigns);

// Get verification status for a campaign (public, but shows user-specific info if authenticated)
router.get('/campaign/:campaignId', getCampaignVerificationStatus);

// Verify a campaign (volunteer action - authenticated)
router.post('/campaign/:campaignId/verify', authenticate, authorize('DONOR'), verifyCampaign);

// Remove a campaign verification vote while it is still pending
router.delete('/campaign/:campaignId/verify', authenticate, authorize('DONOR'), unverifyCampaign);

module.exports = router;

