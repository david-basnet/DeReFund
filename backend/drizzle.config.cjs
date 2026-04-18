/** Drizzle Kit — run from `backend/`. Generates SQL under `database/migrations`. */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './src/db/schema.js',
  out: './database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
