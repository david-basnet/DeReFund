const { pgTable, uuid, varchar, text, boolean, timestamp } = require('drizzle-orm/pg-core');
const { users } = require('./users');
const { notificationTypeEnum } = require('./enums');

const notifications = pgTable('notifications', {
  notification_id: uuid('notification_id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.user_id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').notNull().default('INFO'),
  is_read: boolean('is_read').notNull().default(false),
  link: varchar('link', { length: 255 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

module.exports = { notifications };
