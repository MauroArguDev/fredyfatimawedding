import { describe, expect, it } from 'vitest';
import { computeCountdown } from '@/lib/countdown';

describe('computeCountdown', () => {
  it('breaksDownTheRemainingTimeIntoDaysHoursMinutesAndSeconds', () => {
    const target = new Date('2026-12-20T16:30:00-06:00');
    const now = new Date('2026-12-18T14:15:30-06:00');

    expect(computeCountdown(target, now)).toEqual({
      days: 2,
      hours: 2,
      minutes: 14,
      seconds: 30,
      isPast: false,
    });
  });

  it('reportsIsPastOnceTheTargetHasBeenReachedInsteadOfNegativeNumbers', () => {
    const target = new Date('2026-12-20T16:30:00-06:00');
    const now = new Date('2026-12-20T16:30:00-06:00');

    expect(computeCountdown(target, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    });
  });

  it('reportsIsPastForAnyMomentAfterTheTarget', () => {
    const target = new Date('2026-12-20T16:30:00-06:00');
    const now = new Date('2026-12-21T00:00:00-06:00');

    expect(computeCountdown(target, now).isPast).toBe(true);
  });
});
