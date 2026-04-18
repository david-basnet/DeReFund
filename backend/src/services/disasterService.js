const { eq, and, desc, count } = require('drizzle-orm');
const { alias } = require('drizzle-orm/pg-core');
const { db } = require('../db/client');
const { disasterCases, users, campaigns } = require('../db/schema');
const { AppError } = require('../middleware/errorHandler');

const submitter = alias(users, 'submitter');

const createDisasterCase = async (disasterData) => {
  const { submitted_by, title, description, location, severity, longitude, latitude, images, video } = disasterData;
  const [row] = await db
    .insert(disasterCases)
    .values({
      submitted_by,
      title,
      description,
      location,
      severity: severity || 'MEDIUM',
      status: 'DRAFT', // Explicitly set to DRAFT
      longitude: longitude ?? null,
      latitude: latitude ?? null,
      images: Array.isArray(images) ? images : [],
      video: video || null,
    })
    .returning();
  return row;
};

const updateDisasterCase = async (caseId, userId, disasterData) => {
  const { title, description, location, severity, longitude, latitude, images, video } = disasterData;

  // Check ownership
  const [existing] = await db
    .select()
    .from(disasterCases)
    .where(eq(disasterCases.case_id, caseId))
    .limit(1);

  if (!existing) {
    throw new AppError('Disaster case not found', 404);
  }

  if (existing.submitted_by !== userId) {
    throw new AppError('You do not have permission to update this case', 403);
  }

  // Check if linked to campaign
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.case_id, caseId))
    .limit(1);

  if (campaign) {
    throw new AppError('Cannot update disaster case linked to a campaign', 400);
  }

  const [row] = await db
    .update(disasterCases)
    .set({
      title,
      description,
      location,
      severity,
      longitude,
      latitude,
      images,
      video,
      updated_at: new Date(),
    })
    .where(eq(disasterCases.case_id, caseId))
    .returning();

  return row;
};

const deleteDisasterCase = async (caseId, userId) => {
  // Check ownership
  const [existing] = await db
    .select()
    .from(disasterCases)
    .where(eq(disasterCases.case_id, caseId))
    .limit(1);

  if (!existing) {
    throw new AppError('Disaster case not found', 404);
  }

  if (existing.submitted_by !== userId) {
    throw new AppError('You do not have permission to delete this case', 403);
  }

  // Check if linked to campaign
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.case_id, caseId))
    .limit(1);

  if (campaign) {
    throw new AppError('Cannot delete disaster case linked to a campaign', 400);
  }

  await db.delete(disasterCases).where(eq(disasterCases.case_id, caseId));
  return true;
};

const getDisasterCaseById = async (caseId) => {
  const [row] = await db
    .select({
      case_id: disasterCases.case_id,
      submitted_by: disasterCases.submitted_by,
      title: disasterCases.title,
      description: disasterCases.description,
      location: disasterCases.location,
      severity: disasterCases.severity,
      status: disasterCases.status,
      longitude: disasterCases.longitude,
      latitude: disasterCases.latitude,
      images: disasterCases.images,
      video: disasterCases.video,
      reviewed_by: disasterCases.reviewed_by,
      reviewed_at: disasterCases.reviewed_at,
      created_at: disasterCases.created_at,
      updated_at: disasterCases.updated_at,
      submitted_by_name: submitter.name,
      submitted_by_email: submitter.email,
    })
    .from(disasterCases)
    .leftJoin(submitter, eq(disasterCases.submitted_by, submitter.user_id))
    .where(eq(disasterCases.case_id, caseId))
    .limit(1);
  return row;
};

const getAllDisasterCases = async (page = 1, limit = 10, status = null, severity = null, submittedBy = null) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  if (status) conditions.push(eq(disasterCases.status, status));
  if (severity) conditions.push(eq(disasterCases.severity, severity));
  if (submittedBy) conditions.push(eq(disasterCases.submitted_by, submittedBy));
  const whereExpr = conditions.length ? and(...conditions) : undefined;

  let listQ = db
    .select({
      case_id: disasterCases.case_id,
      submitted_by: disasterCases.submitted_by,
      title: disasterCases.title,
      description: disasterCases.description,
      location: disasterCases.location,
      severity: disasterCases.severity,
      status: disasterCases.status,
      longitude: disasterCases.longitude,
      latitude: disasterCases.latitude,
      images: disasterCases.images,
      video: disasterCases.video,
      reviewed_by: disasterCases.reviewed_by,
      reviewed_at: disasterCases.reviewed_at,
      created_at: disasterCases.created_at,
      updated_at: disasterCases.updated_at,
      submitted_by_name: users.name,
      campaign_id: campaigns.campaign_id,
    })
    .from(disasterCases)
    .leftJoin(users, eq(disasterCases.submitted_by, users.user_id))
    .leftJoin(campaigns, eq(disasterCases.case_id, campaigns.case_id));

  const queryWithConditions = whereExpr ? listQ.where(whereExpr) : listQ;

  const resultRows = await queryWithConditions.orderBy(desc(disasterCases.created_at)).limit(limit).offset(offset);

  let countQ = db.select({ total: count() }).from(disasterCases);
  if (whereExpr) countQ = countQ.where(whereExpr);
  const [countRow] = await countQ;

  return {
    disasters: resultRows,
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
};

const requestDisasterApproval = async (caseId, userId) => {
  const [existing] = await db
    .select()
    .from(disasterCases)
    .where(eq(disasterCases.case_id, caseId))
    .limit(1);

  if (!existing) {
    throw new AppError('Disaster case not found', 404);
  }

  if (existing.submitted_by !== userId) {
    throw new AppError('You do not have permission to request approval for this case', 403);
  }

  if (existing.status !== 'DRAFT') {
    throw new AppError('Only draft cases can be submitted for approval', 400);
  }

  const [row] = await db
    .update(disasterCases)
    .set({
      status: 'PENDING',
      updated_at: new Date(),
    })
    .where(eq(disasterCases.case_id, caseId))
    .returning();

  return row;
};

const updateDisasterStatus = async (caseId, status, reviewedBy) => {
  const [row] = await db
    .update(disasterCases)
    .set({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(disasterCases.case_id, caseId))
    .returning();
  return row;
};

module.exports = {
  createDisasterCase,
  updateDisasterCase,
  deleteDisasterCase,
  getDisasterCaseById,
  getAllDisasterCases,
  requestDisasterApproval,
  updateDisasterStatus,
};
