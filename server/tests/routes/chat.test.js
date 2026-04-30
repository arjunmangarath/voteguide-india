const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

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
  getChatResponse: jest.fn().mockResolvedValue('Elections in India are conducted by the ECI.'),
}));

const request = require('supertest');
const app = require('../../src/index');

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
