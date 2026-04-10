const { pool } = require('../config/database');

// Create campaign
const createCampaign = async (campaignData) => {
  const { ngo_id, case_id, title, description, target_amount, contract_address, status } = campaignData;
  const query = `
    INSERT INTO campaigns (ngo_id, case_id, title, description, target_amount, contract_address, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await pool.query(query, [
    ngo_id, case_id, title, description, target_amount, contract_address || null, status || 'PENDING_VERIFICATION'
  ]);
  return result.rows[0];
};

// Get campaign by ID
const getCampaignById = async (campaignId) => {
  const query = `
    SELECT c.*, 
           u.name as ngo_name,
           u.email as ngo_email,
           dc.title as disaster_title,
           dc.location as disaster_location
    FROM campaigns c
    LEFT JOIN users u ON c.ngo_id = u.user_id
    LEFT JOIN disaster_cases dc ON c.case_id = dc.case_id
    WHERE c.campaign_id = $1
  `;
  const result = await pool.query(query, [campaignId]);
  return result.rows[0];
};

// Get all campaigns
const getAllCampaigns = async (page = 1, limit = 10, status = null, ngo_id = null) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT c.*, 
           u.name as ngo_name,
           dc.title as disaster_title,
           dc.location as disaster_location
    FROM campaigns c
    LEFT JOIN users u ON c.ngo_id = u.user_id
    LEFT JOIN disaster_cases dc ON c.case_id = dc.case_id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (status) {
    query += ` AND c.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (ngo_id) {
    query += ` AND c.ngo_id = $${paramCount}`;
    params.push(ngo_id);
    paramCount++;
  }

  query += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  let countQuery = 'SELECT COUNT(*) FROM campaigns WHERE 1=1';
  const countParams = [];
  let countParamCount = 1;

  if (status) {
    countQuery += ` AND status = $${countParamCount}`;
    countParams.push(status);
    countParamCount++;
  }

  if (ngo_id) {
    countQuery += ` AND ngo_id = $${countParamCount}`;
    countParams.push(ngo_id);
  }

  const countResult = await pool.query(countQuery, countParams);

  return {
    campaigns: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit
  };
};

// Update campaign
const updateCampaign = async (campaignId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) return null;

  values.push(campaignId);
  const query = `
    UPDATE campaigns 
    SET ${fields.join(', ')}
    WHERE campaign_id = $${paramCount}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update campaign amount
const updateCampaignAmount = async (campaignId, amount) => {
  const query = `
    UPDATE campaigns 
    SET current_amount = current_amount + $1
    WHERE campaign_id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [amount, campaignId]);
  return result.rows[0];
};

module.exports = {
  createCampaign,
  getCampaignById,
  getAllCampaigns,
  updateCampaign,
  updateCampaignAmount
};

