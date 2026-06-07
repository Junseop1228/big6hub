const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, me } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

// Validation rules reused across register and login
const emailRule = body('email').isEmail().withMessage('Valid email is required');
const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

// POST /api/auth/register
router.post('/register', [emailRule, passwordRule], register);

// POST /api/auth/login
router.post('/login', [emailRule, passwordRule], login);

// GET /api/auth/me  — protected
router.get('/me', requireAuth, me);

module.exports = router;
