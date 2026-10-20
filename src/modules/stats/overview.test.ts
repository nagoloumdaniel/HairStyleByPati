import { describe, expect, it } from 'vitest';
import { salonDayBounds } from './overview';

describe('salonDayBounds', () => {
  it('should return the Dakar local day (UTC+0) in UTC', () => {
    const bounds = salonDayBounds(new Date('2026-10-19T10:00:00.000Z'));
    expect(bounds.start.toISOString()).toBe('2026-10-19T00:00:00.000Z');
    expect(bounds.end.toISOString()).toBe('2026-10-20T00:00:00.000Z');
  });

  it('should not shift with the season (no DST in Dakar)', () => {
    const bounds = salonDayBounds(new Date('2026-12-01T10:00:00.000Z'));
    expect(bounds.start.toISOString()).toBe('2026-12-01T00:00:00.000Z');
  });
});
