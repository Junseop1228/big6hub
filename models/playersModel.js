const { getDb } = require('../db');

/**
 * getPlayers — returns all players, optionally filtered by team_id.
 *
 * @param {number|null} teamId
 */
async function getPlayers(teamId) {
  const db = getDb();
  if (teamId) {
    return db.all('SELECT * FROM players WHERE team_id = ?', [teamId]);
  }
  return db.all('SELECT * FROM players');
}

/**
 * getPlayerById — returns a single player or undefined.
 *
 * @param {number} id
 */
async function getPlayerById(id) {
  const db = getDb();
  return db.get('SELECT * FROM players WHERE id = ?', [id]);
}

/**
 * createPlayer — inserts a new player and returns the full row.
 *
 * @param {{ team_id, name, position, goals?, assists?, is_legend? }} fields
 */
async function createPlayer(fields) {
  const db = getDb();
  const { team_id, name, position, goals = 0, assists = 0, is_legend = 0 } = fields;
  const result = await db.run(
    'INSERT INTO players (team_id, name, position, goals, assists, is_legend) VALUES (?, ?, ?, ?, ?, ?)',
    [team_id, name, position, goals, assists, is_legend]
  );
  return db.get('SELECT * FROM players WHERE id = ?', [result.lastID]);
}

/**
 * updatePlayer — updates a player and returns the updated row.
 *
 * @param {number} id
 * @param {{ team_id?, name?, position?, goals?, assists?, is_legend? }} fields
 */
async function updatePlayer(id, fields) {
  const db = getDb();
  const allowed = ['team_id', 'name', 'position', 'goals', 'assists', 'is_legend'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (updates.length === 0) return getPlayerById(id);

  const setClauses = updates.map(k => `${k} = ?`).join(', ');
  const values = updates.map(k => fields[k]);
  await db.run(`UPDATE players SET ${setClauses} WHERE id = ?`, [...values, id]);
  return db.get('SELECT * FROM players WHERE id = ?', [id]);
}

/**
 * deletePlayer — removes a player row.
 *
 * @param {number} id
 */
async function deletePlayer(id) {
  const db = getDb();
  await db.run('DELETE FROM players WHERE id = ?', [id]);
}

module.exports = { getPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer };
