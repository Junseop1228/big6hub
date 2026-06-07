const { getDb } = require('../db');

/**
 * getSeasons — returns all seasons, optionally filtered by team_id.
 *
 * @param {number|null} teamId
 */
async function getSeasons(teamId) {
  const db = getDb();
  if (teamId) {
    return db.all('SELECT * FROM seasons WHERE team_id = ?', [teamId]);
  }
  return db.all('SELECT * FROM seasons');
}

/**
 * getSeasonById — returns a single season or undefined.
 *
 * @param {number} id
 */
async function getSeasonById(id) {
  const db = getDb();
  return db.get('SELECT * FROM seasons WHERE id = ?', [id]);
}

/**
 * createSeason — inserts a new season record and returns the full row.
 *
 * @param {{ team_id, season, wins?, draws?, losses?, final_position? }} fields
 */
async function createSeason(fields) {
  const db = getDb();
  const { team_id, season, wins = 0, draws = 0, losses = 0, final_position = null } = fields;
  const result = await db.run(
    'INSERT INTO seasons (team_id, season, wins, draws, losses, final_position) VALUES (?, ?, ?, ?, ?, ?)',
    [team_id, season, wins, draws, losses, final_position]
  );
  return db.get('SELECT * FROM seasons WHERE id = ?', [result.lastID]);
}

/**
 * updateSeason — updates a season record and returns the updated row.
 *
 * @param {number} id
 * @param {{ team_id?, season?, wins?, draws?, losses?, final_position? }} fields
 */
async function updateSeason(id, fields) {
  const db = getDb();
  const allowed = ['team_id', 'season', 'wins', 'draws', 'losses', 'final_position'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (updates.length === 0) return getSeasonById(id);

  const setClauses = updates.map(k => `${k} = ?`).join(', ');
  const values = updates.map(k => fields[k]);
  await db.run(`UPDATE seasons SET ${setClauses} WHERE id = ?`, [...values, id]);
  return db.get('SELECT * FROM seasons WHERE id = ?', [id]);
}

/**
 * deleteSeason — removes a season record.
 *
 * @param {number} id
 */
async function deleteSeason(id) {
  const db = getDb();
  await db.run('DELETE FROM seasons WHERE id = ?', [id]);
}

module.exports = { getSeasons, getSeasonById, createSeason, updateSeason, deleteSeason };
