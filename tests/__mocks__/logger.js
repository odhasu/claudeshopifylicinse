'use strict';

// Silent no-op logger used in all tests via jest.config.js moduleNameMapper.
// This prevents pino-pretty from spawning worker threads during test runs.
const noop = () => {};
const logger = {
  info:  noop,
  warn:  noop,
  error: noop,
  debug: noop,
  trace: noop,
  fatal: noop,
  child: () => logger,
};

module.exports = logger;
