/**
 * Drizzle schema entry — re-exports tables from `./tables` (source of truth for drizzle-kit).
 * Property names use snake_case to match existing API JSON (PostgreSQL column names).
 */
module.exports = require('./tables');
