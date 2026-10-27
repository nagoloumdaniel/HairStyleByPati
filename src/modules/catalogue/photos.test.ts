import { describe, expect, it } from 'vitest';
import { MAX_SERVICE_PHOTOS, newPhotoToken, resolvePhotoPlan } from './photos';

const plan = (tokens: unknown, fileCount: number, existingIds: string[] = []) =>
  resolvePhotoPlan({ orderRaw: JSON.stringify(tokens), fileCount, existingIds });

describe('resolvePhotoPlan', () => {
  it('should accept up to 3 photos mixing existing and new', () => {
    const result = plan(['a', newPhotoToken(0), 'b'], 1, ['a', 'b']);
    expect(MAX_SERVICE_PHOTOS).toBe(3);
    expect(result).toEqual({
      ok: true,
      items: [
        { kind: 'existing', id: 'a' },
        { kind: 'new', fileIndex: 0 },
        { kind: 'existing', id: 'b' },
      ],
      removeIds: [],
    });
  });

  it('should reject a 4th photo', () => {
    const result = plan(
      [newPhotoToken(0), newPhotoToken(1), newPhotoToken(2), newPhotoToken(3)],
      4,
    );
    expect(result.ok).toBe(false);
  });

  it('should reject 3 kept + 1 new', () => {
    expect(plan(['a', 'b', 'c', newPhotoToken(0)], 1, ['a', 'b', 'c']).ok).toBe(false);
  });

  it('should reject files not referenced by the order (limit bypass)', () => {
    expect(plan([newPhotoToken(0)], 4).ok).toBe(false);
  });

  it('should reject unknown ids, duplicates and bad indexes', () => {
    expect(plan(['zzz'], 0, ['a']).ok).toBe(false);
    expect(plan(['a', 'a'], 0, ['a']).ok).toBe(false);
    expect(plan([newPhotoToken(2)], 1).ok).toBe(false);
    expect(plan(['new:abc'], 1).ok).toBe(false);
  });

  it('should reject malformed payloads', () => {
    expect(resolvePhotoPlan({ orderRaw: '{nope', fileCount: 0, existingIds: [] }).ok).toBe(false);
    expect(plan({ a: 1 }, 0).ok).toBe(false);
    expect(plan([1], 0).ok).toBe(false);
  });

  it('should list existing photos missing from the plan as removed', () => {
    const result = plan(['b'], 0, ['a', 'b', 'c']);
    expect(result).toMatchObject({ ok: true, removeIds: ['a', 'c'] });
  });

  it('should treat an absent order as removing everything', () => {
    const result = resolvePhotoPlan({ orderRaw: undefined, fileCount: 0, existingIds: ['a'] });
    expect(result).toEqual({ ok: true, items: [], removeIds: ['a'] });
  });
});
