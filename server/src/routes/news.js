const express = require('express');
const session = require('../middleware/sessionMiddleware');
const { generalLimiter } = require('../middleware/rateLimiter');
const { fetchElectionNews } = require('../services/search');

const router = express.Router();

router.get('/', session, generalLimiter, async (req, res) => {
  try {
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const news = await fetchElectionNews(state);
    res.setHeader('Cache-Control', 'public, max-age=900');
    res.json({ news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
