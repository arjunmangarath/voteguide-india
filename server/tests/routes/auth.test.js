const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const mockGet = jest.fn();
const mockSet = jest.fn().mockResolvedValue({});

jest.mock('../../src/services/firebase', () => ({
  firestore: () => ({
    collection: () => ({
      doc: () => ({ get: mockGet, set: mockSet }),
    }),
  }),
}));

const request = require('supertest');
const app = require('../../src/index');

beforeEach(() => {
  mockGet.mockResolvedValue({ exists: true, data: () => ({ state: 'Bihar', voterType: 'first' }) });
  mockSet.mockResolvedValue({});
});

test('POST /api/auth/profile returns profile for existing session', async () => {
  const res = await request(app)
    .post('/api/auth/profile')
    .set('x-session-id', SESSION_ID)
    .send({});
  expect(res.status).toBe(200);
  expect(res.body.isNewUser).toBe(false);
  expect(res.body.profile).toHaveProperty('state', 'Bihar');
});

test('POST /api/auth/profile returns isNewUser true for new session', async () => {
  mockGet.mockResolvedValueOnce({ exists: false, data: () => ({}) });
  const res = await request(app)
    .post('/api/auth/profile')
    .set('x-session-id', SESSION_ID)
    .send({});
  expect(res.status).toBe(200);
  expect(res.body.isNewUser).toBe(true);
  expect(res.body.profile).toEqual({});
});

test('POST /api/auth/profile returns 400 without session ID', async () => {
  const res = await request(app).post('/api/auth/profile').send({});
  expect(res.status).toBe(400);
});

test('PUT /api/auth/profile saves profile and returns success', async () => {
  const res = await request(app)
    .put('/api/auth/profile')
    .set('x-session-id', SESSION_ID)
    .send({ state: 'Bihar', voterType: 'first', interests: ['register'] });
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});

test('PUT /api/auth/profile returns 400 when state is missing', async () => {
  const res = await request(app)
    .put('/api/auth/profile')
    .set('x-session-id', SESSION_ID)
    .send({ voterType: 'first' });
  expect(res.status).toBe(400);
});

test('PUT /api/auth/profile returns 400 when state is not a string', async () => {
  const res = await request(app)
    .put('/api/auth/profile')
    .set('x-session-id', SESSION_ID)
    .send({ state: 42, voterType: 'first' });
  expect(res.status).toBe(400);
});

test('PUT /api/auth/profile returns 400 without session ID', async () => {
  const res = await request(app)
    .put('/api/auth/profile')
    .send({ state: 'Bihar' });
  expect(res.status).toBe(400);
});

test('POST /api/auth/profile returns 500 when Firestore fails', async () => {
  mockGet.mockRejectedValueOnce(new Error('Firestore unavailable'));
  const res = await request(app)
    .post('/api/auth/profile')
    .set('x-session-id', SESSION_ID)
    .send({});
  expect(res.status).toBe(500);
});
