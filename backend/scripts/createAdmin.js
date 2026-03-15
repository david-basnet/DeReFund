#!/usr/bin/env node

/**
 * Script to create an admin user
 * 
 * Usage:
 *   node scripts/createAdmin.js <name> <email> <password>
 * 
 * Example:
 *   node scripts/createAdmin.js "Admin User" admin@example.com AdminPass123
 * 
 * Or use environment variables:
 *   ADMIN_NAME="Admin User" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="AdminPass123" node scripts/createAdmin.js
 */

const { pool } = require('../src/config/database');
const { hashPassword } = require('../src/utils/helpers');
const readline = require('readline');

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    let name, email, password;

    // Check if arguments are provided via command line
    if (process.argv.length >= 5) {
      name = process.argv[2];
      email = process.argv[3];
      password = process.argv[4];
    } 
    // Check if environment variables are set
    else if (process.env.ADMIN_NAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      name = process.env.ADMIN_NAME;
      email = process.env.ADMIN_EMAIL;
      password = process.env.ADMIN_PASSWORD;
    }
    // Otherwise, prompt interactively
    else {
      console.log('=== Create Admin User ===\n');
      name = await question('Enter admin name: ');
      email = await question('Enter admin email: ');
      password = await question('Enter admin password: ');
      console.log('');
    }

    // Validate inputs
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.role === 'ADMIN') {
        console.log('⚠️  Admin user with this email already exists!');
        console.log(`   User ID: ${existing.user_id}`);
        console.log(`   Name: ${existing.name}`);
        console.log(`   Email: ${existing.email}`);
        console.log(`   Role: ${existing.role}`);
        rl.close();
        process.exit(0);
      } else {
        throw new Error(`User with email ${email} already exists with role ${existing.role}. Cannot convert to ADMIN.`);
      }
    }

    // Hash password
    console.log('Hashing password...');
    const password_hash = await hashPassword(password);

    // Insert admin user
    console.log('Creating admin user...');
    const query = `
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, 'ADMIN', true)
      RETURNING user_id, name, email, role, is_active, created_at
    `;
    
    const result = await pool.query(query, [
      name.trim(),
      email.trim().toLowerCase(),
      password_hash
    ]);

    const admin = result.rows[0];

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID:    ${admin.user_id}`);
    console.log(`Name:       ${admin.name}`);
    console.log(`Email:      ${admin.email}`);
    console.log(`Role:       ${admin.role}`);
    console.log(`Active:     ${admin.is_active}`);
    console.log(`Created:    ${admin.created_at}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 You can now log in with this admin account at:');
    console.log('   http://localhost:5173 (or your frontend URL)');
    console.log('\n⚠️  Keep these credentials secure!');

  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Run the script
createAdmin();

