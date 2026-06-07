const { validationResult } = require('express-validator');
const { getSeasons, getSeasonById, createSeason, updateSeason, deleteSeason } = require('../models/seasonsModel');

/**
 * GET /api/seasons?team_id=
 */
async function getSeasonsHandler(req, res) {
  try {
    const teamId = req.query.team_id ? Number(req.query.team_id) : null;
    const seasons = await getSeasons(teamId);
    return res.status(200).json(seasons);
  } catch (err) {
    throw err;
  }
}

/**
 * GET /api/seasons/:id
 */
async function getSeasonHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const season = await getSeasonById(id);
    if (!season) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Season not found' },
      });
    }
    return res.status(200).json(season);
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/seasons  (admin only)
 */
async function postSeasonHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    });
  }
  try {
    const season = await createSeason(req.body);
    return res.status(201).json(season);
  } catch (err) {
    throw err;
  }
}

/**
 * PUT /api/seasons/:id  (admin only)
 */
async function putSeasonHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await getSeasonById(id);
    if (!existing) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Season not found' },
      });
    }
    const updated = await updateSeason(id, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    throw err;
  }
}

/**
 * DELETE /api/seasons/:id  (admin only)
 */
async function deleteSeasonHandler(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await getSeasonById(id);
    if (!existing) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Season not found' },
      });
    }
    await deleteSeason(id);
    return res.status(204).send();
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getSeasonsHandler,
  getSeasonHandler,
  postSeasonHandler,
  putSeasonHandler,
  deleteSeasonHandler,
};
