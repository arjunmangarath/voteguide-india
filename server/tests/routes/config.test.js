jest.mock('../../src/services/firebase', () => ({
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
      }),
    }),
  }),
}));

const request = require('supertest');
const app = require('../../src/index');

test('GET /api/config returns mapsKey field', async () => {
  process.env.MAPS_API_KEY = 'test-maps-key-12345';
  const res = await request(app).get('/api/config');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('mapsKey');
  expect(typeof res.body.mapsKey).toBe('string');
  expect(res.body.mapsKey).toBe('test-maps-key-12345');
});

test('GET /api/config returns empty string when MAPS_API_KEY not set', async () => {
  const saved = process.env.MAPS_API_KEY;
  delete process.env.MAPS_API_KEY;
  const res = await request(app).get('/api/config');
  expect(res.status).toBe(200);
  expect(res.body.mapsKey).toBe('');
  if (saved !== undefined) process.env.MAPS_API_KEY = saved;
});
