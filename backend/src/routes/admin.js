const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { verifyUser, getAllUsers, getAdminLogs, approveCampaign, getCampaignsPendingApproval, getDashboardStats, deleteUser } = require('../controllers/adminController');
const { getSubmittedForAdmin, release } = require('../controllers/milestoneController');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Verify user (NGO verification)
router.patch('/verify-user/:userId', verifyUser);

// Get all users
router.get('/users', getAllUsers);

// Delete user
router.delete('/users/:userId', deleteUser);

// Get admin logs
router.get('/logs', getAdminLogs);

// Get campaigns pending admin approval
router.get('/campaigns/pending', getCampaignsPendingApproval);

// Get milestone proofs waiting for release approval
router.get('/milestones/submitted', getSubmittedForAdmin);

// Approve proof and release escrow funds
router.patch('/milestones/:milestoneId/release', release);

// Approve/reject campaign after volunteer verification
router.patch('/campaigns/:campaignId/approve', approveCampaign);

// Get dashboard stats (optimized single query)
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;

