const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

export interface RateLimiter {
  shouldLimit: (ip: string, now: Date) => boolean;
}

/**
 * Builds an independent sliding-window limiter. Call once per module scope
 * (not per request) so state survives warm serverless invocations, the same
 * pattern as the shared Firestore instance in firestore.ts. Exposed as a
 * factory, rather than a single module-level singleton, so tests can create
 * isolated limiters instead of sharing state across test files.
 */
export function createRateLimiter(
  windowMs: number = WINDOW_MS,
  maxRequests: number = MAX_REQUESTS_PER_WINDOW,
): RateLimiter {
  const attemptsByIp = new Map<string, number[]>();

  return {
    shouldLimit(ip: string, now: Date): boolean {
      const windowStart = now.getTime() - windowMs;
      const recentAttempts = (attemptsByIp.get(ip) ?? []).filter((timestamp) => timestamp > windowStart);

      recentAttempts.push(now.getTime());
      attemptsByIp.set(ip, recentAttempts);

      return recentAttempts.length > maxRequests;
    },
  };
}

export const rsvpRateLimiter = createRateLimiter();
