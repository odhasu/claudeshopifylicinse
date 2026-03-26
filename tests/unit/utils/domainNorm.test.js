'use strict';

const normalizeDomain = require('../../../src/utils/domainNorm');

describe('normalizeDomain', () => {
  test('strips https:// prefix', () => {
    expect(normalizeDomain('https://example.com')).toBe('example.com');
  });

  test('strips http:// prefix', () => {
    expect(normalizeDomain('http://example.com')).toBe('example.com');
  });

  test('strips www. prefix', () => {
    expect(normalizeDomain('www.example.com')).toBe('example.com');
  });

  test('strips https://www. combined prefix', () => {
    expect(normalizeDomain('https://www.example.com')).toBe('example.com');
  });

  test('strips trailing slash', () => {
    expect(normalizeDomain('example.com/')).toBe('example.com');
  });

  test('lowercases the result', () => {
    expect(normalizeDomain('EXAMPLE.COM')).toBe('example.com');
    expect(normalizeDomain('My-Store.myshopify.COM')).toBe('my-store.myshopify.com');
  });

  test('leaves a plain domain unchanged (aside from lower-casing)', () => {
    expect(normalizeDomain('my-store.myshopify.com')).toBe('my-store.myshopify.com');
  });

  test('returns empty string for an empty input', () => {
    expect(normalizeDomain('')).toBe('');
  });

  test('returns empty string for null', () => {
    expect(normalizeDomain(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(normalizeDomain(undefined)).toBe('');
  });

  test('handles Shopify permanent domains', () => {
    expect(normalizeDomain('https://test-store.myshopify.com/')).toBe('test-store.myshopify.com');
  });
});
