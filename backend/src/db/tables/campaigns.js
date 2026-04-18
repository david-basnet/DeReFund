const { sql } = require('drizzle-orm');
const { pgTable, uuid, varchar, text, numeric, timestamp, index, integer } = require('drizzle-orm/pg-core');
const { campaignStatusEnum, creationSourceEnum } = require('./enums');
const { users } = require('./users');
const { disasterCases } = require('./disasterCases');

const campaigns = pgTable(
  'campaigns',
  {
    campaign_id: uuid('campaign_id').primaryKey().defaultRandom(),
    ngo_id: uuid('ngo_id')
      .notNull()
      .references(() => users.user_id, { onDelete: 'cascade' }),
    case_id: uuid('case_id').references(() => disasterCases.case_id, { onDelete: 'set null' }),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    target_amount: numeric('target_amount', { precision: 18, scale: 2 }).notNull(),
    current_amount: numeric('current_amount', { precision: 18, scale: 2 }).notNull().default('0'),
    verification_threshold: integer('verification_threshold').notNull().default(20),
    contract_address: varchar('contract_address', { length: 100 }),
    status: campaignStatusEnum('status').notNull().default('DRAFT'),
    admin_approved_by: uuid('admin_approved_by').references(() => users.user_id, { onDelete: 'set null' }),
    admin_approved_at: timestamp('admin_approved_at', { withTimezone: true }),
    creation_source: creationSourceEnum('creation_source').notNull().default('NGO'),
    creator_user_id: uuid('creator_user_id').references(() => users.user_id, { onDelete: 'set null' }),
    ngo_reviewed_by: uuid('ngo_reviewed_by').references(() => users.user_id, { onDelete: 'set null' }),
    ngo_reviewed_at: timestamp('ngo_reviewed_at', { withTimezone: true }),
    image_urls: text('image_urls').array().notNull().default(sql`'{}'::text[]`),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ngoIdx: index('idx_campaign_ngo_id').on(t.ngo_id),
    caseIdx: index('idx_campaign_case_id').on(t.case_id),
    statusIdx: index('idx_campaign_status').on(t.status),
  })
);

module.exports = { campaigns };
