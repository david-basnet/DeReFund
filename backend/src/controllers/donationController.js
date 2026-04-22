const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { donations, campaigns } = require('../db/schema');
const {
  getDonationById,
  getDonationsByCampaign,
  getDonationsByDonor,
  getDonationsByNgo,
  getAllDonations,
} = require('../services/donationService');
const { formatResponse } = require('../utils/helpers');
const { AppError } = require('../middleware/errorHandler');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllDonations(parseInt(page, 10), parseInt(limit, 10));
    res.json(formatResponse(true, 'Donations retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { campaign_id, amount, tx_hash, block_number, token_type } = req.body;
    const donor_id = req.user?.userId || null;

    if (!campaign_id || !amount || !tx_hash) {
      return res.status(400).json(formatResponse(false, 'Missing required fields'));
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(tx_hash || '')) {
      return res.status(400).json(formatResponse(false, 'Invalid transaction hash format'));
    }

    const donation = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ donation_id: donations.donation_id })
        .from(donations)
        .where(eq(donations.tx_hash, tx_hash))
        .limit(1);

      if (existing) {
        throw new AppError('Transaction already recorded', 409);
      }

      const [campaign] = await tx
        .select({
          status: campaigns.status,
          current_amount: campaigns.current_amount,
          target_amount: campaigns.target_amount,
        })
        .from(campaigns)
        .where(eq(campaigns.campaign_id, campaign_id))
        .limit(1);

      if (!campaign) {
        throw new AppError('Campaign not found', 404);
      }
      if (campaign.status !== 'LIVE') {
        throw new AppError(
          'Campaign is not yet approved for donations. It must be verified by volunteers and approved by admin.',
          400
        );
      }

      const donationAmount = Number(amount);
      const currentAmount = Number(campaign.current_amount || 0);
      const targetAmount = Number(campaign.target_amount || 0);
      const remainingAmount = Math.max(targetAmount - currentAmount, 0);

      if (currentAmount >= targetAmount) {
        throw new AppError('This campaign is already 100% funded and cannot receive more donations.', 400);
      }

      if (donationAmount > remainingAmount) {
        throw new AppError(
          `This donation exceeds the remaining goal. Maximum allowed is $${remainingAmount.toFixed(2)}.`,
          400
        );
      }

      const newCurrentAmount = Math.min(targetAmount, currentAmount + donationAmount);

      const [row] = await tx
        .insert(donations)
        .values({
          campaign_id,
          donor_id,
          amount: String(amount),
          tx_hash,
          block_number: block_number ?? null,
          token_type: token_type || 'MATIC',
        })
        .returning();

      await tx
        .update(campaigns)
        .set({
          current_amount: newCurrentAmount.toFixed(2),
        })
        .where(eq(campaigns.campaign_id, campaign_id));

      return row;
    });

    res.status(201).json(formatResponse(true, 'Donation recorded successfully', { donation }));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const donation = await getDonationById(donationId);

    if (!donation) {
      return res.status(404).json(formatResponse(false, 'Donation not found'));
    }

    res.json(formatResponse(true, 'Donation retrieved successfully', { donation }));
  } catch (error) {
    next(error);
  }
};

const getByCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const result = await getDonationsByCampaign(campaignId, parseInt(page, 10), parseInt(limit, 10));
    res.json(formatResponse(true, 'Donations retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

const getByDonor = async (req, res, next) => {
  try {
    const donorId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const result = await getDonationsByDonor(donorId, parseInt(page, 10), parseInt(limit, 10));
    res.json(formatResponse(true, 'Your donations retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

const getByNgo = async (req, res, next) => {
  try {
    const ngoId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;
    const result = await getDonationsByNgo(ngoId, parseInt(page, 10), parseInt(limit, 10));
    res.json(formatResponse(true, 'NGO donations retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  getByCampaign,
  getByDonor,
  getByNgo,
  getAll,
};
