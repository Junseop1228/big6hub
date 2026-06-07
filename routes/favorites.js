const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getFavoritesHandler,
  postFavoriteHandler,
  deleteFavoriteHandler,
} = require('../controllers/favoritesController');
const requireAuth = require('../middleware/requireAuth');

const favoriteRules = [
  body('kind').isIn(['team', 'player']).withMessage('kind must be "team" or "player"'),
  body('target_id').isInt({ min: 1 }).withMessage('target_id must be a positive integer'),
];

// all favorites routes require authentication
router.use(requireAuth);

// GET /api/favorites
router.get('/', getFavoritesHandler);

// POST /api/favorites
router.post('/', favoriteRules, postFavoriteHandler);

// DELETE /api/favorites/:id
router.delete('/:id', deleteFavoriteHandler);

module.exports = router;
