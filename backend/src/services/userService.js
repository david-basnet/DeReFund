const { eq, desc, count } = require('drizzle-orm');
const { db } = require('../db/client');
const { users, userVerification } = require('../db/schema');

// Create user
const createUser = async (userData) => {
  const { name, email, password_hash, role, wallet_address } = userData;
  const [row] = await db
    .insert(users)
    .values({
      name,
      email,
      password_hash,
      role,
      wallet_address: wallet_address || null,
    })
    .returning({
      user_id: users.user_id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_active: users.is_active,
      wallet_address: users.wallet_address,
      created_at: users.created_at,
    });
  return row;
};

const getUserByEmail = async (email) => {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row;
};

const getUserById = async (userId) => {
  const [row] = await db
    .select({
      user_id: users.user_id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_active: users.is_active,
      wallet_address: users.wallet_address,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.user_id, userId))
    .limit(1);
  return row;
};

const getUserWithPassword = async (email) => {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row;
};

const updateUser = async (userId, updates) => {
  const allowed = ['name', 'email', 'password_hash', 'role', 'is_active', 'wallet_address'];
  const data = {};
  for (const k of allowed) {
    if (updates[k] !== undefined) data[k] = updates[k];
  }
  if (Object.keys(data).length === 0) return null;

  data.updated_at = new Date();

  const [row] = await db
    .update(users)
    .set(data)
    .where(eq(users.user_id, userId))
    .returning({
      user_id: users.user_id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_active: users.is_active,
      wallet_address: users.wallet_address,
      updated_at: users.updated_at,
    });
  return row;
};

const getAllUsers = async (page = 1, limit = 10, role = null) => {
  const offset = (page - 1) * limit;

  let listQ = db
    .select({
      user_id: users.user_id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_active: users.is_active,
      wallet_address: users.wallet_address,
      created_at: users.created_at,
      verification_status: userVerification.status,
      document_url: userVerification.document_url,
      document_filename: userVerification.document_filename,
      document_mimetype: userVerification.document_mimetype,
    })
    .from(users)
    .leftJoin(userVerification, eq(users.user_id, userVerification.user_id));

  listQ = role ? listQ.where(eq(users.role, role)) : listQ;

  const rows = await listQ.orderBy(desc(users.created_at)).limit(limit).offset(offset);

  let countQ = db.select({ total: count() }).from(users);
  countQ = role ? countQ.where(eq(users.role, role)) : countQ;
  const [countRow] = await countQ;

  return {
    users: rows,
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  };
};

const deleteUser = async (userId) => {
  await db.delete(users).where(eq(users.user_id, userId));
  return true;
};

const getLatestVerificationStatus = async (userId) => {
  const [row] = await db
    .select({ verification_status: userVerification.status })
    .from(userVerification)
    .where(eq(userVerification.user_id, userId))
    .orderBy(desc(userVerification.created_at))
    .limit(1);
  return row?.verification_status ?? null;
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUserWithPassword,
  updateUser,
  getAllUsers,
  deleteUser,
  getLatestVerificationStatus,
};
