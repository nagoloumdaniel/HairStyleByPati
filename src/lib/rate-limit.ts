/** Rate limiter simple en mémoire (IP + fenêtre glissante).
 * À remplacer par Redis/Upstash en production multi-instances. */
interface Entry {
  count: number;
  resetAt: number;
}
const store = new Map<string, Entry>();
let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function rateLimit(key: string, { max, windowMs }: { max: number; windowMs: number }) {
  const now = Date.now();
  sweep(now);
  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }
  if (entry.count >= max) return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}
