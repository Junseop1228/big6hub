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

/**
 * createNews — inserts a news article, skipping duplicates by (team_id, url).
 * Returns the inserted row, or the existing row if this team already has the url.
 *
 * @param {{ team_id, title, url?, source?, published_at?, summary? }} fields
 */
async function createNews(fields) {
  const db = getDb();
  const { team_id, title, url = null, source = null, published_at = null, summary = null } = fields;

  // dedupe by (team_id, url) — skip insert if this team already has this article
  if (url) {
    const existing = await db.get('SELECT * FROM news WHERE team_id = ? AND url = ?', [team_id, url]);
    if (existing) return existing;
  }

  const result = await db.run(
    'INSERT INTO news (team_id, title, url, source, published_at, summary) VALUES (?, ?, ?, ?, ?, ?)',
    [team_id, title, url, source, published_at, summary]
  );
  return db.get('SELECT * FROM news WHERE id = ?', [result.lastID]);
}

module.exports = { getNews, createNews };
