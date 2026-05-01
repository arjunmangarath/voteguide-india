const sessionMiddleware = require('../../src/middleware/sessionMiddleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

test('rejects request with no session ID header', () => {
  const req = { headers: {} };
  const res = mockRes();
  const next = jest.fn();
  sessionMiddleware(req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(next).not.toHaveBeenCalled();
});

test('rejects request with session ID that is too short', () => {
  const req = { headers: { 'x-session-id': 'short' } };
  const res = mockRes();
  const next = jest.fn();
  sessionMiddleware(req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(next).not.toHaveBeenCalled();
});

test('accepts valid session ID and calls next', () => {
  const req = { headers: { 'x-session-id': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' } };
  const res = mockRes();
  const next = jest.fn();
  sessionMiddleware(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(req.sessionId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
});

test('rejects session ID with exactly 9 characters', () => {
  const req = { headers: { 'x-session-id': '123456789' } };
  const res = mockRes();
  const next = jest.fn();
  sessionMiddleware(req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(next).not.toHaveBeenCalled();
});

test('accepts session ID with exactly 10 characters', () => {
  const req = { headers: { 'x-session-id': '1234567890' } };
  const res = mockRes();
  const next = jest.fn();
  sessionMiddleware(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(req.sessionId).toBe('1234567890');
});

test('trims whitespace from session ID before assigning', () => {
  const req = { headers: { 'x-session-id': '  a1b2c3d4e5  ' } };
  const res = mockRes();
  const next = jest.fn();
  sessionMiddleware(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(req.sessionId).toBe('a1b2c3d4e5');
});
