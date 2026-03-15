const { pool } = require('../config/database');

// Create volunteer verification
const createVolunteerVerification = async (campaignId, volunteerId) => {
  const query = `
    INSERT INTO volunteer_verifications (campaign_id, volunteer_id)
    VALUES ($1, $2)
    ON CONFLICT (campaign_id, volunteer_id) DO NOTHING
    RETURNING *
  `;
  const result = await pool.query(query, [campaignId, volunteerId]);
  return result.rows[0];
};

// Get verification count for a campaign
const getVerificationCount = async (campaignId) => {
  const query = `
    SELECT COUNT(*) as count
    FROM volunteer_verifications
    WHERE campaign_id = $1
  `;
  const result = await pool.query(query, [campaignId]);
  return parseInt(result.rows[0].count);
};

// Check if volunteer has already verified
const hasVolunteerVerified = async (campaignId, volunteerId) => {
  const query = `
    SELECT COUNT(*) as count
    FROM volunteer_verifications
    WHERE campaign_id = $1 AND volunteer_id = $2
  `;
  const result = await pool.query(query, [campaignId, volunteerId]);
  return parseInt(result.rows[0].count) > 0;
};

// Get all verifications for a campaign
const getCampaignVerifications = async (campaignId) => {
  const query = `
    SELECT vv.*, u.name as volunteer_name, u.email as volunteer_email
    FROM volunteer_verifications vv
    JOIN users u ON vv.volunteer_id = u.user_id
    WHERE vv.campaign_id = $1
    ORDER BY vv.verified_at DESC
  `;
  const result = await pool.query(query, [campaignId]);
  return result.rows;
};

// Get campaigns pending verification (for volunteers to verify)
const getCampaignsPendingVerification = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT c.*, 
           u.name as ngo_name,
           dc.title as disaster_title,
           dc.location as disaster_location,
           (SELECT COUNT(*) FROM volunteer_verifications WHERE campaign_id = c.campaign_id) as verification_count
    FROM campaigns c
    LEFT JOIN users u ON c.ngo_id = u.user_id
    LEFT JOIN disaster_cases dc ON c.case_id = dc.case_id
    WHERE c.status = 'PENDING_VERIFICATION'
    ORDER BY c.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  
  const countQuery = `SELECT COUNT(*) FROM campaigns WHERE status = 'PENDING_VERIFICATION'`;
  const countResult = await pool.query(countQuery);
  
  return {
    campaigns: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit
  };
};

module.exports = {
  createVolunteerVerification,
  getVerificationCount,
  hasVolunteerVerified,
  getCampaignVerifications,
  getCampaignsPendingVerification
};

