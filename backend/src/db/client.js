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
    if (error.cause) {
      console.error('Cause:', error.cause.message || error.cause);
      if (error.cause.code) console.error('Cause code:', error.cause.code);
    }
    if (Array.isArray(error.errors)) {
      error.errors.forEach((inner, index) => {
        console.error(`Inner database error ${index + 1}:`, inner.message || inner);
        if (inner.code) console.error(`Inner database error ${index + 1} code:`, inner.code);
      });
    }
    return false;
  }
}

module.exports = {
  db,
  schema,
  testConnection,
};
