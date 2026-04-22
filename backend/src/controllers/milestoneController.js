const {
  createMilestone,
  deleteMilestone,
  getMilestoneById,
  getMilestonesByCampaign,
  updateMilestoneStatus,
  submitMilestoneProof,
  markMilestoneReleased,
  getSubmittedMilestonesForAdmin,
} = require('../services/milestoneService');
const { getCampaignById } = require('../services/campaignService');
const { ethers } = require('ethers');
const {
  addEscrowMilestone,
  getEscrowMilestoneTotals,
  approveEscrowMilestone,
  getEscrowMilestone,
  getEscrowBalance,
  usdToEthString,
} = require('../services/escrowService');
const { formatResponse } = require('../utils/helpers');
const { AppError } = require('../middleware/errorHandler');

function getEthersRevertReason(error) {
  return error?.reason || error?.shortMessage || error?.revert?.args?.[0] || error?.message || '';
}

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

    if (!campaign.contract_address) {
      return res.status(400).json(
        formatResponse(false, 'This campaign must have an escrow contract before milestones can be planned')
      );
    }

    // Check if milestones exceed campaign target
    const milestones = await getMilestonesByCampaign(campaign_id);
    const totalPlanned = milestones.reduce((sum, m) => sum + Number(m.amount_to_release), 0);
    const newTotal = totalPlanned + Number(amount_to_release);
    const target = Number(campaign.target_amount);

    if (newTotal > target) {
      return res.status(400).json(
        formatResponse(
          false,
          `Milestones exceed campaign target. Total planned ($${newTotal.toFixed(
            2
          )}) would exceed target ($${target.toFixed(2)})`
        )
      );
    }

    const requestedWei = ethers.parseEther(usdToEthString(amount_to_release));
    const escrowTotals = await getEscrowMilestoneTotals({ contractAddress: campaign.contract_address });
    if (escrowTotals.totalMilestoneWei + requestedWei > escrowTotals.targetWei) {
      const remainingUsd =
        Number(ethers.formatEther(escrowTotals.remainingWei)) *
        (target / Number(ethers.formatEther(escrowTotals.targetWei)));
      return res.status(400).json(
        formatResponse(
          false,
          `Milestones exceed the escrow target. The smart contract has ${escrowTotals.totalMilestoneEth} ETH already reserved for milestones, leaving about $${remainingUsd.toFixed(
            2
          )} available at the configured demo rate. Deleted app milestones cannot be removed from the deployed escrow contract.`
        )
      );
    }

    const escrowMilestone = await addEscrowMilestone({
      contractAddress: campaign.contract_address,
      title,
      amount: amount_to_release,
    });

    const milestone = await createMilestone({
      campaign_id,
      title,
      description,
      amount_to_release,
      order_index,
      escrow_milestone_id: escrowMilestone.escrowMilestoneId,
    });

    res.status(201).json(
      formatResponse(true, 'Milestone plan added to escrow successfully', {
        milestone,
        tx_hash: escrowMilestone.txHash,
      })
    );
  } catch (error) {
    const reason = getEthersRevertReason(error);
    if (reason.includes('Milestones exceed target')) {
      return next(
        new AppError(
          'Milestones exceed the escrow target. The deployed smart contract already has milestone amounts reserved up to the campaign target.',
          400
        )
      );
    }
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

const submitProof = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const { proof_url, proof_tx_hash } = req.body;

    if (!proof_url || String(proof_url).trim().length < 5) {
      return res.status(400).json(formatResponse(false, 'Proof URL is required'));
    }

    const milestone = await getMilestoneById(milestoneId);
    if (!milestone) {
      return res.status(404).json(formatResponse(false, 'Milestone not found'));
    }

    if (req.user.role !== 'ADMIN' && milestone.campaign_ngo_id !== req.user.userId) {
      return res.status(403).json(formatResponse(false, 'Not authorized to submit proof for this milestone'));
    }

    if (milestone.status === 'APPROVED') {
      return res.status(400).json(formatResponse(false, 'This milestone has already been released'));
    }

    const updated = await submitMilestoneProof(milestoneId, {
      proof_url: String(proof_url).trim(),
      proof_tx_hash: proof_tx_hash ? String(proof_tx_hash).trim() : null,
    });

    res.json(formatResponse(true, 'Milestone proof submitted for admin review', { milestone: updated }));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const milestone = await getMilestoneById(milestoneId);

    if (!milestone) {
      return res.status(404).json(formatResponse(false, 'Milestone not found'));
    }

    if (req.user.role !== 'NGO' || milestone.campaign_ngo_id !== req.user.userId) {
      return res.status(403).json(formatResponse(false, 'Only the assigned NGO can delete this milestone'));
    }

    if (milestone.status === 'APPROVED' || milestone.release_tx_hash) {
      return res.status(400).json(formatResponse(false, 'Released milestones cannot be deleted'));
    }

    const deleted = await deleteMilestone(milestoneId);

    res.json(
      formatResponse(true, 'Milestone removed from this campaign', {
        milestone: deleted,
        note: 'If this milestone was already added to the escrow contract, the on-chain record still exists but it is no longer used by the app.',
      })
    );
  } catch (error) {
    next(error);
  }
};

const release = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const milestone = await getMilestoneById(milestoneId);

    if (!milestone) {
      return res.status(404).json(formatResponse(false, 'Milestone not found'));
    }
    if (milestone.status !== 'SUBMITTED') {
      return res.status(400).json(formatResponse(false, 'Only submitted milestones can be released'));
    }
    if (!milestone.campaign_contract_address || milestone.escrow_milestone_id == null) {
      return res.status(400).json(formatResponse(false, 'Milestone is not linked to an escrow contract'));
    }

    const expectedEth = usdToEthString(milestone.amount_to_release);
    const onChainMilestone = await getEscrowMilestone({
      contractAddress: milestone.campaign_contract_address,
      escrowMilestoneId: milestone.escrow_milestone_id,
    });
    const requiredWei = onChainMilestone.amountWei;
    const escrowBalance = await getEscrowBalance({ contractAddress: milestone.campaign_contract_address });
    if (escrowBalance.balanceWei < requiredWei) {
      return res.status(400).json(
        formatResponse(
          false,
          `Insufficient escrow balance. This database milestone is $${milestone.amount_to_release}, which should be about ${expectedEth} ETH at the demo rate, but this already-created on-chain milestone requires ${onChainMilestone.amountEth} ETH. The escrow only has ${escrowBalance.balanceEth} ETH. Create a fresh campaign/milestone after the USD conversion fix, or fund this old escrow with the full on-chain amount.`
        )
      );
    }

    const releaseResult = await approveEscrowMilestone({
      contractAddress: milestone.campaign_contract_address,
      escrowMilestoneId: milestone.escrow_milestone_id,
    });

    const updated = await markMilestoneReleased(milestoneId, releaseResult.txHash);

    res.json(
      formatResponse(true, 'Milestone approved and funds released from escrow', {
        milestone: updated,
        tx_hash: releaseResult.txHash,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getSubmittedForAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 100);
    const offset = ((parseInt(page, 10) || 1) - 1) * safeLimit;
    const milestones = await getSubmittedMilestonesForAdmin(safeLimit, offset);

    res.json(formatResponse(true, 'Submitted milestones retrieved successfully', { milestones }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  getByCampaign,
  updateStatus,
  submitProof,
  remove,
  release,
  getSubmittedForAdmin,
};
