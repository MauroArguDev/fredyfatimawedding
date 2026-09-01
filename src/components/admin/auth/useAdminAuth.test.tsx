import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';

describe('useAdminAuth', () => {
  it('throwsWhenUsedOutsideAnAdminAuthProvider', () => {
    expect(() => renderHook(() => useAdminAuth())).toThrow(
      'useAdminAuth must be used within an AdminAuthProvider',
    );
  });
});
