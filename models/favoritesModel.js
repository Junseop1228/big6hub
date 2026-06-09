const { getDb } = require('../db');

/**
 * getFavorites — returns all favorites for a given user.
 *
 * @param {number} userId
 */
async function getFavorites(userId) {
  const db = getDb();
  return db.all('SELECT * FROM favorites WHERE user_id = ?', [userId]);
}

/**
 * getFavoriteById — returns a single favorite row or undefined.
 *
 * @param {number} id
 */
async function getFavoriteById(id) {
  const db = getDb();
  return db.get('SELECT * FROM favorites WHERE id = ?', [id]);
}

/**
 * createFavorite — inserts a favorite and returns the new row.
 *
 * @param {number} userId
 * @param {{ kind: 'team'|'player', target_id: number }} fields
 */
async function createFavorite(userId, fields) {
  const db = getDb();
  const { kind, target_id } = fields;
  const result = await db.run(
    'INSERT INTO favorites (user_id, kind, target_id) VALUES (?, ?, ?)',
    [userId, kind, target_id]
  );
  return db.get('SELECT * FROM favorites WHERE id = ?', [result.lastID]);
}

/**
 * deleteFavorite — removes a favorite row.
 *
 * @param {number} id
 */
async function deleteFavorite(id) {
  const db = getDb();
  await db.run('DELETE FROM favorites WHERE id = ?', [id]);
}

module.exports = { getFavorites, getFavoriteById, createFavorite, deleteFavorite };
