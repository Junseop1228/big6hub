const { getDb } = require('../db');

/**
 * getNews — returns news articles, optionally filtered by team_id (newest first).
 *
 * @param {number|null} teamId
 */
async function getNews(teamId) {
  const db = getDb();
  if (teamId) {
    return db.all('SELECT * FROM news WHERE team_id = ? ORDER BY published_at DESC', [teamId]);
  }
  return db.all('SELECT * FROM news ORDER BY published_at DESC');
}

module.exports = { getNews };
