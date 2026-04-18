const { formatResponse } = require('../utils/helpers');
const {
  getAllUsers: listUsersPaginated,
  deleteUser: deleteUserRecord,
  getUserById,
} = require('../services/userService');
const {
  upsertUserVerificationByAdmin,
  insertAdminLog,
  getAdminLogsPaginated,
  getCampaignByIdRaw,
  updateCampaignAdminApproval,
  getCampaignsPendingApprovalRows,
  getDashboardStatsAggregated,
} = require('../services/adminService');

const verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, document_type, document_url } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Status must be APPROVED or REJECTED'));
    }

    const result = await upsertUserVerificationByAdmin({
      userId,
      status,
      document_type,
      document_url,
      verifiedBy: req.user.userId,
    });

    await insertAdminLog(
      req.user.userId,
      'USER_VERIFICATION',
      JSON.stringify({ target_user: userId, status })
    );

    res.json(formatResponse(true, `User verification ${status.toLowerCase()}`, { verification: result }));
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const result = await listUsersPaginated(parseInt(page, 10), parseInt(limit, 10), role);
    res.json(formatResponse(true, 'Users retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

const getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { logs, total } = await getAdminLogsPaginated(limit, offset);

    res.json(
      formatResponse(true, 'Admin logs retrieved successfully', {
        logs,
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      })
    );
  } catch (error) {
    next(error);
  }
};

const approveCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { status: adminAction } = req.body; // 'LIVE' or 'REJECTED' or 'APPROVE_PROPOSAL'

    const campaign = await getCampaignByIdRaw(campaignId);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    let nextStatus;
    if (adminAction === 'REJECTED') {
      nextStatus = 'REJECTED';
    } else if (adminAction === 'LIVE') {
      // NGO-created campaigns or confirmed donor proposals that have reached their verification threshold
      if (campaign.status !== 'VERIFIED_BY_VOLUNTEERS') {
        return res.status(400).json(formatResponse(false, `Campaign must reach its verification threshold (${campaign.verification_threshold || 20} volunteers) first`));
      }
      nextStatus = 'LIVE';
    } else if (adminAction === 'APPROVE_PROPOSAL') {
      // Donor-proposed campaigns that need admin initial check
      if (campaign.status !== 'PENDING_ADMIN_APPROVAL' || campaign.creation_source !== 'DONOR') {
        return res.status(400).json(formatResponse(false, 'Only pending donor proposals can be approved for NGO review'));
      }
      nextStatus = 'PENDING_NGO_VERIFICATION';
    } else {
      return res.status(400).json(formatResponse(false, 'Invalid approval action'));
    }

    const result = await updateCampaignAdminApproval(campaignId, nextStatus, req.user.userId);

    await insertAdminLog(
      req.user.userId,
      'CAMPAIGN_APPROVAL',
      JSON.stringify({ campaign_id: campaignId, previous_status: campaign.status, next_status: nextStatus })
    );

    res.json(formatResponse(true, `Campaign transitioned to ${nextStatus.toLowerCase()} successfully`, { campaign: result }));
  } catch (error) {
    next(error);
  }
};

const getCampaignsPendingApproval = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { campaigns: rows, total } = await getCampaignsPendingApprovalRows(limit, offset);

    res.json(
      formatResponse(true, 'Campaigns retrieved successfully', {
        campaigns: rows,
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      })
    );
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsAggregated();

    res.json(
      formatResponse(true, 'Dashboard stats retrieved successfully', {
        totalUsers: stats.total_users,
        pendingVerifications: stats.pending_verifications,
        verifiedNGOs: stats.verified_ngos,
        pendingDisasters: stats.pending_disasters,
        pendingCampaigns: stats.pending_campaigns,
        totalCampaigns: stats.total_campaigns,
        activeCampaigns: stats.active_campaigns,
        totalDonations: stats.total_donations,
        totalRaised: stats.total_raised,
      })
    );
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.userId) {
      return res.status(400).json(formatResponse(false, 'You cannot delete your own account'));
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    await deleteUserRecord(userId);

    await insertAdminLog(
      req.user.userId,
      'USER_DELETION',
      JSON.stringify({
        target_user: userId,
        deleted_user_name: user.name,
        deleted_user_email: user.email,
      })
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
  deleteUser,
};
