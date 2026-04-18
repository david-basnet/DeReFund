const { eq, and, desc, count, sql } = require('drizzle-orm');
const { alias } = require('drizzle-orm/pg-core');
const { db } = require('../db/client');
const { volunteerVerifications, campaigns, users, disasterCases } = require('../db/schema');

const volunteerUser = alias(users, 'volunteer_user');
const ngoUser = alias(users, 'ngo_user');

const createVolunteerVerification = async (campaignId, volunteerId) => {
  const [row] = await db
    .insert(volunteerVerifications)
    .values({ campaign_id: campaignId, volunteer_id: volunteerId })
    .onConflictDoNothing({
      target: [volunteerVerifications.campaign_id, volunteerVerifications.volunteer_id],
    })
    .returning();
  return row;
};

const getVerificationCount = async (campaignId) => {
  const [r] = await db
    .select({ c: count() })
    .from(volunteerVerifications)
    .where(eq(volunteerVerifications.campaign_id, campaignId));
  return Number(r?.c ?? 0);
};

const hasVolunteerVerified = async (campaignId, volunteerId) => {
  const [r] = await db
    .select({ c: count() })
    .from(volunteerVerifications)
    .where(
      and(
        eq(volunteerVerifications.campaign_id, campaignId),
        eq(volunteerVerifications.volunteer_id, volunteerId)
      )
    );
  return Number(r?.c ?? 0) > 0;
};

const getCampaignVerifications = async (campaignId) => {
  return db
    .select({
      verification_id: volunteerVerifications.verification_id,
      campaign_id: volunteerVerifications.campaign_id,
      volunteer_id: volunteerVerifications.volunteer_id,
      verified_at: volunteerVerifications.verified_at,
      volunteer_name: volunteerUser.name,
      volunteer_email: volunteerUser.email,
    })
    .from(volunteerVerifications)
    .innerJoin(volunteerUser, eq(volunteerVerifications.volunteer_id, volunteerUser.user_id))
    .where(eq(volunteerVerifications.campaign_id, campaignId))
    .orderBy(desc(volunteerVerifications.verified_at));
};

const getCampaignsPendingVerification = async (page = 1, limit = 10, volunteerId = null) => {
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      campaign_id: campaigns.campaign_id,
      ngo_id: campaigns.ngo_id,
      case_id: campaigns.case_id,
      title: campaigns.title,
      description: campaigns.description,
      target_amount: campaigns.target_amount,
      current_amount: campaigns.current_amount,
      contract_address: campaigns.contract_address,
      status: campaigns.status,
      admin_approved_by: campaigns.admin_approved_by,
      admin_approved_at: campaigns.admin_approved_at,
      creation_source: campaigns.creation_source,
      creator_user_id: campaigns.creator_user_id,
      ngo_reviewed_by: campaigns.ngo_reviewed_by,
      ngo_reviewed_at: campaigns.ngo_reviewed_at,
      image_urls: campaigns.image_urls,
      verification_threshold: campaigns.verification_threshold,
      created_at: campaigns.created_at,
      updated_at: campaigns.updated_at,
      ngo_name: ngoUser.name,
      disaster_title: disasterCases.title,
      disaster_location: disasterCases.location,
      disaster_images: disasterCases.images,
      disaster_video: disasterCases.video,
      disaster_description: disasterCases.description,
      verification_count: sql`(SELECT COUNT(*)::int FROM volunteer_verifications vv WHERE vv.campaign_id = ${campaigns.campaign_id})`.as(
        'verification_count'
      ),
      has_verified: volunteerId
        ? sql`EXISTS(SELECT 1 FROM volunteer_verifications vv WHERE vv.campaign_id = ${campaigns.campaign_id} AND vv.volunteer_id = ${volunteerId})`.as(
            'has_verified'
          )
        : sql`false`.as('has_verified'),
    })
    .from(campaigns)
    .leftJoin(ngoUser, eq(campaigns.ngo_id, ngoUser.user_id))
    .leftJoin(disasterCases, eq(campaigns.case_id, disasterCases.case_id))
    .where(eq(campaigns.status, 'PENDING_VERIFICATION'))
    .orderBy(desc(campaigns.created_at))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ total: count() })
    .from(campaigns)
    .where(eq(campaigns.status, 'PENDING_VERIFICATION'));

  return {
    campaigns: rows,
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
};

module.exports = {
  createVolunteerVerification,
  getVerificationCount,
  hasVolunteerVerified,
  getCampaignVerifications,
  getCampaignsPendingVerification,
};
