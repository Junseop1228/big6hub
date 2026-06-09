const { validationResult } = require('express-validator');
const { getFavorites, getFavoriteById, createFavorite, deleteFavorite } = require('../models/favoritesModel');

/**
 * GET /api/favorites  — returns the authenticated user's favorites.
 */
async function getFavoritesHandler(req, res) {
  try {
    const favorites = await getFavorites(req.user.id);
    return res.status(200).json(favorites);
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/favorites  — adds a favorite for the authenticated user.
 */
async function postFavoriteHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    });
  }
  try {
    const favorite = await createFavorite(req.user.id, req.body);
    return res.status(201).json(favorite);
  } catch (err) {
    throw err;
  }
}

/**
 * DELETE /api/favorites/:id  — removes a favorite owned by the authenticated user.
 * Returns 403 if the favorite belongs to a different user (broken access control prevention).
 */
async function deleteFavoriteHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const favorite = await getFavoriteById(id);

    if (!favorite) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Favorite not found' },
      });
    }

    // prevent accessing another user's favorites (IDOR mitigation)
    if (favorite.user_id !== req.user.id) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not own this favorite' },
      });
    }

    await deleteFavorite(id);
    return res.status(204).send();
  } catch (err) {
    throw err;
  }
}

module.exports = { getFavoritesHandler, postFavoriteHandler, deleteFavoriteHandler };
