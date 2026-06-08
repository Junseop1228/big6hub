const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createUser, findUserByEmail, findUserById } = require('../models/usersModel');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '12h';

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT token.
 */
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    });
  }

  const { email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(email, passwordHash);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return res.status(201).json({ token, user });
  } catch (err) {
    // SQLite UNIQUE constraint on email
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({
        error: { code: 'EMAIL_TAKEN', message: 'Email is already registered' },
      });
    }
    throw err;
  }
}

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT token.
 */
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    });
  }

  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  // always compare to prevent timing attacks (even when user not found)
  const hashToCompare = user ? user.password_hash : '$2b$10$invalidhashforcomparison000000000000000000000000000';
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's public profile.
 * requireAuth middleware has already verified the token and set req.user.
 */
async function me(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
  }
  return res.status(200).json(user);
}

module.exports = { register, login, me };
