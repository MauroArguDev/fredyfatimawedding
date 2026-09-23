import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvelopeGate } from '@/components/ui/EnvelopeGate';

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

describe('EnvelopeGate under prefers-reduced-motion', () => {
  it('callsOnOpenAfterAShortPlainFadeInsteadOfTheFullSequence', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const start = Date.now();
    render(<EnvelopeGate titleLabel="Orlando" onOpen={onOpen} onTap={vi.fn()} />);

    await user.click(screen.getByRole('button'));

    await waitFor(
      () => {
        expect(onOpen).toHaveBeenCalledTimes(1);
      },
      { timeout: 1200 },
    );
    expect(Date.now() - start).toBeLessThan(1000);
  });
});
