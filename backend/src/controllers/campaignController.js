const { createCampaign, getCampaignById, getAllCampaigns, updateCampaign } = require('../models/campaignModel');
const { formatResponse } = require('../utils/helpers');
const { pool } = require('../config/database');

// Create campaign
const create = async (req, res, next) => {
  try {
    const { case_id, title, description, target_amount, contract_address } = req.body;
    const ngo_id = req.user.userId;

    // Check if NGO is verified
    const verificationCheck = await pool.query(
      'SELECT status FROM user_verification WHERE user_id = $1',
      [ngo_id]
    );
    
    if (verificationCheck.rows.length === 0 || verificationCheck.rows[0].status !== 'APPROVED') {
      return res.status(403).json(formatResponse(false, 'Your NGO account must be approved before creating campaigns. Please submit verification documents and wait for admin approval.'));
    }

    // Require case_id (disaster must be selected)
    if (!case_id) {
      return res.status(400).json(formatResponse(false, 'A disaster case must be selected to create a campaign'));
    }

    // Verify the disaster exists and is approved
    const disasterCheck = await pool.query(
      'SELECT status FROM disaster_cases WHERE case_id = $1',
      [case_id]
    );

    if (disasterCheck.rows.length === 0) {
      return res.status(404).json(formatResponse(false, 'Disaster case not found'));
    }

    if (disasterCheck.rows[0].status !== 'APPROVED') {
      return res.status(400).json(formatResponse(false, 'Campaigns can only be created for approved disaster cases'));
    }

    const campaignData = {
      ngo_id,
      case_id,
      title,
      description,
      target_amount,
      contract_address: contract_address || null,
      status: 'PENDING_VERIFICATION' // Start in pending verification status
    };

    const campaign = await createCampaign(campaignData);
    res.status(201).json(formatResponse(true, 'Campaign created successfully. It will be verified by volunteers before going live.', { campaign }));
  } catch (error) {
    next(error);
  }
};

// Get campaign by ID
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

// Get all campaigns
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, ngo_id } = req.query;
    const result = await getAllCampaigns(parseInt(page), parseInt(limit), status, ngo_id);
    res.json(formatResponse(true, 'Campaigns retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

// Update campaign
const update = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { title, description, target_amount, status, contract_address } = req.body;

    // Check if campaign exists and belongs to user (if NGO)
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    // Only NGO owner or admin can update
    if (req.user.role !== 'ADMIN' && campaign.ngo_id !== req.user.userId) {
      return res.status(403).json(formatResponse(false, 'Not authorized to update this campaign'));
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (target_amount) updates.target_amount = target_amount;
    if (status) updates.status = status;
    if (contract_address) updates.contract_address = contract_address;

    const updatedCampaign = await updateCampaign(campaignId, updates);
    res.json(formatResponse(true, 'Campaign updated successfully', { campaign: updatedCampaign }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  getAll,
  update
};

