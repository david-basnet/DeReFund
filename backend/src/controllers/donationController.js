const { pool } = require('../config/database');
const { createDonation, getDonationById, getDonationsByCampaign, getDonationsByDonor } = require('../models/donationModel');
const { updateCampaignAmount } = require('../models/campaignModel');
const { formatResponse } = require('../utils/helpers');

// Create donation
const create = async (req, res, next) => {
  try {
    const { campaign_id, amount, tx_hash, block_number, token_type } = req.body;
    const donor_id = req.user.userId;

    // Check if tx_hash already exists
    const existingDonation = await pool.query('SELECT * FROM donations WHERE tx_hash = $1', [tx_hash]);
    if (existingDonation.rows.length > 0) {
      return res.status(409).json(formatResponse(false, 'Transaction already recorded'));
    }

    // Check if campaign exists and is LIVE (only LIVE campaigns can receive donations)
    const campaign = await pool.query('SELECT status FROM campaigns WHERE campaign_id = $1', [campaign_id]);
    if (campaign.rows.length === 0) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }
    if (campaign.rows[0].status !== 'LIVE') {
      return res.status(400).json(formatResponse(false, 'Campaign is not yet approved for donations. It must be verified by volunteers and approved by admin.'));
    }

    const donationData = {
      campaign_id,
      donor_id,
      amount,
      tx_hash,
      block_number: block_number || null,
      token_type: token_type || 'MATIC'
    };

    const donation = await createDonation(donationData);
    
    // Update campaign current amount
    await updateCampaignAmount(campaign_id, amount);

    res.status(201).json(formatResponse(true, 'Donation recorded successfully', { donation }));
  } catch (error) {
    next(error);
  }
};

// Get donation by ID
const getById = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const donation = await getDonationById(donationId);

    if (!donation) {
      return res.status(404).json(formatResponse(false, 'Donation not found'));
    }

    res.json(formatResponse(true, 'Donation retrieved successfully', { donation }));
  } catch (error) {
    next(error);
  }
};

// Get donations by campaign
const getByCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const result = await getDonationsByCampaign(campaignId, parseInt(page), parseInt(limit));
    res.json(formatResponse(true, 'Donations retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

// Get donations by donor
const getByDonor = async (req, res, next) => {
  try {
    const donorId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const result = await getDonationsByDonor(donorId, parseInt(page), parseInt(limit));
    res.json(formatResponse(true, 'Your donations retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  getByCampaign,
  getByDonor
};

