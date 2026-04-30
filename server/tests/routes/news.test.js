const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

jest.mock('../../src/services/firebase', () => ({
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ state: 'Bihar' }) }),
      }),
    }),
  }),
}));

jest.mock('../../src/services/search', () => ({
  fetchElectionNews: jest.fn().mockResolvedValue([
    { title: 'Bihar election news', snippet: 'test', link: 'http://example.com', source: 'example.com' },
  ]),
}));

const request = require('supertest');
const app = require('../../src/index');

test('GET /api/news returns news array', async () => {
  const res = await request(app)
    .get('/api/news')
    .set('x-session-id', SESSION_ID);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.news)).toBe(true);
  expect(res.body.news[0]).toHaveProperty('title');
});

test('GET /api/news without session ID returns 400', async () => {
  const res = await request(app).get('/api/news');
  expect(res.status).toBe(400);
});
