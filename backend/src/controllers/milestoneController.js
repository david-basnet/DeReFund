const { createMilestone, getMilestoneById, getMilestonesByCampaign, updateMilestoneStatus } = require('../models/milestoneModel');
const { getCampaignById } = require('../models/campaignModel');
const { formatResponse } = require('../utils/helpers');

// Create milestone
const create = async (req, res, next) => {
  try {
    const { campaign_id, title, description, amount_to_release, order_index } = req.body;

    // Verify campaign exists and belongs to user
    const campaign = await getCampaignById(campaign_id);
    if (!campaign) {
      return res.status(404).json(formatResponse(false, 'Campaign not found'));
    }

    if (req.user.role !== 'ADMIN' && campaign.ngo_id !== req.user.userId) {
      return res.status(403).json(formatResponse(false, 'Not authorized to add milestones to this campaign'));
    }

    const milestone = await createMilestone({
      campaign_id,
      title,
      description,
      amount_to_release,
      order_index
    });

    res.status(201).json(formatResponse(true, 'Milestone created successfully', { milestone }));
  } catch (error) {
    next(error);
  }
};

// Get milestone by ID
const getById = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const milestone = await getMilestoneById(milestoneId);

    if (!milestone) {
      return res.status(404).json(formatResponse(false, 'Milestone not found'));
    }

    res.json(formatResponse(true, 'Milestone retrieved successfully', { milestone }));
  } catch (error) {
    next(error);
  }
};

// Get milestones by campaign
const getByCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const milestones = await getMilestonesByCampaign(campaignId);
    res.json(formatResponse(true, 'Milestones retrieved successfully', { milestones }));
  } catch (error) {
    next(error);
  }
};

// Update milestone status
const updateStatus = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Invalid status'));
    }

    const milestone = await updateMilestoneStatus(milestoneId, status);
    res.json(formatResponse(true, 'Milestone status updated successfully', { milestone }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  getByCampaign,
  updateStatus
};

