const express = require('express');
const session = require('../middleware/sessionMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');
const { getChatResponse } = require('../services/gemini');
const admin = require('../services/firebase');

const router = express.Router();

const RATE_LIMIT_MESSAGES = {
  Hindi:     'मैं अभी व्यस्त हूँ। कृपया एक क्षण बाद पुनः प्रयास करें। 🙏',
  Telugu:    'నేను ప్రస్తుతం బిజీగా ఉన్నాను. దయచేసి కొద్దిసేపటికి మళ్ళీ ప్రయత్నించండి. 🙏',
  Bengali:   'আমি এখন ব্যস্ত। একটু পরে আবার চেষ্টা করুন। 🙏',
  Marathi:   'मी सध्या व्यस्त आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. 🙏',
  Tamil:     'நான் இப்போது பிஸியாக இருக்கிறேன். சற்று நேரம் கழித்து மீண்டும் முயற்சிக்கவும். 🙏',
  Gujarati:  'હું હાલ વ્યસ્ત છું. થોડી ક્ષણ પછી ફરીથી પ્રયાસ કરો. 🙏',
  Kannada:   'ನಾನು ಈಗ ಬ್ಯುಸಿಯಾಗಿದ್ದೇನೆ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. 🙏',
  Malayalam: 'ഞാൻ ഇപ്പോൾ തിരക്കിലാണ്. കുറച്ചു നേരം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക. 🙏',
  Punjabi:   'ਮੈਂ ਹੁਣ ਵਿਅਸਤ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਲ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ। 🙏',
  Odia:      'ମୁଁ ବର୍ତ୍ତମାନ ବ୍ୟସ୍ତ ଅଛି। ଅଳ୍ପ ସମୟ ପରେ ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ। 🙏',
  Urdu:      'میں ابھی مصروف ہوں۔ ایک لمحے میں دوبارہ کوشش کریں۔ 🙏',
};

router.post('/', session, chatLimiter, async (req, res) => {
  let userContext = {};
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
    userContext = userDoc.exists ? userDoc.data() : {};

    const validHistory = Array.isArray(history)
      ? history.filter((h) => h && typeof h.content === 'string' && ['user', 'model'].includes(h.role))
      : [];
    const reply = await getChatResponse(message.trim(), userContext, validHistory);

    const chatRef = db.collection('sessions').doc(req.sessionId).collection('messages');
    await Promise.all([
      chatRef.add({ role: 'user', content: message.trim(), timestamp: new Date() }),
      chatRef.add({ role: 'model', content: reply, timestamp: new Date() }),
    ]);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    if (err?.message === 'RATE_LIMITED') {
      const lang = userContext?.language?.name;
      const msg = RATE_LIMIT_MESSAGES[lang] || "I'm experiencing high traffic right now. Please try again in a moment. 🙏";
      return res.json({ reply: msg });
    }
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
