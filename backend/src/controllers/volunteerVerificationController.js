const { 
  createVolunteerVerification, 
  removeVolunteerVerification,
  getVerificationCount, 
  hasVolunteerVerified,
  getCampaignVerifications,
  getCampaignsPendingVerification
} = require('../services/volunteerVerificationService');
const { getCampaignById, updateCampaign } = require('../services/campaignService');
const { formatResponse } = require('../utils/helpers');

// const REQUIRED_VERIFICATIONS = 20; // Replaced by campaign-specific threshold

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
    const threshold = campaign.verification_threshold || 20;
    
    if (verificationCount >= threshold) {
      // Update campaign status to VERIFIED_BY_VOLUNTEERS
      await updateCampaign(campaignId, { 
        status: 'VERIFIED_BY_VOLUNTEERS',
        updated_at: new Date()
      });
    }

    res.json(formatResponse(true, 'Campaign verified successfully', {
      verificationCount,
      required: threshold,
      status: verificationCount >= threshold ? 'VERIFIED_BY_VOLUNTEERS' : 'PENDING_VERIFICATION'
    }));
  } catch (error) {
    next(error);
  }
};

// Remove a volunteer vote from a campaign
const unverifyCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const volunteerId = req.user.userId;
    const role = (req.user.role || '').toUpperCase();

    if (role !== 'DONOR') {
      return res.status(403).json(formatResponse(false, 'Only donor volunteers can remove campaign votes'));
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    if (campaign.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json(formatResponse(false, 'Votes can be changed only while campaign is pending verification'));
    }

    const existing = await hasVolunteerVerified(campaignId, volunteerId);
    if (!existing) {
      return res.status(400).json(formatResponse(false, 'You have not voted for this campaign'));
    }

    await removeVolunteerVerification(campaignId, volunteerId);
    const verificationCount = await getVerificationCount(campaignId);
    const threshold = campaign.verification_threshold || 20;

    res.json(formatResponse(true, 'Vote removed successfully', {
      verificationCount,
      required: threshold,
      status: campaign.status,
    }));
  } catch (error) {
    next(error);
  }
};

// Get campaigns pending verification
const getPendingVerificationCampaigns = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const volunteerId = req.user?.userId;
    const result = await getCampaignsPendingVerification(
      parseInt(page),
      parseInt(limit),
      volunteerId
    );
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
    const threshold = campaign.verification_threshold || 20;
    const hasVerified = volunteerId ? await hasVolunteerVerified(campaignId, volunteerId) : false;
    const verifications = await getCampaignVerifications(campaignId);

    res.json(formatResponse(true, 'Verification status retrieved successfully', {
      campaignId,
      status: campaign.status,
      verificationCount,
      required: threshold,
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
  unverifyCampaign,
  getPendingVerificationCampaigns,
  getCampaignVerificationStatus
};

