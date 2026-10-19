import { describe, expect, it } from 'vitest';
import { parisDayBounds } from './overview';

describe('parisDayBounds', () => {
  it('should return the Paris local day in UTC', () => {
    const bounds = parisDayBounds(new Date('2026-10-19T10:00:00.000Z'));
    expect(bounds.start.toISOString()).toBe('2026-10-18T22:00:00.000Z');
    expect(bounds.end.toISOString()).toBe('2026-10-19T22:00:00.000Z');
  });

  it('should handle winter time', () => {
    const bounds = parisDayBounds(new Date('2026-12-01T10:00:00.000Z'));
    expect(bounds.start.toISOString()).toBe('2026-11-30T23:00:00.000Z');
  });
});
