const { 
  createVolunteerVerification, 
  getVerificationCount, 
  hasVolunteerVerified,
  getCampaignVerifications,
  getCampaignsPendingVerification
} = require('../models/volunteerVerificationModel');
const { getCampaignById, updateCampaign } = require('../models/campaignModel');
const { formatResponse } = require('../utils/helpers');
const { pool } = require('../config/database');

const REQUIRED_VERIFICATIONS = 1;

// Verify a campaign (volunteer action)
const verifyCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const volunteerId = req.user.userId;
    const role = (req.user.role || '').toUpperCase();

    if (role !== 'DONOR') {
      return res.status(403).json(formatResponse(false, 'Only donor volunteers can verify campaigns'));
    }

    // Check if campaign exists
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    // Check if campaign is in pending verification status
    if (campaign.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json(formatResponse(false, 'Campaign is not pending verification'));
    }

    // Check if volunteer has already verified
    const alreadyVerified = await hasVolunteerVerified(campaignId, volunteerId);
    if (alreadyVerified) {
      return res.status(400).json(formatResponse(false, 'You have already verified this campaign'));
    }

    // Create verification
    await createVolunteerVerification(campaignId, volunteerId);

    // Check if we've reached the required number of verifications
    const verificationCount = await getVerificationCount(campaignId);
    
    if (verificationCount >= REQUIRED_VERIFICATIONS) {
      // Update campaign status to PENDING_ADMIN_APPROVAL (waiting for admin final approval)
      await updateCampaign(campaignId, { 
        status: 'PENDING_ADMIN_APPROVAL',
        updated_at: new Date()
      });
    }

    res.json(formatResponse(true, 'Campaign verified successfully', {
      verificationCount,
      required: REQUIRED_VERIFICATIONS,
      status: verificationCount >= REQUIRED_VERIFICATIONS ? 'PENDING_ADMIN_APPROVAL' : 'PENDING_VERIFICATION'
    }));
  } catch (error) {
    next(error);
  }
};

// Get campaigns pending verification
const getPendingVerificationCampaigns = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getCampaignsPendingVerification(parseInt(page), parseInt(limit));
    res.json(formatResponse(true, 'Campaigns retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

// Get verification status for a campaign
const getCampaignVerificationStatus = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const volunteerId = req.user?.userId;

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    const verificationCount = await getVerificationCount(campaignId);
    const hasVerified = volunteerId ? await hasVolunteerVerified(campaignId, volunteerId) : false;
    const verifications = await getCampaignVerifications(campaignId);

    res.json(formatResponse(true, 'Verification status retrieved successfully', {
      campaignId,
      status: campaign.status,
      verificationCount,
      required: REQUIRED_VERIFICATIONS,
      hasVerified,
      verifications,
      canVerify: campaign.status === 'PENDING_VERIFICATION' && !hasVerified && volunteerId
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyCampaign,
  getPendingVerificationCampaigns,
  getCampaignVerificationStatus
};

