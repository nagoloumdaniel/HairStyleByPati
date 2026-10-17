import { describe, expect, it } from 'vitest';
import { deviceTimeToUtc, formatHour, utcToDeviceParts, WEEKDAY_FR } from './dates';

const TZ = 'Europe/Paris';

describe('deviceTimeToUtc (P1.5 : stockage UTC, heure de l\u2019appareil)', () => {
  it("convertit une heure d'\u00e9t\u00e9 (heure UTC+2)", () => {
    // 15 juin 2026 14:00 \u00e0 Paris = 12:00 UTC
    const utc = deviceTimeToUtc('2026-06-15', 14 * 60, TZ);
    expect(utc.toISOString()).toBe('2026-06-15T12:00:00.000Z');
  });

  it("convertit une heure d'hiver (heure UTC+1)", () => {
    // 15 janvier 2026 14:00 \u00e0 Paris = 13:00 UTC
    const utc = deviceTimeToUtc('2026-01-15', 14 * 60, TZ);
    expect(utc.toISOString()).toBe('2026-01-15T13:00:00.000Z');
  });

  it('g\u00e8re minuit', () => {
    const utc = deviceTimeToUtc('2026-06-15', 0, TZ);
    expect(utc.toISOString()).toBe('2026-06-14T22:00:00.000Z');
  });

  it('g\u00e8re une autre zone (New York, UTC-4 en \u00e9t\u00e9)', () => {
    const utc = deviceTimeToUtc('2026-06-15', 9 * 60, 'America/New_York');
    expect(utc.toISOString()).toBe('2026-06-15T13:00:00.000Z');
  });
});

describe('utcToDeviceParts', () => {
  it('d\u00e9compose un instant UTC en parties locales de l\u2019appareil', () => {
    const parts = utcToDeviceParts(new Date('2026-06-15T12:00:00.000Z'), TZ);
    expect(parts).toEqual({ dateISO: '2026-06-15', minute: 14 * 60, weekday: 0 });
    // 15 juin 2026 = lundi
    expect(WEEKDAY_FR[parts.weekday]).toBe('lundi');
  });

  it("d\u00e9compose un instant d'hiver", () => {
    const parts = utcToDeviceParts(new Date('2026-01-15T13:00:00.000Z'), TZ);
    expect(parts).toEqual({ dateISO: '2026-01-15', minute: 14 * 60, weekday: 3 });
    // 15 janvier 2026 = jeudi
  });

  it('fait le trajet aller-retour sans perte (appareil -> UTC -> appareil)', () => {
    const utc = deviceTimeToUtc('2026-03-29', 10 * 60 + 30, TZ); // jour de bascule
    const parts = utcToDeviceParts(utc, TZ);
    expect(parts.dateISO).toBe('2026-03-29');
    // 29 mars 2026 = changement d'heure \u00e0 02:00 ; 10:30 reste identique
    expect(parts.minute).toBe(10 * 60 + 30);
  });
});

describe('formatHour', () => {
  it('formate les minutes en HH:MM', () => {
    expect(formatHour(9 * 60)).toBe('09:00');
    expect(formatHour(14 * 60 + 5)).toBe('14:05');
    expect(formatHour(0)).toBe('00:00');
    expect(formatHour(23 * 60 + 59)).toBe('23:59');
  });
});
