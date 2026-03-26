'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  // Replace the real pino logger with a silent no-op mock in all tests so that
  // pino-pretty worker threads are never spawned and test output stays clean.
  moduleNameMapper: {
    '/utils/logger(\\.js)?$': '<rootDir>/tests/__mocks__/logger.js',
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/loader.js', // client-side JS injected into Shopify stores, not testable here
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov'],
  // Prevent leaking open handles (pino workers, rate-limit intervals, etc.)
  forceExit: true,
  testTimeout: 10000,
};
