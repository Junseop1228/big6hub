const express = require('express');
const router = express.Router();

const { getNewsHandler, refreshNewsHandler } = require('../controllers/newsController');
const requireAuth  = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

// GET /api/news?team_id=
router.get('/', getNewsHandler);

// POST /api/news/refresh  — admin only
router.post('/refresh', requireAuth, requireAdmin, refreshNewsHandler);

module.exports = router;
