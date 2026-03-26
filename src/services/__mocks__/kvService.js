'use strict';

// Manual Jest mock for src/services/kvService.js
// Used by integration tests via jest.mock('../../src/services/kvService')
// Re-configure per-test with .mockResolvedValue() or .mockReturnValue().

const kvGetLicenses          = jest.fn().mockResolvedValue([]);
const kvSaveLicenses         = jest.fn().mockResolvedValue(undefined);
const kvGetTickets           = jest.fn().mockResolvedValue([]);
const kvSaveTickets          = jest.fn().mockResolvedValue(undefined);
const kvRateLimitIncrement   = jest.fn().mockResolvedValue(null);
const kvAcquireIdempotencyLock = jest.fn().mockResolvedValue(true);
const kvGetRuntimeStatus     = jest.fn().mockReturnValue({ enabled: false });

module.exports = {
  kvGetLicenses,
  kvSaveLicenses,
  kvGetTickets,
  kvSaveTickets,
  kvRateLimitIncrement,
  kvAcquireIdempotencyLock,
  kvGetRuntimeStatus,
  KV_ENABLED: false,
};
