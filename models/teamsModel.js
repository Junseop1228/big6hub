const { getDb } = require('../db');

async function getAllTeams() {
    try {
        const db = getDb();
        const teams = await db.all('SELECT * FROM teams');
        return teams;
    } catch (err) {
        throw err;
    }
}

module.exports = { getAllTeams };