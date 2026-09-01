import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rateLimit';

const WINDOW_MS = 60_000;
const START = new Date('2026-01-01T00:00:00Z');

describe('createRateLimiter', () => {
  it('allowsUpToTheConfiguredNumberOfRequestsPerIpWithinTheWindow', () => {
    const limiter = createRateLimiter(WINDOW_MS, 5);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(limiter.shouldLimit('1.2.3.4', START)).toBe(false);
    }
  });

  it('limitsTheRequestThatExceedsTheConfiguredMaximum', () => {
    const limiter = createRateLimiter(WINDOW_MS, 5);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      limiter.shouldLimit('1.2.3.4', START);
    }

    expect(limiter.shouldLimit('1.2.3.4', START)).toBe(true);
  });

  it('tracksEachIpIndependently', () => {
    const limiter = createRateLimiter(WINDOW_MS, 1);

    expect(limiter.shouldLimit('1.1.1.1', START)).toBe(false);
    expect(limiter.shouldLimit('2.2.2.2', START)).toBe(false);
  });

  it('forgetsAttemptsOnceTheWindowSlidesPast', () => {
    const limiter = createRateLimiter(WINDOW_MS, 1);
    const afterWindow = new Date(START.getTime() + WINDOW_MS + 1);

    limiter.shouldLimit('1.2.3.4', START);

    expect(limiter.shouldLimit('1.2.3.4', afterWindow)).toBe(false);
  });
});
