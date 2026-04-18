const { eq, and, ne, desc, count, sql, sum, inArray } = require('drizzle-orm');
const { alias } = require('drizzle-orm/pg-core');
const { db } = require('../db/client');
const {
  users,
  userVerification,
  disasterCases,
  campaigns,
  donations,
  volunteerVerifications,
  adminLogs,
} = require('../db/schema');

const ngoUser = alias(users, 'ngo_user');
const adminUser = alias(users, 'admin_user');

async function findUserVerificationByUserId(userId) {
  const [row] = await db
    .select()
    .from(userVerification)
    .where(eq(userVerification.user_id, userId))
    .limit(1);
  return row;
}

async function upsertUserVerificationByAdmin({ userId, status, document_type, document_url, verifiedBy }) {
  const existing = await findUserVerificationByUserId(userId);
  if (existing) {
    const [row] = await db
      .update(userVerification)
      .set({
        status,
        verified_by: verifiedBy,
        verified_at: new Date(),
        updated_at: new Date(),
        document_type: document_type || existing.document_type,
        document_url: document_url ?? existing.document_url,
      })
      .where(eq(userVerification.user_id, userId))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(userVerification)
    .values({
      user_id: userId,
      document_type: document_type || 'REGISTRATION',
      document_url: document_url || '',
      status,
      verified_by: verifiedBy,
      verified_at: new Date(),
    })
    .returning();
  return row;
}

async function insertAdminLog(userId, action, details) {
  await db.insert(adminLogs).values({
    user_id: userId,
    action,
    details: details != null ? String(details) : null,
  });
}

async function getAdminLogsPaginated(limit, offset) {
  const rows = await db
    .select({
      log_id: adminLogs.log_id,
      user_id: adminLogs.user_id,
      action: adminLogs.action,
      details: adminLogs.details,
      created_at: adminLogs.created_at,
      admin_name: adminUser.name,
    })
    .from(adminLogs)
    .leftJoin(adminUser, eq(adminLogs.user_id, adminUser.user_id))
    .orderBy(desc(adminLogs.created_at))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db.select({ total: count() }).from(adminLogs);

  return {
    logs: rows,
    total: Number(countRow?.total ?? 0),
  };
}

async function getCampaignByIdRaw(campaignId) {
  const [row] = await db.select().from(campaigns).where(eq(campaigns.campaign_id, campaignId)).limit(1);
  return row;
}

async function updateCampaignAdminApproval(campaignId, status, adminUserId) {
  const [row] = await db
    .update(campaigns)
    .set({
      status,
      admin_approved_by: adminUserId,
      admin_approved_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(campaigns.campaign_id, campaignId))
    .returning();
  return row;
}

async function getCampaignsPendingApprovalRows(limit, offset) {
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
      disaster_images: disasterCases.images,
      disaster_video: disasterCases.video,
      disaster_description: disasterCases.description,
      verification_count: sql`(SELECT COUNT(*)::int FROM volunteer_verifications vv WHERE vv.campaign_id = ${campaigns.campaign_id})`.as(
        'verification_count'
      ),
    })
    .from(campaigns)
    .leftJoin(ngoUser, eq(campaigns.ngo_id, ngoUser.user_id))
    .leftJoin(disasterCases, eq(campaigns.case_id, disasterCases.case_id))
    .where(inArray(campaigns.status, ['VERIFIED_BY_VOLUNTEERS', 'PENDING_ADMIN_APPROVAL']))
    .orderBy(desc(campaigns.created_at))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ total: count() })
    .from(campaigns)
    .where(inArray(campaigns.status, ['VERIFIED_BY_VOLUNTEERS', 'PENDING_ADMIN_APPROVAL']));

  return {
    campaigns: rows,
    total: Number(countRow?.total ?? 0),
  };
}

async function getDashboardStatsAggregated() {
  const [
    totalUsersRow,
    pendingVerRow,
    verifiedNgoRow,
    pendingDisastersRow,
    pendingCampaignsRow,
    totalCampaignsRow,
    activeCampaignsRow,
    totalDonationsRow,
    totalRaisedRow,
  ] = await Promise.all([
    db.select({ n: count() }).from(users),
    db
      .select({ n: count() })
      .from(users)
      .innerJoin(userVerification, eq(users.user_id, userVerification.user_id))
      .where(and(eq(users.role, 'NGO'), ne(userVerification.status, 'APPROVED'))),
    db
      .select({ n: count() })
      .from(users)
      .innerJoin(userVerification, eq(users.user_id, userVerification.user_id))
      .where(and(eq(users.role, 'NGO'), eq(userVerification.status, 'APPROVED'))),
    db.select({ n: count() }).from(disasterCases).where(eq(disasterCases.status, 'PENDING')),
    db
      .select({ n: count() })
      .from(campaigns)
      .where(inArray(campaigns.status, ['VERIFIED_BY_VOLUNTEERS', 'PENDING_ADMIN_APPROVAL'])),
    db.select({ n: count() }).from(campaigns),
    db.select({ n: count() }).from(campaigns).where(eq(campaigns.status, 'LIVE')),
    db.select({ n: count() }).from(donations),
    db.select({ total: sum(donations.amount) }).from(donations),
  ]);

  return {
    total_users: Number(totalUsersRow[0]?.n ?? 0),
    pending_verifications: Number(pendingVerRow[0]?.n ?? 0),
    verified_ngos: Number(verifiedNgoRow[0]?.n ?? 0),
    pending_disasters: Number(pendingDisastersRow[0]?.n ?? 0),
    pending_campaigns: Number(pendingCampaignsRow[0]?.n ?? 0),
    total_campaigns: Number(totalCampaignsRow[0]?.n ?? 0),
    active_campaigns: Number(activeCampaignsRow[0]?.n ?? 0),
    total_donations: Number(totalDonationsRow[0]?.n ?? 0),
    total_raised: parseFloat(totalRaisedRow[0]?.total ?? 0) || 0,
  };
}

module.exports = {
  findUserVerificationByUserId,
  upsertUserVerificationByAdmin,
  insertAdminLog,
  getAdminLogsPaginated,
  getCampaignByIdRaw,
  updateCampaignAdminApproval,
  getCampaignsPendingApprovalRows,
  getDashboardStatsAggregated,
};
