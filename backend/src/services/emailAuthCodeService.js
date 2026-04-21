const { and, desc, eq, gt, isNull } = require('drizzle-orm');
const { db } = require('../db/client');
const { emailAuthCodes } = require('../db/schema');

const createEmailAuthCode = async ({ email, purpose, code_hash, payload, expires_at }) => {
  await db
    .update(emailAuthCodes)
    .set({ consumed_at: new Date() })
    .where(and(
      eq(emailAuthCodes.email, email),
      eq(emailAuthCodes.purpose, purpose),
      isNull(emailAuthCodes.consumed_at)
    ));

  const [row] = await db
    .insert(emailAuthCodes)
    .values({
      email,
      purpose,
      code_hash,
      payload: payload ? JSON.stringify(payload) : null,
      expires_at,
    })
    .returning();

  return row;
};

const getActiveEmailAuthCode = async (email, purpose) => {
  const [row] = await db
    .select()
    .from(emailAuthCodes)
    .where(and(
      eq(emailAuthCodes.email, email),
      eq(emailAuthCodes.purpose, purpose),
      isNull(emailAuthCodes.consumed_at),
      gt(emailAuthCodes.expires_at, new Date())
    ))
    .orderBy(desc(emailAuthCodes.created_at))
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    payload: row.payload ? JSON.parse(row.payload) : null,
  };
};

const consumeEmailAuthCode = async (authCodeId) => {
  await db
    .update(emailAuthCodes)
    .set({ consumed_at: new Date() })
    .where(eq(emailAuthCodes.auth_code_id, authCodeId));
};

module.exports = {
  createEmailAuthCode,
  getActiveEmailAuthCode,
  consumeEmailAuthCode,
};
