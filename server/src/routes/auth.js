const express = require('express');
const admin = require('../services/firebase');
const session = require('../middleware/sessionMiddleware');

const router = express.Router();

router.post('/profile', session, async (req, res) => {
  try {
    const db = admin.firestore();
    const ref = db.collection('sessions').doc(req.sessionId);
    const doc = await ref.get();
    if (!doc.exists) {
      await ref.set({ createdAt: new Date(), isNewUser: true });
      return res.json({ isNewUser: true, profile: {} });
    }
    res.json({ isNewUser: false, profile: doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', session, async (req, res) => {
  try {
    const { state, voterType, interests } = req.body;
    if (!state || typeof state !== 'string') return res.status(400).json({ error: 'Invalid state' });
    const db = admin.firestore();
    await db.collection('sessions').doc(req.sessionId).set({
      state: state.trim(),
      voterType,
      interests,
      isNewUser: false,
      updatedAt: new Date(),
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
