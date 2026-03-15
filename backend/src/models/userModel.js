const { pool } = require('../config/database');

// Create user
const createUser = async (userData) => {
  const { name, email, password_hash, role, wallet_address } = userData;
  const query = `
    INSERT INTO users (name, email, password_hash, role, wallet_address)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING user_id, name, email, role, is_active, wallet_address, created_at
  `;
  const result = await pool.query(query, [name, email, password_hash, role, wallet_address || null]);
  return result.rows[0];
};

// Get user by email
const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Get user by ID
const getUserById = async (userId) => {
  const query = 'SELECT user_id, name, email, role, is_active, wallet_address, created_at FROM users WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Get user with password (for login)
const getUserWithPassword = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Update user
const updateUser = async (userId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) return null;

  values.push(userId);
  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE user_id = $${paramCount}
    RETURNING user_id, name, email, role, is_active, wallet_address, updated_at
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all users (with pagination)
const getAllUsers = async (page = 1, limit = 10, role = null) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT u.user_id, u.name, u.email, u.role, u.is_active, u.wallet_address, u.created_at,
           uv.status as verification_status
    FROM users u
    LEFT JOIN user_verification uv ON u.user_id = uv.user_id
  `;
  const params = [];
  
  if (role) {
    query += ' WHERE u.role = $1';
    params.push(role);
    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
  } else {
    query += ` ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`;
    params.push(limit, offset);
  }

  const result = await pool.query(query, params);
  const countQuery = 'SELECT COUNT(*) FROM users' + (role ? ' WHERE role = $1' : '');
  const countResult = await pool.query(countQuery, role ? [role] : []);
  
  return {
    users: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit
  };
};

// Delete user
const deleteUser = async (userId) => {
  const query = 'DELETE FROM users WHERE user_id = $1';
  await pool.query(query, [userId]);
  return true;
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUserWithPassword,
  updateUser,
  getAllUsers,
  deleteUser
};

