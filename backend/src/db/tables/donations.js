const { pgTable, uuid, varchar, numeric, bigint, timestamp } = require('drizzle-orm/pg-core');
const { users } = require('./users');
const { campaigns } = require('./campaigns');

const donations = pgTable('donations', {
  donation_id: uuid('donation_id').primaryKey().defaultRandom(),
  campaign_id: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.campaign_id, { onDelete: 'cascade' }),
  donor_id: uuid('donor_id')
    .references(() => users.user_id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  tx_hash: varchar('tx_hash', { length: 66 }).notNull().unique(),
  block_number: bigint('block_number', { mode: 'number' }),
  token_type: varchar('token_type', { length: 32 }).notNull().default('MATIC'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

module.exports = { donations };
