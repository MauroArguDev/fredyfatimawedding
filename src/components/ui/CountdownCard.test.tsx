import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText(dateSectionCopy.countdownUnits.days)).toBeInTheDocument();
  });

  it('showsTheClosedMessageInsteadOfNegativeNumbersOncePastTheTarget', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-21T00:00:00-06:00'));
    const target = new Date('2026-12-20T16:30:00-06:00');

    render(<CountdownCard target={target} />);

    expect(screen.getByText(dateSectionCopy.countdownClosedMessage)).toBeInTheDocument();
  });
});
