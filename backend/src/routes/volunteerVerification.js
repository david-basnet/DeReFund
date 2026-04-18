const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  verifyCampaign, 
  getPendingVerificationCampaigns,
  getCampaignVerificationStatus 
} = require('../controllers/volunteerVerificationController');

// Get campaigns pending verification (authenticated - for volunteers/admins)
router.get('/pending', authenticate, authorize('DONOR', 'ADMIN'), getPendingVerificationCampaigns);

// Get verification status for a campaign (public, but shows user-specific info if authenticated)
router.get('/campaign/:campaignId', getCampaignVerificationStatus);

// Verify a campaign (volunteer action - authenticated)
router.post('/campaign/:campaignId/verify', authenticate, authorize('DONOR', 'ADMIN'), verifyCampaign);

module.exports = router;

