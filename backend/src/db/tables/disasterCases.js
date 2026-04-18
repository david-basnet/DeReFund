const { sql } = require('drizzle-orm');
const { pgTable, uuid, varchar, text, doublePrecision, timestamp, index } = require('drizzle-orm/pg-core');
const { byteaArray } = require('./customTypes');
const { disasterStatusEnum, disasterSeverityEnum } = require('./enums');
const { users } = require('./users');

const disasterCases = pgTable('disaster_cases', {
  case_id: uuid('case_id').primaryKey().defaultRandom(),
  submitted_by: uuid('submitted_by')
    .notNull()
    .references(() => users.user_id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 150 }).notNull(),
  severity: disasterSeverityEnum('severity').notNull().default('MEDIUM'),
  status: disasterStatusEnum('status').notNull().default('DRAFT'),
  longitude: doublePrecision('longitude'),
  latitude: doublePrecision('latitude'),
  images: text('images').array().notNull().default(sql`'{}'::text[]`),
  video: text('video'),
  reviewed_by: uuid('reviewed_by').references(() => users.user_id, { onDelete: 'set null' }),
  reviewed_at: timestamp('reviewed_at', { withTimezone: true }),
  image_files: byteaArray('image_files'),
  image_filenames: text('image_filenames').array(),
  image_mimetypes: text('image_mimetypes').array(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    submittedByIdx: index('idx_disaster_submitted_by').on(table.submitted_by),
    statusIdx: index('idx_disaster_status').on(table.status),
    createdAtIdx: index('idx_disaster_created_at').on(table.created_at),
  };
});

module.exports = { disasterCases };
