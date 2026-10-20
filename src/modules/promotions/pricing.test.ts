import { describe, expect, it } from 'vitest';
import { applyPromotion, findActivePromotion, type PromotionCandidate } from './pricing';

function promo(overrides: Partial<PromotionCandidate> = {}): PromotionCandidate {
  return {
    id: 'promo-1',
    name: 'Soldes',
    kind: 'PERCENT',
    value: 10,
    startsAt: new Date('2026-01-01T00:00:00.000Z'),
    endsAt: new Date('2026-12-31T23:59:59.000Z'),
    active: true,
    serviceIds: ['service-1'],
    ...overrides,
  };
}

describe('findActivePromotion', () => {
  it('finds a promotion covering the service at the given instant', () => {
    const now = new Date('2026-06-01T10:00:00.000Z');
    const result = findActivePromotion([promo()], 'service-1', now);
    expect(result?.id).toBe('promo-1');
  });

  it('ignores an inactive promotion', () => {
    const now = new Date('2026-06-01T10:00:00.000Z');
    const result = findActivePromotion([promo({ active: false })], 'service-1', now);
    expect(result).toBeNull();
  });

  it('ignores a promotion outside its validity window', () => {
    const before = new Date('2025-12-01T00:00:00.000Z');
    const result = findActivePromotion([promo()], 'service-1', before);
    expect(result).toBeNull();
  });

  it('ignores a promotion that does not target the service', () => {
    const now = new Date('2026-06-01T10:00:00.000Z');
    const result = findActivePromotion(
      [promo({ serviceIds: ['other-service'] })],
      'service-1',
      now,
    );
    expect(result).toBeNull();
  });
});

describe('applyPromotion', () => {
  it('applies a percentage discount', () => {
    const result = applyPromotion(10_000, { id: 'p1', name: 'Soldes', kind: 'PERCENT', value: 10 });
    expect(result.discountCents).toBe(1_000);
    expect(result.finalPriceCents).toBe(9_000);
  });

  it('applies a fixed discount', () => {
    const result = applyPromotion(10_000, {
      id: 'p1',
      name: 'Soldes',
      kind: 'FIXED',
      value: 1_500,
    });
    expect(result.discountCents).toBe(1_500);
    expect(result.finalPriceCents).toBe(8_500);
  });

  it('never produces a negative final price when the fixed discount exceeds the price', () => {
    const result = applyPromotion(1_000, { id: 'p1', name: 'Soldes', kind: 'FIXED', value: 5_000 });
    expect(result.discountCents).toBe(1_000);
    expect(result.finalPriceCents).toBe(0);
  });

  it('clamps a percentage above 100 to 100', () => {
    const result = applyPromotion(10_000, {
      id: 'p1',
      name: 'Soldes',
      kind: 'PERCENT',
      value: 250,
    });
    expect(result.discountCents).toBe(10_000);
    expect(result.finalPriceCents).toBe(0);
  });

  it('treats a negative value as no discount', () => {
    const result = applyPromotion(10_000, {
      id: 'p1',
      name: 'Soldes',
      kind: 'PERCENT',
      value: -10,
    });
    expect(result.discountCents).toBe(0);
    expect(result.finalPriceCents).toBe(10_000);
  });
});
