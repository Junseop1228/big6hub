const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getSeasonsHandler,
  getSeasonHandler,
  postSeasonHandler,
  putSeasonHandler,
  deleteSeasonHandler,
} = require('../controllers/seasonsController');
const requireAuth  = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

const seasonRules = [
  body('team_id').isInt({ min: 1 }).withMessage('team_id must be a positive integer'),
  body('season').notEmpty().withMessage('season is required'),
];

// GET /api/seasons?team_id=
router.get('/', getSeasonsHandler);

// GET /api/seasons/:id
router.get('/:id', getSeasonHandler);

// POST /api/seasons  — admin only
router.post('/', requireAuth, requireAdmin, seasonRules, postSeasonHandler);

// PUT /api/seasons/:id  — admin only
router.put('/:id', requireAuth, requireAdmin, putSeasonHandler);

// DELETE /api/seasons/:id  — admin only
router.delete('/:id', requireAuth, requireAdmin, deleteSeasonHandler);

module.exports = router;
