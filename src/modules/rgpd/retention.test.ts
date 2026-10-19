import { describe, expect, it } from 'vitest';
import { retentionCutoff } from './retention';

describe('retentionCutoff', () => {
  it('should subtract the configured number of days', () => {
    const now = new Date('2026-10-19T12:00:00.000Z');
    expect(retentionCutoff(now, 90).toISOString()).toBe('2026-07-21T12:00:00.000Z');
    expect(retentionCutoff(now, 7).toISOString()).toBe('2026-10-12T12:00:00.000Z');
  });

  it('should never return a date in the future for zero or invalid days', () => {
    const now = new Date('2026-10-19T12:00:00.000Z');
    expect(retentionCutoff(now, 0).toISOString()).toBe(now.toISOString());
    expect(retentionCutoff(now, -10).toISOString()).toBe(now.toISOString());
  });
});
