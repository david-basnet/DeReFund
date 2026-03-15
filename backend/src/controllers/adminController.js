const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');

// Verify user (NGO verification)
const verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, document_type, document_url } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Status must be APPROVED or REJECTED'));
    }

    // Check if verification record exists
    const existingVerification = await pool.query(
      'SELECT * FROM user_verification WHERE user_id = $1',
      [userId]
    );

    let result;
    if (existingVerification.rows.length > 0) {
      // Update existing verification
      const updateQuery = `
        UPDATE user_verification
        SET status = $1, verified_by = $2, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3
        RETURNING *
      `;
      result = await pool.query(updateQuery, [status, req.user.userId, userId]);
    } else {
      // Create new verification record
      const insertQuery = `
        INSERT INTO user_verification (user_id, document_type, document_url, status, verified_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      result = await pool.query(insertQuery, [
        userId, document_type || 'REGISTRATION', document_url || '', status, req.user.userId
      ]);
    }

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.userId, 'USER_VERIFICATION', JSON.stringify({ target_user: userId, status })]
    );

    res.json(formatResponse(true, `User verification ${status.toLowerCase()}`, { verification: result.rows[0] }));
  } catch (error) {
    next(error);
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const { getAllUsers } = require('../models/userModel');
    const result = await getAllUsers(parseInt(page), parseInt(limit), role);
    res.json(formatResponse(true, 'Users retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

// Get admin logs
const getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT al.*, u.name as admin_name
      FROM admin_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query('SELECT COUNT(*) FROM admin_logs');
    
    res.json(formatResponse(true, 'Admin logs retrieved successfully', {
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    }));
  } catch (error) {
    next(error);
  }
};

// Approve campaign after volunteer verification (Admin only)
const approveCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.body;

    if (!['LIVE', 'REJECTED'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Status must be LIVE or REJECTED'));
    }

    // Check if campaign exists and is in VERIFIED_BY_VOLUNTEERS status
    const campaign = await pool.query('SELECT * FROM campaigns WHERE campaign_id = $1', [campaignId]);
    if (campaign.rows.length === 0) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    if (campaign.rows[0].status !== 'VERIFIED_BY_VOLUNTEERS' && campaign.rows[0].status !== 'PENDING_ADMIN_APPROVAL') {
      return res.status(400).json(formatResponse(false, 'Campaign must be verified by volunteers before admin approval'));
    }

    // Update campaign status
    const updateQuery = `
      UPDATE campaigns 
      SET status = $1, admin_approved_by = $2, admin_approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE campaign_id = $3
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [status, req.user.userId, campaignId]);

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.userId, 'CAMPAIGN_APPROVAL', JSON.stringify({ campaign_id: campaignId, status })]
    );

    res.json(formatResponse(true, `Campaign ${status.toLowerCase()} successfully`, { campaign: result.rows[0] }));
  } catch (error) {
    next(error);
  }
};

// Get campaigns pending admin approval - OPTIMIZED with aggregation
const getCampaignsPendingApproval = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Single optimized query with subquery for verification count
    const query = `
      SELECT c.*, 
             u.name as ngo_name,
             dc.title as disaster_title,
             (SELECT COUNT(*) FROM volunteer_verifications WHERE campaign_id = c.campaign_id) as verification_count
      FROM campaigns c
      LEFT JOIN users u ON c.ngo_id = u.user_id
      LEFT JOIN disaster_cases dc ON c.case_id = dc.case_id
      WHERE c.status IN ('VERIFIED_BY_VOLUNTEERS', 'PENDING_ADMIN_APPROVAL')
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    // Get count and data in parallel for better performance
    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(
        `SELECT COUNT(*) FROM campaigns WHERE status IN ('VERIFIED_BY_VOLUNTEERS', 'PENDING_ADMIN_APPROVAL')`
      )
    ]);
    
    res.json(formatResponse(true, 'Campaigns retrieved successfully', {
      campaigns: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    }));
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats - NEW OPTIMIZED ENDPOINT
const getDashboardStats = async (req, res, next) => {
  try {
    // Use aggregation queries for much faster results
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'NGO' AND EXISTS (
          SELECT 1 FROM user_verification uv WHERE uv.user_id = users.user_id AND uv.status != 'APPROVED'
        )) as pending_verifications,
        (SELECT COUNT(*) FROM users WHERE role = 'NGO' AND EXISTS (
          SELECT 1 FROM user_verification uv WHERE uv.user_id = users.user_id AND uv.status = 'APPROVED'
        )) as verified_ngos,
        (SELECT COUNT(*) FROM disaster_cases WHERE status = 'PENDING') as pending_disasters,
        (SELECT COUNT(*) FROM campaigns WHERE status IN ('VERIFIED_BY_VOLUNTEERS', 'PENDING_ADMIN_APPROVAL')) as pending_campaigns,
        (SELECT COUNT(*) FROM campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'LIVE') as active_campaigns,
        (SELECT COUNT(*) FROM donations) as total_donations,
        (SELECT COALESCE(SUM(amount), 0) FROM donations) as total_raised
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    res.json(formatResponse(true, 'Dashboard stats retrieved successfully', {
      totalUsers: parseInt(stats.total_users) || 0,
      pendingVerifications: parseInt(stats.pending_verifications) || 0,
      verifiedNGOs: parseInt(stats.verified_ngos) || 0,
      pendingDisasters: parseInt(stats.pending_disasters) || 0,
      pendingCampaigns: parseInt(stats.pending_campaigns) || 0,
      totalCampaigns: parseInt(stats.total_campaigns) || 0,
      activeCampaigns: parseInt(stats.active_campaigns) || 0,
      totalDonations: parseInt(stats.total_donations) || 0,
      totalRaised: parseFloat(stats.total_raised) || 0
    }));
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { deleteUser: deleteUserModel } = require('../models/userModel');

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json(formatResponse(false, 'You cannot delete your own account'));
    }

    // Check if user exists
    const { getUserById } = require('../models/userModel');
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // Delete user
    await deleteUserModel(userId);

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.userId, 'USER_DELETION', JSON.stringify({ target_user: userId, deleted_user_name: user.name, deleted_user_email: user.email })]
    );

    res.json(formatResponse(true, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyUser,
  getAllUsers,
  getAdminLogs,
  approveCampaign,
  getCampaignsPendingApproval,
  getDashboardStats,
  deleteUser
};
