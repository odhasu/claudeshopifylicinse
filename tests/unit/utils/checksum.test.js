'use strict';

const vxChecksum = require('../../../src/utils/checksum');

describe('vxChecksum', () => {
  test('produces a 4-character uppercase hex string', () => {
    const result = vxChecksum('ABCD', 'EFGH', 'IJKL');
    expect(result).toMatch(/^[0-9A-F]{4}$/);
  });

  test('is deterministic — same inputs always produce the same output', () => {
    expect(vxChecksum('A1B2', 'C3D4', 'E5F6')).toBe(vxChecksum('A1B2', 'C3D4', 'E5F6'));
  });

  test('different inputs produce different checksums', () => {
    expect(vxChecksum('AAAA', 'BBBB', 'CCCC')).not.toBe(vxChecksum('XXXX', 'YYYY', 'ZZZZ'));
  });

  test('result is always exactly 4 characters (left-padded)', () => {
    // Try many inputs to confirm padding always yields length 4
    const inputs = [
      ['A', 'B', 'C'],
      ['0000', '0000', '0000'],
      ['FFFF', 'FFFF', 'FFFF'],
      ['1234', '5678', '9ABC'],
    ];
    inputs.forEach(([a, b, c]) => {
      expect(vxChecksum(a, b, c)).toHaveLength(4);
    });
  });

  test('order of segments matters', () => {
    const r1 = vxChecksum('AAAA', 'BBBB', 'CCCC');
    const r2 = vxChecksum('CCCC', 'BBBB', 'AAAA');
    const r3 = vxChecksum('BBBB', 'AAAA', 'CCCC');
    // All three should differ
    expect(new Set([r1, r2, r3]).size).toBeGreaterThan(1);
  });
});
