const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockHistoryGet = jest.fn();

jest.mock('../../src/services/firebase', () => ({
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        collection: () => ({ orderBy: mockOrderBy }),
      }),
    }),
  }),
}));

const request = require('supertest');
const app = require('../../src/index');

beforeEach(() => {
  mockOrderBy.mockReturnValue({ limit: mockLimit });
  mockLimit.mockReturnValue({ get: mockHistoryGet });
  mockHistoryGet.mockResolvedValue({
    docs: [
      { data: () => ({ role: 'user', content: 'Hello' }) },
      { data: () => ({ role: 'model', content: 'Hi! How can I help?' }) },
    ],
  });
});

test('GET /api/chat/history returns messages array', async () => {
  const res = await request(app)
    .get('/api/chat/history')
    .set('x-session-id', SESSION_ID);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.messages)).toBe(true);
  expect(res.body.messages[0]).toHaveProperty('role');
  expect(res.body.messages[0]).toHaveProperty('content');
});

test('GET /api/chat/history without session ID returns 400', async () => {
  const res = await request(app).get('/api/chat/history');
  expect(res.status).toBe(400);
});

test('GET /api/chat/history returns 500 when Firestore fails', async () => {
  mockHistoryGet.mockRejectedValueOnce(new Error('Firestore error'));
  const res = await request(app)
    .get('/api/chat/history')
    .set('x-session-id', SESSION_ID);
  expect(res.status).toBe(500);
});
