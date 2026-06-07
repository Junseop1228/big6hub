const { getDb } = require('../db');

/**
 * createUser — inserts a new user and returns the public user object.
 *
 * @param {string} email
 * @param {string} passwordHash  — already bcrypt-hashed by the controller
 * @param {string} role          — defaults to 'user'
 * @returns {{ id, email, role }}
 */
async function createUser(email, passwordHash, role = 'user') {
  const db = getDb();
  const result = await db.run(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, passwordHash, role]
  );
  return { id: result.lastID, email, role };
}

/**
 * findUserByEmail — returns the full user row including password_hash.
 * Used during login to compare passwords.
 *
 * @param {string} email
 * @returns {{ id, email, password_hash, role } | undefined}
 */
async function findUserByEmail(email) {
  const db = getDb();
  return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

/**
 * findUserById — returns the user without password_hash.
 * Used for /api/auth/me and token payload hydration.
 *
 * @param {number} id
 * @returns {{ id, email, role } | undefined}
 */
async function findUserById(id) {
  const db = getDb();
  return db.get('SELECT id, email, role FROM users WHERE id = ?', [id]);
}

module.exports = { createUser, findUserByEmail, findUserById };
