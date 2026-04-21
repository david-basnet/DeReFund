const { pgTable, uuid, varchar, text, integer, numeric, timestamp } = require('drizzle-orm/pg-core');
const { milestoneStatusEnum } = require('./enums');
const { campaigns } = require('./campaigns');

const milestones = pgTable('milestones', {
  milestone_id: uuid('milestone_id').primaryKey().defaultRandom(),
  campaign_id: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.campaign_id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  amount_to_release: numeric('amount_to_release', { precision: 18, scale: 2 }).notNull(),
  order_index: integer('order_index').notNull().default(0),
  escrow_milestone_id: integer('escrow_milestone_id'),
  proof_url: text('proof_url'),
  proof_tx_hash: varchar('proof_tx_hash', { length: 100 }),
  proof_submitted_at: timestamp('proof_submitted_at', { withTimezone: true }),
  release_tx_hash: varchar('release_tx_hash', { length: 100 }),
  released_at: timestamp('released_at', { withTimezone: true }),
  status: milestoneStatusEnum('status').notNull().default('PENDING'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

module.exports = { milestones };
