import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from './slug';

describe('slugify', () => {
  it('should lowercase, strip accents and use dashes', () => {
    expect(slugify('Tresses Collées & Vanilles !')).toBe('tresses-collees-vanilles');
  });

  it('should fall back when nothing usable remains', () => {
    expect(slugify('???', 'prestation')).toBe('prestation');
  });

  it('should cap the length', () => {
    expect(slugify('a'.repeat(300)).length).toBeLessThanOrEqual(112);
  });
});

describe('uniqueSlug', () => {
  it('should return the base slug when free', async () => {
    expect(await uniqueSlug('Départ locs', async () => false)).toBe('depart-locs');
  });

  it('should add -2, -3 on collision', async () => {
    const taken = new Set(['nattes', 'nattes-2']);
    expect(await uniqueSlug('Nattes', async (s) => taken.has(s))).toBe('nattes-3');
  });
});
