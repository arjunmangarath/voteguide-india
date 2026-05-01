/**
 * Validates the x-session-id request header.
 * Requires a non-empty string of at least 10 characters.
 * Sets req.sessionId to the trimmed header value on success.
 */
function sessionMiddleware(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
    return res.status(400).json({ error: 'Missing session ID' });
  }
  req.sessionId = sessionId.trim();
  next();
}

module.exports = sessionMiddleware;
