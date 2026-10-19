import { describe, expect, it } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  it('should allow requests below the limit and block the next one', () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    expect(rateLimit(key, { max: 2, windowMs: 1000 }).allowed).toBe(true);
    expect(rateLimit(key, { max: 2, windowMs: 1000 }).allowed).toBe(true);
    expect(rateLimit(key, { max: 2, windowMs: 1000 }).allowed).toBe(false);
  });

  it('should isolate counters by key', () => {
    const a = `test:a:${Date.now()}`;
    const b = `test:b:${Date.now()}`;
    rateLimit(a, { max: 1, windowMs: 1000 });
    expect(rateLimit(a, { max: 1, windowMs: 1000 }).allowed).toBe(false);
    expect(rateLimit(b, { max: 1, windowMs: 1000 }).allowed).toBe(true);
  });
});
