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
  status: milestoneStatusEnum('status').notNull().default('PENDING'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

module.exports = { milestones };
