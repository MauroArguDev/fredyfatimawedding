import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';

describe('useCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('recomputesTheBreakdownEverySecondWithoutLeakingTheInterval', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-20T16:29:58-06:00'));
    const target = new Date('2026-12-20T16:30:00-06:00');

    const { result, unmount } = renderHook(() => useCountdown(target));

    expect(result.current).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 2,
      isPast: false,
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.seconds).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isPast).toBe(true);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
