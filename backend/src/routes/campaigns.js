const express = require('express');
const router = express.Router();
const { authenticate, isNGO, isDonor } = require('../middleware/auth');
const {
  validateCampaign,
  validateDonorCampaign,
  validateNgoCampaignDecision,
} = require('../utils/validators');
const {
  create,
  createAsDonor,
  ngoConfirm,
  getVerifiedNgos,
  getPublicImpactStats,
  getPublicBrowse,
  getPublicById,
  getById,
  getAll,
  update,
  remove,
} = require('../controllers/campaignController');

// Public — no auth (specific paths before :campaignId)
router.get('/public/verified-ngos', getVerifiedNgos);
router.get('/public/stats', getPublicImpactStats);
router.get('/public', getPublicBrowse);
router.get('/public/:campaignId', getPublicById);

router.use(authenticate);

router.get('/', getAll);
router.post('/donor-proposal', isDonor, validateDonorCampaign, createAsDonor);
router.post('/', isNGO, validateCampaign, create);
router.patch('/:campaignId/ngo-confirm', isNGO, validateNgoCampaignDecision, ngoConfirm);
router.get('/:campaignId', getById);
router.patch('/:campaignId', update);
router.delete('/:campaignId', remove);

module.exports = router;
