const express = require('express');
const router = express.Router();

const { getTeams } = require('../controllers/teamsController');

router.get('/', getTeams);

module.exports = router;