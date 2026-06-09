const { getAllTeams, getTeamById, updateTeam } = require('../models/teamsModel');

/**
 * GET /api/teams
 */
async function getTeams(req, res) {
  try {
    const teams = await getAllTeams();
    return res.status(200).json(teams);
  } catch (err) {
    throw err;
  }
}

/**
 * GET /api/teams/:id
 */
async function getTeam(req, res) {
  try {
    const id = Number(req.params.id);
    const team = await getTeamById(id);

    if (!team) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' },
      });
    }

    return res.status(200).json(team);
  } catch (err) {
    throw err;
  }
}

/**
 * PUT /api/teams/:id  (admin only)
 */
async function putTeam(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await getTeamById(id);

    if (!existing) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' },
      });
    }

    const updated = await updateTeam(id, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    throw err;
  }
}

module.exports = { getTeams, getTeam, putTeam };
