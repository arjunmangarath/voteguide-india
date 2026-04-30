const express = require('express');
const session = require('../middleware/sessionMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');
const { getChatResponse } = require('../services/gemini');
const admin = require('../services/firebase');

const router = express.Router();

router.post('/', session, chatLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    const db = admin.firestore();
    const userDoc = await db.collection('sessions').doc(req.sessionId).get();
    const userContext = userDoc.exists ? userDoc.data() : {};

    const reply = await getChatResponse(message.trim(), userContext, history || []);

    const chatRef = db.collection('sessions').doc(req.sessionId).collection('messages');
    await Promise.all([
      chatRef.add({ role: 'user', content: message.trim(), timestamp: new Date() }),
      chatRef.add({ role: 'model', content: reply, timestamp: new Date() }),
    ]);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

router.get('/history', session, async (req, res) => {
  try {
    const db = admin.firestore();
    const snap = await db
      .collection('sessions')
      .doc(req.sessionId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    const messages = snap.docs.map((d) => d.data()).reverse();
    res.json({ messages });
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
