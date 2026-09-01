import { afterEach, describe, expect, it, vi } from 'vitest';
import { readRequiredEnv } from '@/components/admin/auth/readViteEnv';

describe('readRequiredEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returnsTheValueWhenSet', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');

    expect(readRequiredEnv('VITE_FIREBASE_API_KEY')).toBe('test-api-key');
  });

  it('throwsWhenTheVariableIsMissing', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');

    expect(() => readRequiredEnv('VITE_FIREBASE_API_KEY')).toThrow(
      'Missing required environment variable: VITE_FIREBASE_API_KEY',
    );
  });
});
