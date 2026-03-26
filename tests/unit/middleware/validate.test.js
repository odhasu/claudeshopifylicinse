'use strict';

const { schemas, validate } = require('../../../src/middleware/validate');

// ─── authLogin schema ────────────────────────────────────────────────────────

describe('schemas.authLogin', () => {
  test('accepts a standard license key', () => {
    const result = schemas.authLogin.safeParse({ licenseKey: 'ABCD-EFGH-IJKL-MNOP' });
    expect(result.success).toBe(true);
  });

  test('accepts the legacy "og" universal key', () => {
    const result = schemas.authLogin.safeParse({ licenseKey: 'og' });
    expect(result.success).toBe(true);
  });

  test('trims surrounding whitespace', () => {
    const result = schemas.authLogin.safeParse({ licenseKey: '  ABCD-EFGH-IJKL-MNOP  ' });
    expect(result.success).toBe(true);
    expect(result.data.licenseKey).toBe('ABCD-EFGH-IJKL-MNOP');
  });

  test('rejects an empty key', () => {
    const result = schemas.authLogin.safeParse({ licenseKey: '' });
    expect(result.success).toBe(false);
  });

  test('rejects a key longer than 80 characters', () => {
    const result = schemas.authLogin.safeParse({ licenseKey: 'A'.repeat(81) });
    expect(result.success).toBe(false);
  });

  test('rejects a missing licenseKey field', () => {
    const result = schemas.authLogin.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── adminCheck schema ───────────────────────────────────────────────────────

describe('schemas.adminCheck', () => {
  test('accepts a valid admin key string', () => {
    const result = schemas.adminCheck.safeParse({ adminKey: 'super-secret-key' });
    expect(result.success).toBe(true);
  });

  test('rejects a key longer than 256 characters', () => {
    const result = schemas.adminCheck.safeParse({ adminKey: 'k'.repeat(257) });
    expect(result.success).toBe(false);
  });
});

// ─── checkout schema ─────────────────────────────────────────────────────────

describe('schemas.checkout', () => {
  test('accepts LITE', () => {
    const result = schemas.checkout.safeParse({ plan: 'LITE' });
    expect(result.success).toBe(true);
  });

  test('accepts PRO', () => {
    const result = schemas.checkout.safeParse({ plan: 'PRO' });
    expect(result.success).toBe(true);
  });

  test('rejects an unknown plan', () => {
    const result = schemas.checkout.safeParse({ plan: 'ENTERPRISE' });
    expect(result.success).toBe(false);
  });

  test('rejects lowercase plan name', () => {
    const result = schemas.checkout.safeParse({ plan: 'lite' });
    expect(result.success).toBe(false);
  });
});

// ─── createPaymentIntent schema ───────────────────────────────────────────────

describe('schemas.createPaymentIntent', () => {
  test('accepts plan only (email and name are optional)', () => {
    const result = schemas.createPaymentIntent.safeParse({ plan: 'LITE' });
    expect(result.success).toBe(true);
  });

  test('accepts plan with optional email and customerName', () => {
    const result = schemas.createPaymentIntent.safeParse({
      plan: 'PRO',
      email: 'buyer@example.com',
      customerName: 'Jane Doe',
    });
    expect(result.success).toBe(true);
  });

  test('rejects an invalid email address', () => {
    const result = schemas.createPaymentIntent.safeParse({ plan: 'LITE', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  test('rejects an unknown plan', () => {
    const result = schemas.createPaymentIntent.safeParse({ plan: 'BASIC' });
    expect(result.success).toBe(false);
  });
});

// ─── supportTicket schema ─────────────────────────────────────────────────────

describe('schemas.supportTicket', () => {
  test('accepts valid name, email, and message', () => {
    const result = schemas.supportTicket.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'I need help with my license.',
    });
    expect(result.success).toBe(true);
  });

  test('lowercases email on transform', () => {
    const result = schemas.supportTicket.safeParse({
      name: 'Bob',
      email: 'BOB@EXAMPLE.COM',
      message: 'Question here.',
    });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('bob@example.com');
  });

  test('rejects a message longer than 5000 characters', () => {
    const result = schemas.supportTicket.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── validate middleware ──────────────────────────────────────────────────────

describe('validate middleware', () => {
  test('calls next() when body matches the schema', () => {
    const middleware = validate(schemas.checkout);
    const req = { body: { plan: 'LITE' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 400 with validation_error when body is invalid', () => {
    const middleware = validate(schemas.checkout);
    const req = { body: { plan: 'INVALID_PLAN' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'validation_error', details: expect.any(Array) })
    );
  });

  test('replaces req.body with parsed (and transformed) data', () => {
    const middleware = validate(schemas.authLogin);
    const req = { body: { licenseKey: '  og  ' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.licenseKey).toBe('og');
  });
});
