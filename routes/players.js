const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getPlayersHandler,
  getPlayerHandler,
  postPlayerHandler,
  putPlayerHandler,
  deletePlayerHandler,
} = require('../controllers/playersController');
const requireAuth  = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

const playerRules = [
  body('team_id').isInt({ min: 1 }).withMessage('team_id must be a positive integer'),
  body('name').notEmpty().withMessage('name is required'),
  body('position').notEmpty().withMessage('position is required'),
];

// GET /api/players?team_id=
router.get('/', getPlayersHandler);

// GET /api/players/:id
router.get('/:id', getPlayerHandler);

// POST /api/players  — admin only
router.post('/', requireAuth, requireAdmin, playerRules, postPlayerHandler);

// PUT /api/players/:id  — admin only
router.put('/:id', requireAuth, requireAdmin, putPlayerHandler);

// DELETE /api/players/:id  — admin only
router.delete('/:id', requireAuth, requireAdmin, deletePlayerHandler);

module.exports = router;
