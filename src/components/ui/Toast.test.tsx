import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toast } from '@/components/ui/Toast';

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rendersTheMessageAsAnAlert', () => {
    render(<Toast message="No pudimos enviar tu confirmación." onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos enviar tu confirmación.');
  });

  it('callsOnDismissAfterTheAutoDismissTimeoutWithoutLeakingTheTimer', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { unmount } = render(<Toast message="Demasiados intentos." onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('resetsTheTimerWhenTheMessageChangesWithoutDismissingForTheOldOne', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { rerender } = render(<Toast message="Primer error." onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    rerender(<Toast message="Segundo error." onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
