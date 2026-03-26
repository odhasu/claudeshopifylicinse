import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import crypto from 'crypto';

const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
  logger.warn('ADMIN_KEY not set - using insecure default. Set ADMIN_KEY env var before deploying.');
}
export const EFFECTIVE_ADMIN_KEY = ADMIN_KEY || 'change-me-in-production';
export const ADMIN_AUTH_CONFIGURED = Boolean(ADMIN_KEY);
const UNAUTHORIZED_RESPONSE = { error: 'unauthorized' };
const ADMIN_AUTH_NOT_CONFIGURED_RESPONSE = { error: 'admin_auth_not_configured' };

if (process.env.NODE_ENV === 'production' && !ADMIN_AUTH_CONFIGURED) {
  logger.error('ADMIN_KEY is required in production. Admin endpoints are disabled until ADMIN_KEY is configured.');
}

function isAdminAuthDisabledInProd(): boolean {
  return process.env.NODE_ENV === 'production' && !ADMIN_AUTH_CONFIGURED;
}

function getSingleHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isValidCandidateKey(value: string): boolean {
  return typeof value === 'string' && value.length > 0 && value.length <= 256;
}

function keyMatchesExpected(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (isAdminAuthDisabledInProd()) {
    res.status(503).json(ADMIN_AUTH_NOT_CONFIGURED_RESPONSE);
    return;
  }
  const key = getSingleHeaderValue(req.headers['x-admin-key']);
  if (typeof key !== 'string') {
    res.status(401).json(UNAUTHORIZED_RESPONSE);
    return;
  }

  const normalizedKey = key.trim();
  if (!isValidCandidateKey(normalizedKey)) {
    res.status(401).json(UNAUTHORIZED_RESPONSE);
    return;
  }

  if (!keyMatchesExpected(normalizedKey, EFFECTIVE_ADMIN_KEY)) {
    res.status(401).json(UNAUTHORIZED_RESPONSE);
    return;
  }

  next();
}
