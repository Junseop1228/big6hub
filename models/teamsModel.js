const { getDb } = require('../db');

/**
 * getAllTeams — returns the full list of Big 6 teams.
 */
async function getAllTeams() {
  const db = getDb();
  return db.all('SELECT * FROM teams');
}

/**
 * getTeamById — returns a single team with its trophies and managers.
 * Returns undefined if the team does not exist.
 *
 * @param {number} id
 */
async function getTeamById(id) {
  const db = getDb();

  const team = await db.get('SELECT * FROM teams WHERE id = ?', [id]);
  if (!team) return undefined;

  const trophies = await db.all('SELECT * FROM trophies WHERE team_id = ?', [id]);
  const managers = await db.all('SELECT * FROM managers WHERE team_id = ?', [id]);

  return { ...team, trophies, managers };
}

/**
 * updateTeam — updates allowed fields on a team and returns the updated row.
 * Only fields present in the body are updated (partial update).
 *
 * @param {number} id
 * @param {{ stadium?, city?, manager?, logo_url? }} fields
 */
async function updateTeam(id, fields) {
  const db = getDb();

  const allowed = ['stadium', 'city', 'manager', 'logo_url'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));

  if (updates.length === 0) return getTeamById(id);

  const setClauses = updates.map(k => `${k} = ?`).join(', ');
  const values = updates.map(k => fields[k]);

  await db.run(`UPDATE teams SET ${setClauses} WHERE id = ?`, [...values, id]);
  return db.get('SELECT * FROM teams WHERE id = ?', [id]);
}

module.exports = { getAllTeams, getTeamById, updateTeam };
