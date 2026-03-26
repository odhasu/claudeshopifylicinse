'use strict';

// Manual Jest mock for src/middleware/rateLimit.js
// Always allows requests by default; override per-test as needed.

const rateLimit = jest.fn().mockResolvedValue(true);

module.exports = rateLimit;
