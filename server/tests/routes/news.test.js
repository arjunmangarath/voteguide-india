const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const mockFetchNews = jest.fn();

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
  fetchElectionNews: mockFetchNews,
}));

const request = require('supertest');
const app = require('../../src/index');

const SAMPLE_NEWS = [
  { title: 'Bihar election news', snippet: 'Latest updates', link: 'http://example.com', source: 'example.com' },
];

beforeEach(() => {
  mockFetchNews.mockResolvedValue(SAMPLE_NEWS);
});

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

test('GET /api/news passes state query param to service', async () => {
  await request(app)
    .get('/api/news?state=Kerala')
    .set('x-session-id', SESSION_ID);
  expect(mockFetchNews).toHaveBeenCalledWith('Kerala');
});

test('GET /api/news returns 500 when service throws', async () => {
  mockFetchNews.mockRejectedValueOnce(new Error('Search API failed'));
  const res = await request(app)
    .get('/api/news')
    .set('x-session-id', SESSION_ID);
  expect(res.status).toBe(500);
});
