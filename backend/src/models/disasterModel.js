const { pool } = require('../config/database');

// Create disaster case
const createDisasterCase = async (disasterData) => {
  const { submitted_by, title, description, location, severity, longitude, latitude, images, video } = disasterData;
  const query = `
    INSERT INTO disaster_cases (submitted_by, title, description, location, severity, longitude, latitude, images, video)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const result = await pool.query(query, [
    submitted_by, title, description, location, severity || 'MEDIUM',
    longitude || null, latitude || null, images || [], video || null
  ]);
  return result.rows[0];
};

// Get disaster case by ID
const getDisasterCaseById = async (caseId) => {
  const query = `
    SELECT dc.*, 
           u.name as submitted_by_name,
           u.email as submitted_by_email
    FROM disaster_cases dc
    LEFT JOIN users u ON dc.submitted_by = u.user_id
    WHERE dc.case_id = $1
  `;
  const result = await pool.query(query, [caseId]);
  return result.rows[0];
};

// Get all disaster cases
const getAllDisasterCases = async (page = 1, limit = 10, status = null, severity = null) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT dc.*, 
           u.name as submitted_by_name
    FROM disaster_cases dc
    LEFT JOIN users u ON dc.submitted_by = u.user_id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (status) {
    query += ` AND dc.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (severity) {
    query += ` AND dc.severity = $${paramCount}`;
    params.push(severity);
    paramCount++;
  }

  query += ` ORDER BY dc.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  
  const countQuery = `
    SELECT COUNT(*) FROM disaster_cases 
    WHERE 1=1 ${status ? `AND status = '${status}'` : ''} ${severity ? `AND severity = '${severity}'` : ''}
  `;
  const countResult = await pool.query(countQuery);

  return {
    disasters: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit
  };
};

// Update disaster case status
const updateDisasterStatus = async (caseId, status, reviewedBy) => {
  const query = `
    UPDATE disaster_cases 
    SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
    WHERE case_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [status, reviewedBy, caseId]);
  return result.rows[0];
};

module.exports = {
  createDisasterCase,
  getDisasterCaseById,
  getAllDisasterCases,
  updateDisasterStatus
};

