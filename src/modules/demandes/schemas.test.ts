import { describe, expect, it } from 'vitest';
import { customRequestDecisionSchema, customRequestSchema } from './schemas';

const validRequest = {
  name: 'Amina Test',
  email: 'amina@example.com',
  phone: '06 12 34 56 78',
  description: 'Je souhaite des tresses collées avec des mèches cuivrées pour un mariage.',
  hairLength: 'LONG',
  hairType: 'Cheveux naturels épais',
  currentStyle: 'Tresses depuis deux semaines',
  desiredDate: '2026-11-20',
  comment: 'Budget autour de 150 euros.',
  consent: 'on',
  website: '',
};

describe('customRequestSchema', () => {
  it('should accept a complete custom request', () => {
    const result = customRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.consent).toBe(true);
  });

  it('should reject a request without consent', () => {
    expect(customRequestSchema.safeParse({ ...validRequest, consent: '' }).success).toBe(false);
  });

  it('should reject a too short description or invalid date', () => {
    expect(
      customRequestSchema.safeParse({ ...validRequest, description: 'Trop court' }).success,
    ).toBe(false);
    expect(
      customRequestSchema.safeParse({ ...validRequest, desiredDate: '20-11-2026' }).success,
    ).toBe(false);
  });
});

describe('customRequestDecisionSchema', () => {
  it('should convert an estimated price in euros into cents', () => {
    const result = customRequestDecisionSchema.safeParse({
      requestId: 'request-1',
      action: 'QUOTED',
      message: 'Voici une proposition adaptée.',
      estimatedPriceEuros: '150',
      serviceId: '',
      proposedSlotLocal: '',
      timeZone: 'Europe/Paris',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.estimatedPriceEuros).toBe(15_000);
  });

  it('should accept an empty price and reject a negative one', () => {
    const base = {
      requestId: 'request-1',
      action: 'INFO_REQUESTED',
      message: 'Pouvez-vous préciser la longueur ?',
      timeZone: 'Europe/Paris',
    };
    const empty = customRequestDecisionSchema.safeParse({ ...base, estimatedPriceEuros: '' });
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.estimatedPriceEuros).toBeNull();
    expect(
      customRequestDecisionSchema.safeParse({ ...base, estimatedPriceEuros: '-10' }).success,
    ).toBe(false);
  });
});
