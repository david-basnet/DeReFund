const { drizzle } = require('drizzle-orm/node-postgres');
const { sql } = require('drizzle-orm');
const { pool } = require('../config/database');
const schema = require('./schema');

const db = drizzle(pool, { schema });

async function testConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  }
}

module.exports = {
  db,
  schema,
  testConnection,
};
