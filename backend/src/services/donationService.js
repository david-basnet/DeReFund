const { eq, desc, count } = require('drizzle-orm');
const { db } = require('../db/client');
const { donations, users, campaigns } = require('../db/schema');

const createDonation = async (donationData) => {
  const { campaign_id, donor_id, amount, tx_hash, block_number, token_type } = donationData;
  const [row] = await db
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
  return row;
};

const getDonationById = async (donationId) => {
  const [row] = await db
    .select({
      donation_id: donations.donation_id,
      campaign_id: donations.campaign_id,
      donor_id: donations.donor_id,
      amount: donations.amount,
      tx_hash: donations.tx_hash,
      block_number: donations.block_number,
      token_type: donations.token_type,
      created_at: donations.created_at,
      donor_name: users.name,
      campaign_title: campaigns.title,
    })
    .from(donations)
    .leftJoin(users, eq(donations.donor_id, users.user_id))
    .leftJoin(campaigns, eq(donations.campaign_id, campaigns.campaign_id))
    .where(eq(donations.donation_id, donationId))
    .limit(1);
  return row;
};

const getDonationsByCampaign = async (campaignId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const rows = await db
    .select({
      donation_id: donations.donation_id,
      campaign_id: donations.campaign_id,
      donor_id: donations.donor_id,
      amount: donations.amount,
      tx_hash: donations.tx_hash,
      block_number: donations.block_number,
      token_type: donations.token_type,
      created_at: donations.created_at,
      donor_name: users.name,
    })
    .from(donations)
    .leftJoin(users, eq(donations.donor_id, users.user_id))
    .where(eq(donations.campaign_id, campaignId))
    .orderBy(desc(donations.created_at))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ total: count() })
    .from(donations)
    .where(eq(donations.campaign_id, campaignId));

  return {
    donations: rows,
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
};

const getDonationsByDonor = async (donorId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const rows = await db
    .select({
      donation_id: donations.donation_id,
      campaign_id: donations.campaign_id,
      donor_id: donations.donor_id,
      amount: donations.amount,
      tx_hash: donations.tx_hash,
      block_number: donations.block_number,
      token_type: donations.token_type,
      created_at: donations.created_at,
      campaign_title: campaigns.title,
    })
    .from(donations)
    .leftJoin(campaigns, eq(donations.campaign_id, campaigns.campaign_id))
    .where(eq(donations.donor_id, donorId))
    .orderBy(desc(donations.created_at))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ total: count() })
    .from(donations)
    .where(eq(donations.donor_id, donorId));

  return {
    donations: rows,
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
};

module.exports = {
  createDonation,
  getDonationById,
  getDonationsByCampaign,
  getDonationsByDonor,
};
