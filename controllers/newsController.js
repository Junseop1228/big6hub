const { getNews } = require('../models/newsModel');
const { fetchAndSeedNews } = require('../scripts/fetchNews');

/**
 * GET /api/news?team_id=
 */
async function getNewsHandler(req, res) {
  try {
    const teamId = req.query.team_id ? Number(req.query.team_id) : null;
    const news = await getNews(teamId);
    return res.status(200).json(news);
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/news/refresh  (admin only)
 * Re-fetches the latest news from the RSS feeds (accumulates, dedupe by url).
 */
async function refreshNewsHandler(req, res) {
  try {
    const result = await fetchAndSeedNews();
    return res.status(200).json({ stored: result.stored });
  } catch (err) {
    throw err;
  }
}

module.exports = { getNewsHandler, refreshNewsHandler };
