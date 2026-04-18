#!/usr/bin/env node

/**
 * Create an admin user (Drizzle).
 *
 * Usage:
 *   node scripts/createAdmin.js <name> <email> <password>
 *
 * Or:
 *   ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node scripts/createAdmin.js
 */

const readline = require('readline');
const { db } = require('../src/db/client');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const { hashPassword } = require('../src/utils/helpers');
const { pool } = require('../src/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    let name;
    let email;
    let password;

    if (process.argv.length >= 5) {
      name = process.argv[2];
      email = process.argv[3];
      password = process.argv[4];
    } else if (process.env.ADMIN_NAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      name = process.env.ADMIN_NAME;
      email = process.env.ADMIN_EMAIL;
      password = process.env.ADMIN_PASSWORD;
    } else {
      console.log('=== Create Admin User ===\n');
      name = await question('Enter admin name: ');
      email = await question('Enter admin email: ');
      password = await question('Enter admin password: ');
      console.log('');
    }

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

    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (existing) {
      if (existing.role === 'ADMIN') {
        console.log('⚠️  Admin user with this email already exists!');
        console.log(`   User ID: ${existing.user_id}`);
        console.log(`   Name: ${existing.name}`);
        console.log(`   Email: ${existing.email}`);
        console.log(`   Role: ${existing.role}`);
        rl.close();
        await pool.end();
        process.exit(0);
      }
      throw new Error(`User with email ${email} already exists with role ${existing.role}. Cannot convert to ADMIN.`);
    }

    console.log('Hashing password...');
    const password_hash = await hashPassword(password);

    console.log('Creating admin user...');
    const [admin] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        password_hash,
        role: 'ADMIN',
        is_active: true,
      })
      .returning({
        user_id: users.user_id,
        name: users.name,
        email: users.email,
        role: users.role,
        is_active: users.is_active,
        created_at: users.created_at,
      });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID:    ${admin.user_id}`);
    console.log(`Name:       ${admin.name}`);
    console.log(`Email:      ${admin.email}`);
    console.log(`Role:       ${admin.role}`);
    console.log(`Active:     ${admin.is_active}`);
    console.log(`Created:    ${admin.created_at}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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

createAdmin();
