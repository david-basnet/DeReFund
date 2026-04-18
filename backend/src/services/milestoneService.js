const { eq, asc } = require('drizzle-orm');
const { db } = require('../db/client');
const { milestones, campaigns } = require('../db/schema');

const createMilestone = async (milestoneData) => {
  const { campaign_id, title, description, amount_to_release, order_index } = milestoneData;
  const [row] = await db
    .insert(milestones)
    .values({
      campaign_id,
      title,
      description: description || null,
      amount_to_release: String(amount_to_release),
      order_index,
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
      status: milestones.status,
      created_at: milestones.created_at,
      updated_at: milestones.updated_at,
      campaign_title: campaigns.title,
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

module.exports = {
  createMilestone,
  getMilestoneById,
  getMilestonesByCampaign,
  updateMilestoneStatus,
};
