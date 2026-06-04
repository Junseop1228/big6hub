const { getAllTeams } = require('../models/teamsModel');

async function getTeams(req, res) {
    try {
        const teams = await getAllTeams();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getTeams };