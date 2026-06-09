const { getNews } = require('../models/newsModel');

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

module.exports = { getNewsHandler };
