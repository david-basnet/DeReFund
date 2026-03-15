const { pool } = require('../config/database');

// Create milestone
const createMilestone = async (milestoneData) => {
  const { campaign_id, title, description, amount_to_release, order_index } = milestoneData;
  const query = `
    INSERT INTO milestones (campaign_id, title, description, amount_to_release, order_index)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [campaign_id, title, description || null, amount_to_release, order_index]);
  return result.rows[0];
};

// Get milestone by ID
const getMilestoneById = async (milestoneId) => {
  const query = `
    SELECT m.*, c.title as campaign_title
    FROM milestones m
    LEFT JOIN campaigns c ON m.campaign_id = c.campaign_id
    WHERE m.milestone_id = $1
  `;
  const result = await pool.query(query, [milestoneId]);
  return result.rows[0];
};

// Get milestones by campaign
const getMilestonesByCampaign = async (campaignId) => {
  const query = `
    SELECT m.*
    FROM milestones m
    WHERE m.campaign_id = $1
    ORDER BY m.order_index ASC
  `;
  const result = await pool.query(query, [campaignId]);
  return result.rows;
};

// Update milestone status
const updateMilestoneStatus = async (milestoneId, status) => {
  const query = `
    UPDATE milestones 
    SET status = $1
    WHERE milestone_id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [status, milestoneId]);
  return result.rows[0];
};

module.exports = {
  createMilestone,
  getMilestoneById,
  getMilestonesByCampaign,
  updateMilestoneStatus
};

