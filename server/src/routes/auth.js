const express = require('express');
const admin = require('../services/firebase');
const session = require('../middleware/sessionMiddleware');

const router = express.Router();

/** Retrieves the session profile from Firestore, initialising it if the session is new. */
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

/** Saves wizard answers (state, voterType, interests, language) to the session's Firestore document. */
router.put('/profile', session, async (req, res) => {
  try {
    const { state, voterType, interests, language } = req.body;
    if (!state || typeof state !== 'string') return res.status(400).json({ error: 'Invalid state' });
    const VALID_VOTER_TYPES = ['first', 'experienced'];
    if (voterType !== undefined && !VALID_VOTER_TYPES.includes(voterType)) {
      return res.status(400).json({ error: 'Invalid voterType' });
    }
    if (interests !== undefined && !Array.isArray(interests)) {
      return res.status(400).json({ error: 'Invalid interests' });
    }
    const db = admin.firestore();
    await db.collection('sessions').doc(req.sessionId).set({
      state: state.trim(),
      voterType,
      interests,
      language: language || null,
      isNewUser: false,
      updatedAt: new Date(),
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
