const { pool } = require('../config/database');

// Create donation
const createDonation = async (donationData) => {
  const { campaign_id, donor_id, amount, tx_hash, block_number, token_type } = donationData;
  const query = `
    INSERT INTO donations (campaign_id, donor_id, amount, tx_hash, block_number, token_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await pool.query(query, [
    campaign_id, donor_id, amount, tx_hash, block_number || null, token_type || 'MATIC'
  ]);
  return result.rows[0];
};

// Get donation by ID
const getDonationById = async (donationId) => {
  const query = `
    SELECT d.*, 
           u.name as donor_name,
           c.title as campaign_title
    FROM donations d
    LEFT JOIN users u ON d.donor_id = u.user_id
    LEFT JOIN campaigns c ON d.campaign_id = c.campaign_id
    WHERE d.donation_id = $1
  `;
  const result = await pool.query(query, [donationId]);
  return result.rows[0];
};

// Get donations by campaign
const getDonationsByCampaign = async (campaignId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT d.*, u.name as donor_name
    FROM donations d
    LEFT JOIN users u ON d.donor_id = u.user_id
    WHERE d.campaign_id = $1
    ORDER BY d.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [campaignId, limit, offset]);
  
  const countResult = await pool.query('SELECT COUNT(*) FROM donations WHERE campaign_id = $1', [campaignId]);
  
  return {
    donations: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit
  };
};

// Get donations by donor
const getDonationsByDonor = async (donorId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT d.*, c.title as campaign_title
    FROM donations d
    LEFT JOIN campaigns c ON d.campaign_id = c.campaign_id
    WHERE d.donor_id = $1
    ORDER BY d.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [donorId, limit, offset]);
  
  const countResult = await pool.query('SELECT COUNT(*) FROM donations WHERE donor_id = $1', [donorId]);
  
  return {
    donations: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit
  };
};

module.exports = {
  createDonation,
  getDonationById,
  getDonationsByCampaign,
  getDonationsByDonor
};

