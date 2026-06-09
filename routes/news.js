const express = require('express');
const router = express.Router();

const { getNewsHandler } = require('../controllers/newsController');

// GET /api/news?team_id=
router.get('/', getNewsHandler);

module.exports = router;
