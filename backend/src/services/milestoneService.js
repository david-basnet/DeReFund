const { eq, asc, desc } = require('drizzle-orm');
const { db } = require('../db/client');
const { milestones, campaigns, users } = require('../db/schema');

const createMilestone = async (milestoneData) => {
  const {
    campaign_id,
    title,
    description,
    amount_to_release,
    order_index,
    escrow_milestone_id,
  } = milestoneData;
  const [row] = await db
    .insert(milestones)
    .values({
      campaign_id,
      title,
      description: description || null,
      amount_to_release: String(amount_to_release),
      order_index,
      escrow_milestone_id: escrow_milestone_id ?? null,
    })
    .returning();
  return row;
};

const getMilestoneById = async (milestoneId) => {
  const [row] = await db
    .select({
      milestone_id: milestones.milestone_id,
      campaign_id: milestones.campaign_id,
      title: milestones.title,
      description: milestones.description,
      amount_to_release: milestones.amount_to_release,
      order_index: milestones.order_index,
      escrow_milestone_id: milestones.escrow_milestone_id,
      proof_url: milestones.proof_url,
      proof_tx_hash: milestones.proof_tx_hash,
      proof_submitted_at: milestones.proof_submitted_at,
      release_tx_hash: milestones.release_tx_hash,
      released_at: milestones.released_at,
      status: milestones.status,
      created_at: milestones.created_at,
      updated_at: milestones.updated_at,
      campaign_title: campaigns.title,
      campaign_contract_address: campaigns.contract_address,
      campaign_ngo_id: campaigns.ngo_id,
    })
    .from(milestones)
    .leftJoin(campaigns, eq(milestones.campaign_id, campaigns.campaign_id))
    .where(eq(milestones.milestone_id, milestoneId))
    .limit(1);
  return row;
};

const getMilestonesByCampaign = async (campaignId) => {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.campaign_id, campaignId))
    .orderBy(asc(milestones.order_index));
};

const updateMilestoneStatus = async (milestoneId, status) => {
  const [row] = await db
    .update(milestones)
    .set({ status, updated_at: new Date() })
    .where(eq(milestones.milestone_id, milestoneId))
    .returning();
  return row;
};

const deleteMilestone = async (milestoneId) => {
  const [row] = await db
    .delete(milestones)
    .where(eq(milestones.milestone_id, milestoneId))
    .returning();
  return row;
};

const submitMilestoneProof = async (milestoneId, { proof_url, proof_tx_hash }) => {
  const [row] = await db
    .update(milestones)
    .set({
      proof_url,
      proof_tx_hash: proof_tx_hash || null,
      proof_submitted_at: new Date(),
      status: 'SUBMITTED',
      updated_at: new Date(),
    })
    .where(eq(milestones.milestone_id, milestoneId))
    .returning();
  return row;
};

const markMilestoneReleased = async (milestoneId, releaseTxHash) => {
  const [row] = await db
    .update(milestones)
    .set({
      release_tx_hash: releaseTxHash,
      released_at: new Date(),
      status: 'APPROVED',
      updated_at: new Date(),
    })
    .where(eq(milestones.milestone_id, milestoneId))
    .returning();
  return row;
};

const getSubmittedMilestonesForAdmin = async (limit = 50, offset = 0) => {
  return db
    .select({
      milestone_id: milestones.milestone_id,
      campaign_id: milestones.campaign_id,
      title: milestones.title,
      description: milestones.description,
      amount_to_release: milestones.amount_to_release,
      order_index: milestones.order_index,
      escrow_milestone_id: milestones.escrow_milestone_id,
      proof_url: milestones.proof_url,
      proof_tx_hash: milestones.proof_tx_hash,
      proof_submitted_at: milestones.proof_submitted_at,
      release_tx_hash: milestones.release_tx_hash,
      released_at: milestones.released_at,
      status: milestones.status,
      created_at: milestones.created_at,
      updated_at: milestones.updated_at,
      campaign_title: campaigns.title,
      campaign_contract_address: campaigns.contract_address,
      ngo_name: users.name,
    })
    .from(milestones)
    .leftJoin(campaigns, eq(milestones.campaign_id, campaigns.campaign_id))
    .leftJoin(users, eq(campaigns.ngo_id, users.user_id))
    .where(eq(milestones.status, 'SUBMITTED'))
    .orderBy(desc(milestones.proof_submitted_at))
    .limit(limit)
    .offset(offset);
};

module.exports = {
  createMilestone,
  getMilestoneById,
  getMilestonesByCampaign,
  updateMilestoneStatus,
  deleteMilestone,
  submitMilestoneProof,
  markMilestoneReleased,
  getSubmittedMilestonesForAdmin,
};
