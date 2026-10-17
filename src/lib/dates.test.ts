import { describe, expect, it } from 'vitest';
import { formatHour, isValidTimeZone, salonTimeToUtc, utcToSalonParts, WEEKDAY_FR } from './dates';

const TZ = 'Europe/Paris';

describe('isValidTimeZone', () => {
  it('accepte les fuseaux IANA valides', () => {
    expect(isValidTimeZone('Europe/Paris')).toBe(true);
    expect(isValidTimeZone('America/New_York')).toBe(true);
  });

  it('refuse les chaînes invalides', () => {
    expect(isValidTimeZone('Mars/Phobos')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});

describe('salonTimeToUtc (§14.4 : stockage UTC, fuseau salon explicite)', () => {
  it("convertit une heure d'été (heure UTC+2)", () => {
    // 15 juin 2026 14:00 à Paris = 12:00 UTC
    const utc = salonTimeToUtc('2026-06-15', 14 * 60, TZ);
    expect(utc.toISOString()).toBe('2026-06-15T12:00:00.000Z');
  });

  it("convertit une heure d'hiver (heure UTC+1)", () => {
    // 15 janvier 2026 14:00 à Paris = 13:00 UTC
    const utc = salonTimeToUtc('2026-01-15', 14 * 60, TZ);
    expect(utc.toISOString()).toBe('2026-01-15T13:00:00.000Z');
  });

  it('gère minuit', () => {
    const utc = salonTimeToUtc('2026-06-15', 0, TZ);
    expect(utc.toISOString()).toBe('2026-06-14T22:00:00.000Z');
  });

  it('gère une autre zone (New York, UTC-4 en été)', () => {
    const utc = salonTimeToUtc('2026-06-15', 9 * 60, 'America/New_York');
    expect(utc.toISOString()).toBe('2026-06-15T13:00:00.000Z');
  });
});

describe('utcToSalonParts', () => {
  it('décompose un instant UTC en parties locales du salon', () => {
    const parts = utcToSalonParts(new Date('2026-06-15T12:00:00.000Z'), TZ);
    expect(parts).toEqual({ dateISO: '2026-06-15', minute: 14 * 60, weekday: 0 });
    // 15 juin 2026 = lundi
    expect(WEEKDAY_FR[parts.weekday]).toBe('lundi');
  });

  it("décompose un instant d'hiver", () => {
    const parts = utcToSalonParts(new Date('2026-01-15T13:00:00.000Z'), TZ);
    expect(parts).toEqual({ dateISO: '2026-01-15', minute: 14 * 60, weekday: 3 });
    // 15 janvier 2026 = jeudi
  });

  it('fait le trajet aller-retour sans perte (salon -> UTC -> salon)', () => {
    const utc = salonTimeToUtc('2026-03-29', 10 * 60 + 30, TZ); // jour de bascule
    const parts = utcToSalonParts(utc, TZ);
    expect(parts.dateISO).toBe('2026-03-29');
    // 29 mars 2026 = changement d'heure à 02:00 ; 10:30 reste identique
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
