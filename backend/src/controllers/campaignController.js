const {
  createCampaign,
  getCampaignById,
  getAllCampaigns,
  getPublicCampaigns,
  getPublicCampaignById,
  updateCampaign,
  getDisasterStatus,
  isNgoVerificationApproved,
  listVerifiedNgos,
  findVerifiedNgoById,
  fetchPublicImpactStats,
} = require('../services/campaignService');
const { formatResponse } = require('../utils/helpers');
const { insertAdminLog } = require('../services/adminService');

function normalizeImageUrls(raw) {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

async function assertDisasterApproved(caseId) {
  const status = await getDisasterStatus(caseId);
  if (!status) {
    return { ok: false, code: 404, message: 'Disaster case not found' };
  }
  if (status !== 'APPROVED') {
    return { ok: false, code: 400, message: 'Campaigns can only be created for approved disaster cases' };
  }
  return { ok: true };
}

const getVerifiedNgos = async (req, res, next) => {
  try {
    const rows = await listVerifiedNgos();
    res.json(formatResponse(true, 'Verified NGOs', { ngos: rows }));
  } catch (error) {
    next(error);
  }
};

const getPublicImpactStats = async (req, res, next) => {
  try {
    const stats = await fetchPublicImpactStats();
    res.json(formatResponse(true, 'Public impact stats', stats));
  } catch (error) {
    next(error);
  }
};

const getPublicBrowse = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search = '' } = req.query;
    const result = await getPublicCampaigns(parseInt(page, 10), parseInt(limit, 10), search);
    res.json(formatResponse(true, 'Campaigns retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

const getPublicById = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const campaign = await getPublicCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found or not published'));
    }
    res.json(formatResponse(true, 'Campaign retrieved successfully', { campaign }));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { case_id, title, description, target_amount, contract_address, verification_threshold } = req.body;
    const ngo_id = req.user.userId;
    const image_urls = normalizeImageUrls(req.body.image_urls);

    if (!(await isNgoVerificationApproved(ngo_id))) {
      return res.status(403).json(
        formatResponse(
          false,
          'Your NGO account must be approved before creating campaigns. Please submit verification documents and wait for admin approval.'
        )
      );
    }

    if (!case_id) {
      return res.status(400).json(formatResponse(false, 'A disaster case must be selected to create a campaign'));
    }

    const disaster = await assertDisasterApproved(case_id);
    if (!disaster.ok) {
      return res.status(disaster.code).json(formatResponse(false, disaster.message));
    }

    // Validate verification_threshold
    let threshold = 20;
    if (verification_threshold !== undefined) {
      threshold = parseInt(verification_threshold);
      if (isNaN(threshold) || threshold < 5 || threshold > 50) {
        return res.status(400).json(formatResponse(false, 'Verification threshold must be between 5 and 50'));
      }
    }

    const campaignData = {
      ngo_id,
      case_id,
      title,
      description,
      target_amount,
      contract_address: contract_address || null,
      status: 'PENDING_VERIFICATION',
      creation_source: 'NGO',
      creator_user_id: ngo_id,
      image_urls,
      verification_threshold: threshold,
    };

    const campaign = await createCampaign(campaignData);
    res.status(201).json(
      formatResponse(
        true,
        `Campaign created. It must be verified by ${campaign.verification_threshold || 20} volunteers and then approved by an administrator before it goes live.`,
        { campaign }
      )
    );
  } catch (error) {
    next(error);
  }
};

const createAsDonor = async (req, res, next) => {
  try {
    const { case_id, title, description, target_amount, ngo_id, verification_threshold } = req.body;
    const donorId = req.user.userId;
    const image_urls = normalizeImageUrls(req.body.image_urls);

    if (!ngo_id || ngo_id === donorId) {
      return res.status(400).json(formatResponse(false, 'Select a verified NGO to partner on this campaign'));
    }

    const ngoUser = await findVerifiedNgoById(ngo_id);
    if (!ngoUser) {
      return res.status(400).json(formatResponse(false, 'Selected organization must be a verified NGO'));
    }

    const disaster = await assertDisasterApproved(case_id);
    if (!disaster.ok) {
      return res.status(disaster.code).json(formatResponse(false, disaster.message));
    }

    // Validate verification_threshold
    let threshold = 20;
    if (verification_threshold !== undefined) {
      threshold = parseInt(verification_threshold);
      if (isNaN(threshold) || threshold < 5 || threshold > 50) {
        return res.status(400).json(formatResponse(false, 'Verification threshold must be between 5 and 50'));
      }
    }

    const campaignData = {
      ngo_id,
      case_id,
      title,
      description,
      target_amount,
      contract_address: null,
      status: 'PENDING_ADMIN_APPROVAL',
      creation_source: 'DONOR',
      creator_user_id: donorId,
      image_urls,
      verification_threshold: threshold,
    };

    const campaign = await createCampaign(campaignData);
    res.status(201).json(
      formatResponse(
        true,
        'Campaign proposal submitted. An administrator will review it first, then the selected NGO must confirm it.',
        { campaign }
      )
    );
  } catch (error) {
    next(error);
  }
};

const ngoConfirm = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { approved } = req.body;
    const ngoId = req.user.userId;

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }
    if (campaign.status !== 'PENDING_NGO_VERIFICATION') {
      return res.status(400).json(formatResponse(false, 'This campaign is not waiting for NGO confirmation'));
    }
    if (campaign.ngo_id !== ngoId) {
      return res.status(403).json(formatResponse(false, 'Only the assigned NGO can confirm this campaign'));
    }

    if (approved) {
      const updated = await updateCampaign(campaignId, {
        status: 'PENDING_VERIFICATION',
        ngo_reviewed_by: ngoId,
        ngo_reviewed_at: new Date(),
        updated_at: new Date(),
      });
      await insertAdminLog(
        ngoId,
        'NGO_CAMPAIGN_CONFIRMATION',
        JSON.stringify({ campaign_id: campaignId, approved: true })
      );
      return res.json(
        formatResponse(true, `Campaign confirmed. It now requires verification from ${campaign.verification_threshold || 20} volunteers.`, {
          campaign: updated,
        })
      );
    }

    const updated = await updateCampaign(campaignId, {
      status: 'REJECTED',
      ngo_reviewed_by: ngoId,
      ngo_reviewed_at: new Date(),
      updated_at: new Date(),
    });
    await insertAdminLog(
      ngoId,
      'NGO_CAMPAIGN_REJECTION',
      JSON.stringify({ campaign_id: campaignId, approved: false })
    );
    return res.json(formatResponse(true, 'Campaign proposal rejected', { campaign: updated }));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    res.json(formatResponse(true, 'Campaign retrieved successfully', { campaign }));
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, ngo_id, creator_user_id } = req.query;
    const result = await getAllCampaigns(
      parseInt(page, 10),
      parseInt(limit, 10),
      status || null,
      ngo_id || null,
      creator_user_id || null
    );
    res.json(formatResponse(true, 'Campaigns retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { title, description, target_amount, status, contract_address, verification_threshold } = req.body;

    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwnerNgo = campaign.ngo_id === req.user.userId;
    const isCreatorDonor =
      campaign.creation_source === 'DONOR' &&
      campaign.creator_user_id === req.user.userId &&
      req.user.role === 'DONOR';

    if (!isAdmin && !isOwnerNgo && !(isCreatorDonor && campaign.status === 'PENDING_NGO_VERIFICATION')) {
      return res.status(403).json(formatResponse(false, 'Not authorized to update this campaign'));
    }

    if (!isAdmin && status !== undefined) {
      return res.status(403).json(formatResponse(false, 'Only administrators can change campaign status'));
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (target_amount !== undefined) updates.target_amount = target_amount;
    if (status && isAdmin) updates.status = status;
    if (contract_address !== undefined) updates.contract_address = contract_address;

    if (verification_threshold !== undefined) {
      const threshold = parseInt(verification_threshold);
      if (isNaN(threshold) || threshold < 5 || threshold > 50) {
        return res.status(400).json(formatResponse(false, 'Verification threshold must be between 5 and 50'));
      }
      updates.verification_threshold = threshold;
    }

    const extraImages = normalizeImageUrls(req.body.image_urls);
    if (extraImages.length > 0 || (req.body.image_urls !== undefined && Array.isArray(req.body.image_urls))) {
      updates.image_urls = extraImages;
    }

    const updatedCampaign = await updateCampaign(campaignId, updates);
    res.json(formatResponse(true, 'Campaign updated successfully', { campaign: updatedCampaign }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
