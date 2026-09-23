import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAdminTheme } from '@/components/admin/useAdminTheme';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useAdminTheme', () => {
  it('defaultsToLightWhenNothingIsStoredAndTheSystemPrefersLight', () => {
    const { result } = renderHook(() => useAdminTheme());

    expect(result.current.theme).toBe('light');
  });

  it('readsThePreviouslyStoredTheme', () => {
    window.localStorage.setItem('admin-theme', 'dark');

    const { result } = renderHook(() => useAdminTheme());

    expect(result.current.theme).toBe('dark');
  });

  it('togglesBetweenLightAndDark', () => {
    const { result } = renderHook(() => useAdminTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('persistsTheThemeToLocalStorageOnToggle', () => {
    const { result } = renderHook(() => useAdminTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(window.localStorage.getItem('admin-theme')).toBe('dark');
  });

  it('ignoresAGarbageStoredValueAndFallsBackToTheSystemPreference', () => {
    window.localStorage.setItem('admin-theme', 'not-a-real-theme');

    const { result } = renderHook(() => useAdminTheme());

    expect(result.current.theme).toBe('light');
  });
});
