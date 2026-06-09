/**
 * models/matchesModel.js
 * DB queries for matches table.
 */

const { getDb } = require('../db');

/**
 * Returns matches for a team.
 * @param {number} teamId
 * @param {'recent'|'upcoming'|'all'} type
 */
async function getMatchesByTeam(teamId, type = 'all') {
  const db = getDb();
  let where = 'WHERE team_id = ?';
  if (type === 'recent')   where += ' AND is_upcoming = 0';
  if (type === 'upcoming') where += ' AND is_upcoming = 1';

  return db.all(
    `SELECT * FROM matches ${where} ORDER BY date DESC`,
    [teamId]
  );
}

module.exports = { getMatchesByTeam };
