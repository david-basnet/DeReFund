const { pool } = require('../config/database');
const { getDonationById, getDonationsByCampaign, getDonationsByDonor } = require('../models/donationModel');
const { formatResponse } = require('../utils/helpers');

// Create donation
const create = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { campaign_id, amount, tx_hash, block_number, token_type } = req.body;
    const donor_id = req.user.userId;
    await client.query('BEGIN');

    if (!/^0x[a-fA-F0-9]{64}$/.test(tx_hash || '')) {
      await client.query('ROLLBACK');
      return res.status(400).json(formatResponse(false, 'Invalid transaction hash format'));
    }

    // Check if tx_hash already exists
    const existingDonation = await client.query('SELECT donation_id FROM donations WHERE tx_hash = $1', [tx_hash]);
    if (existingDonation.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json(formatResponse(false, 'Transaction already recorded'));
    }

    // Check if campaign exists and is LIVE (only LIVE campaigns can receive donations)
    const campaign = await client.query('SELECT status FROM campaigns WHERE campaign_id = $1 FOR UPDATE', [campaign_id]);
    if (campaign.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }
    if (campaign.rows[0].status !== 'LIVE') {
      await client.query('ROLLBACK');
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

    const donationInsertQuery = `
      INSERT INTO donations (campaign_id, donor_id, amount, tx_hash, block_number, token_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const donationResult = await client.query(donationInsertQuery, [
      donationData.campaign_id,
      donationData.donor_id,
      donationData.amount,
      donationData.tx_hash,
      donationData.block_number,
      donationData.token_type
    ]);
    const donation = donationResult.rows[0];

    // Update campaign current amount atomically in same transaction
    await client.query(
      'UPDATE campaigns SET current_amount = current_amount + $1 WHERE campaign_id = $2',
      [amount, campaign_id]
    );

    await client.query('COMMIT');

    res.status(201).json(formatResponse(true, 'Donation recorded successfully', { donation }));
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      // no-op: transaction may already be closed
    }
    next(error);
  } finally {
    client.release();
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

