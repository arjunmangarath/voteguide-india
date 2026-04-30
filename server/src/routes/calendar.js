const express = require('express');
const session = require('../middleware/sessionMiddleware');
const { generalLimiter } = require('../middleware/rateLimiter');
const { getElectionCalendar } = require('../services/calendar');

const router = express.Router();

router.get('/', session, generalLimiter, async (req, res) => {
  try {
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const events = await getElectionCalendar(state);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

module.exports = router;
