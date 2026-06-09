/**
 * controllers/matchesController.js
 *
 * GET /api/teams/:id/matches?type=recent|upcoming|all
 */

const { getMatchesByTeam } = require('../models/matchesModel');

async function getMatchesHandler(req, res) {
  try {
    const teamId = Number(req.params.id);
    const type   = req.query.type || 'all';

    if (!['recent', 'upcoming', 'all'].includes(type)) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'type must be recent, upcoming, or all' },
      });
    }

    const matches = await getMatchesByTeam(teamId, type);

    if (matches.length === 0 && type !== 'all') {
      // not an error — just no data for that type
    }

    res.json(matches);
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message },
    });
  }
}

module.exports = { getMatchesHandler };
