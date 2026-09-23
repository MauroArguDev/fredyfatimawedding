import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountdownCard } from '@/components/ui/CountdownCard';

window.matchMedia = (query: string): MediaQueryList => ({
  matches: query.includes('prefers-reduced-motion'),
  media: query,
  onchange: null,
  addListener: () => undefined,
  removeListener: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  dispatchEvent: () => false,
});

describe('CountdownCard under prefers-reduced-motion', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rendersTheDigitsPlainlyWithoutTheAnimatePresenceWrapper', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-17T10:20:15-06:00'));

    render(<CountdownCard target={new Date('2026-12-20T16:30:00-06:00')} />);

    expect(screen.getByText('45')).toBeInTheDocument();
  });
});
