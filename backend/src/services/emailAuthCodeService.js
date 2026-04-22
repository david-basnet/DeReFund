const crypto = require('crypto');
const { and, desc, eq, isNull } = require('drizzle-orm');
const { db } = require('../db/client');
const { emailAuthCodes } = require('../db/schema');
const { env } = require('../config/env');

const PURPOSES = {
  REGISTER: 'REGISTER',
  PASSWORD_RESET: 'PASSWORD_RESET',
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const createCode = () => String(crypto.randomInt(100000, 1000000));

const hashCode = (email, purpose, code) =>
  crypto
    .createHash('sha256')
    .update(`${normalizeEmail(email)}:${purpose}:${code}:${env.JWT_SECRET}`)
    .digest('hex');

const createEmailCode = async ({ email, purpose, payload = null }) => {
  const normalizedEmail = normalizeEmail(email);
  const code = createCode();
  const expiresAt = new Date(Date.now() + env.EMAIL_CODE_TTL_MINUTES * 60 * 1000);

  await db
    .update(emailAuthCodes)
    .set({ consumed_at: new Date() })
    .where(and(
      eq(emailAuthCodes.email, normalizedEmail),
      eq(emailAuthCodes.purpose, purpose),
      isNull(emailAuthCodes.consumed_at)
    ));

  const [row] = await db
    .insert(emailAuthCodes)
    .values({
      email: normalizedEmail,
      purpose,
      code_hash: hashCode(normalizedEmail, purpose, code),
      payload: payload ? JSON.stringify(payload) : null,
      expires_at: expiresAt,
    })
    .returning({
      auth_code_id: emailAuthCodes.auth_code_id,
      expires_at: emailAuthCodes.expires_at,
    });

  return { code, record: row };
};

const verifyEmailCode = async ({ email, purpose, code, consume = true }) => {
  const normalizedEmail = normalizeEmail(email);
  const [row] = await db
    .select()
    .from(emailAuthCodes)
    .where(and(
      eq(emailAuthCodes.email, normalizedEmail),
      eq(emailAuthCodes.purpose, purpose),
      isNull(emailAuthCodes.consumed_at)
    ))
    .orderBy(desc(emailAuthCodes.created_at))
    .limit(1);

  if (!row) {
    return { valid: false, message: 'No active verification code found. Please request a new code.' };
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { valid: false, message: 'Verification code has expired. Please request a new code.' };
  }

  const submittedHash = hashCode(normalizedEmail, purpose, String(code || '').trim());
  if (submittedHash !== row.code_hash) {
    return { valid: false, message: 'Verification code is incorrect.' };
  }

  if (consume) {
    await db
      .update(emailAuthCodes)
      .set({ consumed_at: new Date() })
      .where(eq(emailAuthCodes.auth_code_id, row.auth_code_id));
  }

  let payload = null;
  if (row.payload) {
    try {
      payload = JSON.parse(row.payload);
    } catch {
      payload = null;
    }
  }

  return { valid: true, payload, record: row };
};

module.exports = {
  PURPOSES,
  createEmailCode,
  verifyEmailCode,
};
