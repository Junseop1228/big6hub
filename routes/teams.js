const express = require('express');
const router = express.Router();

const { getTeams, getTeam, putTeam } = require('../controllers/teamsController');
const { getMatchesHandler }          = require('../controllers/matchesController');
const requireAuth  = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

// GET /api/teams
router.get('/', getTeams);

// GET /api/teams/:id/matches?type=recent|upcoming|all
router.get('/:id/matches', getMatchesHandler);

// GET /api/teams/:id
router.get('/:id', getTeam);

// PUT /api/teams/:id  — admin only
router.put('/:id', requireAuth, requireAdmin, putTeam);

module.exports = router;
