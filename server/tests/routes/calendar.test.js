const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const mockGetCalendar = jest.fn();

jest.mock('../../src/services/firebase', () => ({
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ state: 'Bihar' }) }),
      }),
    }),
  }),
}));

jest.mock('../../src/services/calendar', () => ({
  getElectionCalendar: mockGetCalendar,
}));

const request = require('supertest');
const app = require('../../src/index');

const SAMPLE_EVENTS = [
  { title: 'Bihar Assembly Phase 1', date: '2025-10-18', type: 'Voting', state: 'Bihar', isPast: true },
  { title: 'Delhi Municipal Elections', date: '2026-02-15', type: 'Voting', state: 'Delhi', isPast: false },
];

beforeEach(() => {
  mockGetCalendar.mockResolvedValue(SAMPLE_EVENTS);
});

test('GET /api/calendar returns events array', async () => {
  const res = await request(app)
    .get('/api/calendar')
    .set('x-session-id', SESSION_ID);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.events)).toBe(true);
  expect(res.body.events.length).toBeGreaterThan(0);
});

test('GET /api/calendar without session ID returns 400', async () => {
  const res = await request(app).get('/api/calendar');
  expect(res.status).toBe(400);
});

test('GET /api/calendar events have required fields', async () => {
  const res = await request(app)
    .get('/api/calendar')
    .set('x-session-id', SESSION_ID);
  const event = res.body.events[0];
  expect(event).toHaveProperty('title');
  expect(event).toHaveProperty('date');
  expect(event).toHaveProperty('type');
  expect(event).toHaveProperty('isPast');
});

test('GET /api/calendar with state param passes state to service', async () => {
  await request(app)
    .get('/api/calendar?state=Bihar')
    .set('x-session-id', SESSION_ID);
  expect(mockGetCalendar).toHaveBeenCalledWith('Bihar');
});

test('GET /api/calendar returns 500 when service throws', async () => {
  mockGetCalendar.mockRejectedValueOnce(new Error('Calendar service error'));
  const res = await request(app)
    .get('/api/calendar')
    .set('x-session-id', SESSION_ID);
  expect(res.status).toBe(500);
});
