const { pgTable, uuid, varchar, text, timestamp } = require('drizzle-orm/pg-core');
const { bytea } = require('./customTypes');
const { verificationStatusEnum } = require('./enums');
const { users } = require('./users');

const userVerification = pgTable('user_verification', {
  verification_id: uuid('verification_id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.user_id, { onDelete: 'cascade' })
    .unique(),
  document_type: varchar('document_type', { length: 100 }).notNull().default('REGISTRATION'),
  document_url: text('document_url').notNull().default(''),
  document_file: bytea('document_file'),
  document_filename: varchar('document_filename', { length: 255 }),
  document_mimetype: varchar('document_mimetype', { length: 100 }),
  status: verificationStatusEnum('status').notNull().default('PENDING'),
  verified_by: uuid('verified_by').references(() => users.user_id, { onDelete: 'set null' }),
  verified_at: timestamp('verified_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

module.exports = { userVerification };
