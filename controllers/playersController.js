const { validationResult } = require('express-validator');
const { getPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer } = require('../models/playersModel');

/**
 * GET /api/players?team_id=
 */
async function getPlayersHandler(req, res) {
  try {
    const teamId = req.query.team_id ? Number(req.query.team_id) : null;
    const players = await getPlayers(teamId);
    return res.status(200).json(players);
  } catch (err) {
    throw err;
  }
}

/**
 * GET /api/players/:id
 */
async function getPlayerHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const player = await getPlayerById(id);
    if (!player) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Player not found' },
      });
    }
    return res.status(200).json(player);
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/players  (admin only)
 */
async function postPlayerHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    });
  }
  try {
    const player = await createPlayer(req.body);
    return res.status(201).json(player);
  } catch (err) {
    throw err;
  }
}

/**
 * PUT /api/players/:id  (admin only)
 */
async function putPlayerHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await getPlayerById(id);
    if (!existing) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Player not found' },
      });
    }
    const updated = await updatePlayer(id, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    throw err;
  }
}

/**
 * DELETE /api/players/:id  (admin only)
 */
async function deletePlayerHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await getPlayerById(id);
    if (!existing) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Player not found' },
      });
    }
    await deletePlayer(id);
    return res.status(204).send();
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getPlayersHandler,
  getPlayerHandler,
  postPlayerHandler,
  putPlayerHandler,
  deletePlayerHandler,
};
