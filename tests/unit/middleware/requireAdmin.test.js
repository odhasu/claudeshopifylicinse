'use strict';

// requireAdmin reads ADMIN_KEY at module load time, so we use jest.isolateModules()
// to reload it with different environment configurations per test.

const ORIGINAL_ENV = { ...process.env };

afterAll(() => {
  // Restore the original environment so other test files are unaffected.
  Object.keys(process.env).forEach(k => delete process.env[k]);
  Object.assign(process.env, ORIGINAL_ENV);
});

function loadRequireAdmin(adminKey, nodeEnv = 'test') {
  let requireAdmin;
  jest.isolateModules(() => {
    process.env.ADMIN_KEY = adminKey || '';
    if (!adminKey) delete process.env.ADMIN_KEY;
    process.env.NODE_ENV = nodeEnv;
    requireAdmin = require('../../../src/middleware/requireAdmin').requireAdmin;
  });
  return requireAdmin;
}

function makeResMock() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('requireAdmin middleware', () => {
  test('calls next() when the correct admin key is supplied', () => {
    const requireAdmin = loadRequireAdmin('test-admin-key-ci-safe');
    const req = { headers: { 'x-admin-key': 'test-admin-key-ci-safe' } };
    const res = makeResMock();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when the wrong key is provided', () => {
    const requireAdmin = loadRequireAdmin('test-admin-key-ci-safe');
    const req = { headers: { 'x-admin-key': 'wrong-key' } };
    const res = makeResMock();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when the x-admin-key header is missing', () => {
    const requireAdmin = loadRequireAdmin('test-admin-key-ci-safe');
    const req = { headers: {} };
    const res = makeResMock();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when the header value is an empty string', () => {
    const requireAdmin = loadRequireAdmin('test-admin-key-ci-safe');
    const req = { headers: { 'x-admin-key': '' } };
    const res = makeResMock();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts an array header value (takes the first element)', () => {
    const requireAdmin = loadRequireAdmin('test-admin-key-ci-safe');
    const req = { headers: { 'x-admin-key': ['test-admin-key-ci-safe', 'second-value'] } };
    const res = makeResMock();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('returns 503 in production when ADMIN_KEY is not configured', () => {
    const requireAdmin = loadRequireAdmin(null, 'production');
    const req = { headers: { 'x-admin-key': 'any-key' } };
    const res = makeResMock();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
  });
});
