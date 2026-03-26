'use strict';

jest.mock('../../src/services/kvService');
jest.mock('../../src/services/storeService');
jest.mock('../../src/middleware/rateLimit');

const request = require('supertest');
const app = require('../../index');

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('3.0.0');
    expect(typeof res.body.timestamp).toBe('string');
  });
});
