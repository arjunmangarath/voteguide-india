function sessionMiddleware(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
    return res.status(400).json({ error: 'Missing session ID' });
  }
  req.sessionId = sessionId.trim();
  next();
}

module.exports = sessionMiddleware;
