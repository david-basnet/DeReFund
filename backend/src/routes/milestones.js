const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { validateMilestone } = require('../utils/validators');
const { create, getById, getByCampaign, updateStatus, submitProof, remove } = require('../controllers/milestoneController');

// Get milestones by campaign (public)
router.get('/campaign/:campaignId', getByCampaign);

// Get milestone by ID (public)
router.get('/:milestoneId', getById);

// Create milestone (authenticated - NGO or Admin)
router.post('/', authenticate, validateMilestone, create);

// Submit proof after the NGO records it on the escrow contract
router.patch('/:milestoneId/proof', authenticate, submitProof);

// Delete milestone from app workflow (assigned NGO only, unreleased milestones)
router.delete('/:milestoneId', authenticate, remove);

// Update milestone status (Admin only)
router.patch('/:milestoneId/status', authenticate, isAdmin, updateStatus);

module.exports = router;

