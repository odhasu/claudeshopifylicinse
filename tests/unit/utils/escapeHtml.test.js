'use strict';

const escapeHtml = require('../../../src/utils/escapeHtml');

describe('escapeHtml', () => {
  test('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  test('escapes less-than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  test('escapes greater-than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  test('escapes double quote', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  test("escapes single quote", () => {
    expect(escapeHtml("it's fine")).toBe("it&#39;s fine");
  });

  test('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  test('returns empty string for null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  test('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world 123')).toBe('hello world 123');
  });

  test('escapes multiple special characters in one string', () => {
    expect(escapeHtml('<b>"Hello" & \'World\'</b>')).toBe(
      '&lt;b&gt;&quot;Hello&quot; &amp; &#39;World&#39;&lt;/b&gt;'
    );
  });
});
