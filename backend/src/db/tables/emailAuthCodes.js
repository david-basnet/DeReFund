const { pgTable, uuid, varchar, text, timestamp, index } = require('drizzle-orm/pg-core');

const emailAuthCodes = pgTable('email_auth_codes', {
  auth_code_id: uuid('auth_code_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  purpose: varchar('purpose', { length: 40 }).notNull(),
  code_hash: text('code_hash').notNull(),
  payload: text('payload'),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumed_at: timestamp('consumed_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailPurposeIdx: index('idx_email_auth_codes_email_purpose').on(table.email, table.purpose),
}));

module.exports = { emailAuthCodes };
