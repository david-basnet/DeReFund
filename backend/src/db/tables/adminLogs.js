const { pgTable, uuid, varchar, text, timestamp } = require('drizzle-orm/pg-core');
const { users } = require('./users');

const adminLogs = pgTable('admin_logs', {
  log_id: uuid('log_id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.user_id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 120 }).notNull(),
  details: text('details'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

module.exports = { adminLogs };
