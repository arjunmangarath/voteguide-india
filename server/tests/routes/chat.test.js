const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const mockChatResponse = jest.fn();

jest.mock('../../src/services/firebase', () => ({
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ state: 'Bihar' }) }),
        collection: () => ({ add: jest.fn().mockResolvedValue({}) }),
      }),
    }),
  }),
}));

jest.mock('../../src/services/gemini', () => ({
  getChatResponse: mockChatResponse,
}));

const request = require('supertest');
const app = require('../../src/index');

beforeEach(() => {
  mockChatResponse.mockResolvedValue('Elections in India are conducted by the ECI.');
});

test('POST /api/chat returns a reply', async () => {
  const res = await request(app)
    .post('/api/chat')
    .set('x-session-id', SESSION_ID)
    .send({ message: 'How do elections work?', history: [] });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('reply');
  expect(typeof res.body.reply).toBe('string');
});

test('POST /api/chat with empty message returns 400', async () => {
  const res = await request(app)
    .post('/api/chat')
    .set('x-session-id', SESSION_ID)
    .send({ message: '   ' });
  expect(res.status).toBe(400);
});

test('POST /api/chat without session ID returns 400', async () => {
  const res = await request(app).post('/api/chat').send({ message: 'Hello' });
  expect(res.status).toBe(400);
});

test('POST /api/chat with valid history array succeeds', async () => {
  const history = [
    { role: 'user', content: 'Hello' },
    { role: 'model', content: 'Hi! How can I help?' },
  ];
  const res = await request(app)
    .post('/api/chat')
    .set('x-session-id', SESSION_ID)
    .send({ message: 'Tell me more', history });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('reply');
});

test('POST /api/chat with message at 1000 characters returns 200', async () => {
  const res = await request(app)
    .post('/api/chat')
    .set('x-session-id', SESSION_ID)
    .send({ message: 'a'.repeat(1000) });
  expect(res.status).toBe(200);
});

test('POST /api/chat with message over 1000 characters returns 400', async () => {
  const res = await request(app)
    .post('/api/chat')
    .set('x-session-id', SESSION_ID)
    .send({ message: 'a'.repeat(1001) });
  expect(res.status).toBe(400);
});

test('POST /api/chat when rate limited returns friendly message', async () => {
  mockChatResponse.mockRejectedValueOnce(new Error('RATE_LIMITED'));
  const res = await request(app)
    .post('/api/chat')
    .set('x-session-id', SESSION_ID)
    .send({ message: 'Hello' });
  expect(res.status).toBe(200);
  expect(res.body.reply).toContain("I'm experiencing high traffic");
});

test('POST /api/chat when Gemini errors returns 500', async () => {
  mockChatResponse.mockRejectedValueOnce(new Error('GEMINI_ERROR'));
  const res = await request(app)
    .post('/api/chat')
    .set('x-session-id', SESSION_ID)
    .send({ message: 'Hello' });
  expect(res.status).toBe(500);
});
