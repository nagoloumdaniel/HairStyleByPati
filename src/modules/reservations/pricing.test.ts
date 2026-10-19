import { describe, expect, it } from 'vitest';
import { computeBookingSnapshot, type BookingOptionInput } from './pricing';

const service = {
  name: 'Tresses collées',
  durationMinutes: 120,
  priceFromCents: 6000,
  priceToCents: 8000,
  priceOnRequest: false,
};

const options: BookingOptionInput[] = [
  { id: 'opt-1', name: 'Soin profond', priceCents: 1000, durationMinutes: 15, active: true },
  { id: 'opt-2', name: 'Mèches', priceCents: 2500, durationMinutes: 30, active: true },
  { id: 'opt-3', name: 'Option désactivée', priceCents: 500, durationMinutes: 5, active: false },
];

describe('computeBookingSnapshot', () => {
  it('should freeze the base service when no option is selected', () => {
    expect(computeBookingSnapshot(service, [], options)).toEqual({
      durationMinutes: 120,
      priceCents: 6000,
      selectedOptions: [],
      invalidOptionIds: [],
    });
  });

  it('should add option prices and durations to the snapshot', () => {
    const snapshot = computeBookingSnapshot(service, ['opt-1', 'opt-2'], options);
    expect(snapshot.durationMinutes).toBe(165);
    expect(snapshot.priceCents).toBe(9500);
    expect(snapshot.selectedOptions).toHaveLength(2);
    expect(snapshot.selectedOptions[0]).toEqual({
      optionId: 'opt-1',
      name: 'Soin profond',
      priceCents: 1000,
      durationMinutes: 15,
    });
  });

  it('should ignore duplicate option ids', () => {
    const snapshot = computeBookingSnapshot(service, ['opt-1', 'opt-1'], options);
    expect(snapshot.selectedOptions).toHaveLength(1);
    expect(snapshot.priceCents).toBe(7000);
  });

  it('should report unknown or inactive options', () => {
    const snapshot = computeBookingSnapshot(service, ['missing', 'opt-3'], options);
    expect(snapshot.invalidOptionIds).toEqual(['missing', 'opt-3']);
    expect(snapshot.priceCents).toBe(6000);
  });

  it('should keep the price unknown when it is on request', () => {
    const snapshot = computeBookingSnapshot(
      { ...service, priceOnRequest: true },
      ['opt-1'],
      options,
    );
    expect(snapshot.priceCents).toBeNull();
    expect(snapshot.durationMinutes).toBe(135);
  });

  it('should handle a service without known duration', () => {
    const snapshot = computeBookingSnapshot(
      { ...service, durationMinutes: null },
      ['opt-1'],
      options,
    );
    expect(snapshot.durationMinutes).toBe(15);
  });
});
