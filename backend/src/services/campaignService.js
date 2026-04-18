const { eq, and, or, desc, sql, count, ilike, sum } = require('drizzle-orm');
const { alias } = require('drizzle-orm/pg-core');
const { db } = require('../db/client');
const { campaigns, users, disasterCases, donations, userVerification } = require('../db/schema');

const ngoUser = alias(users, 'ngo_user');
const creatorUser = alias(users, 'creator_user');

const campaignSelectWithJoins = {
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
  ngo_email: ngoUser.email,
  creator_name: creatorUser.name,
  disaster_title: disasterCases.title,
  disaster_location: disasterCases.location,
  disaster_images: disasterCases.images,
  disaster_video: disasterCases.video,
  disaster_description: disasterCases.description,
};

const createCampaign = async (campaignData) => {
  const {
    ngo_id,
    case_id,
    title,
    description,
    target_amount,
    contract_address,
    status,
    creation_source,
    creator_user_id,
    image_urls,
    verification_threshold,
  } = campaignData;

  const [row] = await db
    .insert(campaigns)
    .values({
      ngo_id,
      case_id,
      title,
      description,
      target_amount: String(target_amount),
      contract_address: contract_address || null,
      status: status || 'PENDING_ADMIN_APPROVAL',
      creation_source: creation_source || 'NGO',
      creator_user_id: creator_user_id || null,
      image_urls: Array.isArray(image_urls) ? image_urls.filter(Boolean) : [],
      verification_threshold: verification_threshold !== undefined ? parseInt(verification_threshold) : 20,
    })
    .returning();

  return row;
};

const getCampaignById = async (campaignId) => {
  const [row] = await db
    .select(campaignSelectWithJoins)
    .from(campaigns)
    .leftJoin(ngoUser, eq(campaigns.ngo_id, ngoUser.user_id))
    .leftJoin(creatorUser, eq(campaigns.creator_user_id, creatorUser.user_id))
    .leftJoin(disasterCases, eq(campaigns.case_id, disasterCases.case_id))
    .where(eq(campaigns.campaign_id, campaignId))
    .limit(1);

  return row;
};

const getAllCampaigns = async (page = 1, limit = 10, status = null, ngo_id = null, creator_user_id = null) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(campaigns.status, status));
  if (ngo_id) conditions.push(eq(campaigns.ngo_id, ngo_id));
  if (creator_user_id) conditions.push(eq(campaigns.creator_user_id, creator_user_id));
  const whereExpr = conditions.length ? and(...conditions) : undefined;

  let listQ = db
    .select(campaignSelectWithJoins)
    .from(campaigns)
    .leftJoin(ngoUser, eq(campaigns.ngo_id, ngoUser.user_id))
    .leftJoin(creatorUser, eq(campaigns.creator_user_id, creatorUser.user_id))
    .leftJoin(disasterCases, eq(campaigns.case_id, disasterCases.case_id));

  listQ = whereExpr ? listQ.where(whereExpr) : listQ;

  const resultRows = await listQ.orderBy(desc(campaigns.created_at)).limit(limit).offset(offset);

  let countQ = db.select({ total: count() }).from(campaigns);
  countQ = whereExpr ? countQ.where(whereExpr) : countQ;
  const [countRow] = await countQ;

  return {
    campaigns: resultRows,
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
};

const getPublicCampaigns = async (page = 1, limit = 12, search = '') => {
  const offset = (page - 1) * limit;
  const q = String(search || '').trim();
  const hasSearch = q.length > 0;
  const pattern = `%${q}%`;

  const searchCond = hasSearch
    ? or(
        ilike(campaigns.title, pattern),
        ilike(disasterCases.title, pattern),
        ilike(disasterCases.location, pattern),
        ilike(ngoUser.name, pattern)
      )
    : undefined;

  const baseWhere = searchCond
    ? and(eq(campaigns.status, 'LIVE'), searchCond)
    : eq(campaigns.status, 'LIVE');

  const [countRow] = await db
    .select({ total: count() })
    .from(campaigns)
    .leftJoin(ngoUser, eq(campaigns.ngo_id, ngoUser.user_id))
    .leftJoin(disasterCases, eq(campaigns.case_id, disasterCases.case_id))
    .where(baseWhere);

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
    })
    .from(campaigns)
    .leftJoin(ngoUser, eq(campaigns.ngo_id, ngoUser.user_id))
    .leftJoin(disasterCases, eq(campaigns.case_id, disasterCases.case_id))
    .where(baseWhere)
    .orderBy(desc(campaigns.created_at))
    .limit(limit)
    .offset(offset);

  return {
    campaigns: rows,
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
};

const getPublicCampaignById = async (campaignId) => {
  const [row] = await db
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
      created_at: campaigns.created_at,
      updated_at: campaigns.updated_at,
      ngo_name: ngoUser.name,
      ngo_email: ngoUser.email,
      disaster_title: disasterCases.title,
      disaster_location: disasterCases.location,
      disaster_images: disasterCases.images,
      disaster_video: disasterCases.video,
      disaster_description: disasterCases.description,
      verification_threshold: campaigns.verification_threshold,
    })
    .from(campaigns)
    .leftJoin(ngoUser, eq(campaigns.ngo_id, ngoUser.user_id))
    .leftJoin(disasterCases, eq(campaigns.case_id, disasterCases.case_id))
    .where(and(eq(campaigns.campaign_id, campaignId), eq(campaigns.status, 'LIVE')))
    .limit(1);

  return row;
};

const updateCampaign = async (campaignId, updates) => {
  const allowed = [
    'title',
    'description',
    'target_amount',
    'status',
    'contract_address',
    'image_urls',
    'ngo_reviewed_by',
    'ngo_reviewed_at',
    'admin_approved_by',
    'admin_approved_at',
    'updated_at',
    'current_amount',
  ];
  const data = {};
  for (const k of allowed) {
    if (updates[k] !== undefined) {
      if (k === 'target_amount' && updates[k] !== null) data[k] = String(updates[k]);
      else data[k] = updates[k];
    }
  }
  if (Object.keys(data).length === 0) return null;

  if (!data.updated_at) data.updated_at = new Date();

  const [row] = await db
    .update(campaigns)
    .set(data)
    .where(eq(campaigns.campaign_id, campaignId))
    .returning();

  return row;
};

const updateCampaignAmount = async (campaignId, amount) => {
  const [row] = await db
    .update(campaigns)
    .set({
      current_amount: sql`${campaigns.current_amount} + ${amount}`,
    })
    .where(eq(campaigns.campaign_id, campaignId))
    .returning();

  return row;
};

async function getDisasterStatus(caseId) {
  const [row] = await db
    .select({ status: disasterCases.status })
    .from(disasterCases)
    .where(eq(disasterCases.case_id, caseId))
    .limit(1);
  return row?.status ?? null;
}

async function isNgoVerificationApproved(ngoId) {
  const [row] = await db
    .select({ status: userVerification.status })
    .from(userVerification)
    .where(eq(userVerification.user_id, ngoId))
    .limit(1);
  return row?.status === 'APPROVED';
}

async function listVerifiedNgos() {
  return db
    .select({
      user_id: users.user_id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .innerJoin(userVerification, eq(users.user_id, userVerification.user_id))
    .where(and(eq(users.role, 'NGO'), eq(userVerification.status, 'APPROVED')))
    .orderBy(users.name);
}

async function findVerifiedNgoById(ngoId) {
  const [row] = await db
    .select({ user_id: users.user_id })
    .from(users)
    .innerJoin(userVerification, eq(users.user_id, userVerification.user_id))
    .where(
      and(eq(users.user_id, ngoId), eq(users.role, 'NGO'), eq(userVerification.status, 'APPROVED'))
    )
    .limit(1);
  return row;
}

async function fetchPublicImpactStats() {
  const [raisedRow] = await db
    .select({ totalRaised: sum(campaigns.current_amount) })
    .from(campaigns);
  const [liveRow] = await db
    .select({ n: count() })
    .from(campaigns)
    .where(eq(campaigns.status, 'LIVE'));
  const [verifiedRow] = await db
    .select({ n: count() })
    .from(users)
    .innerJoin(userVerification, eq(users.user_id, userVerification.user_id))
    .where(and(eq(users.role, 'NGO'), eq(userVerification.status, 'APPROVED')));
  const [donCount] = await db.select({ n: count() }).from(donations);

  return {
    totalRaised: parseFloat(raisedRow?.totalRaised ?? 0) || 0,
    liveCampaigns: Number(liveRow?.n ?? 0),
    verifiedNgos: Number(verifiedRow?.n ?? 0),
    donationCount: Number(donCount?.n ?? 0),
  };
}

module.exports = {
  createCampaign,
  getCampaignById,
  getAllCampaigns,
  getPublicCampaigns,
  getPublicCampaignById,
  updateCampaign,
  updateCampaignAmount,
  getDisasterStatus,
  isNgoVerificationApproved,
  listVerifiedNgos,
  findVerifiedNgoById,
  fetchPublicImpactStats,
};
