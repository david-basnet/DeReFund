const { pgTable, uuid, timestamp, uniqueIndex } = require('drizzle-orm/pg-core');
const { users } = require('./users');
const { campaigns } = require('./campaigns');

const volunteerVerifications = pgTable(
  'volunteer_verifications',
  {
    verification_id: uuid('verification_id').primaryKey().defaultRandom(),
    campaign_id: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.campaign_id, { onDelete: 'cascade' }),
    volunteer_id: uuid('volunteer_id')
      .notNull()
      .references(() => users.user_id, { onDelete: 'cascade' }),
    verified_at: timestamp('verified_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqVolunteer: uniqueIndex('volunteer_verifications_campaign_volunteer_unique').on(
      t.campaign_id,
      t.volunteer_id
    ),
  })
);

module.exports = { volunteerVerifications };
