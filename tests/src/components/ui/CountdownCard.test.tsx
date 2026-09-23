import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CountdownCard } from '@/components/ui/CountdownCard';
import { dateSectionCopy } from '@/content/dateSection';

describe('CountdownCard', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rendersTheFourUnitsPaddedToTwoDigitsWithTabularNums', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-17T10:20:15-06:00'));
    const target = new Date('2026-12-20T16:30:00-06:00');

    render(<CountdownCard target={target} />);

    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('06')).toBeInTheDocument();
    expect(screen.getByText('09')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('rendersAShortVisibleLabelWithTheFullUnitNameAvailableToScreenReaders', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-17T10:20:15-06:00'));
    const target = new Date('2026-12-20T16:30:00-06:00');

    render(<CountdownCard target={target} />);

    const shortLabel = screen.getByText(dateSectionCopy.countdownUnits.days.label);
    expect(shortLabel).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(dateSectionCopy.countdownUnits.days.full)).toHaveClass('sr-only');
  });

  it('showsTheClosedMessageInsteadOfNegativeNumbersOncePastTheTarget', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-21T00:00:00-06:00'));
    const target = new Date('2026-12-20T16:30:00-06:00');

    render(<CountdownCard target={target} />);

    expect(screen.getByText(dateSectionCopy.countdownClosedMessage)).toBeInTheDocument();
  });

  it('rerendersTheSecondsDigitWithANewKeyedElementOnEachTick', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-17T10:20:15-06:00'));
    const target = new Date('2026-12-20T16:30:00-06:00');

    render(<CountdownCard target={target} />);

    expect(screen.getByText('45')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('44')).toBeInTheDocument();
  });

  it('rendersTheExtractedFrameImageAsDecorative', () => {
    const { container } = render(<CountdownCard target={new Date('2026-12-20T16:30:00-06:00')} />);

    const frame = container.querySelector('img');
    expect(frame).toHaveAttribute('alt', '');
    expect(frame).toHaveAttribute('aria-hidden', 'true');
    expect(frame).toHaveAttribute('src', '/assets/date-section/marco-de-contador.webp');
  });
});
