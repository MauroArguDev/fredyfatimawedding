import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateSection } from '@/components/ui/DateSection';
import { dateSectionCopy } from '@/content/dateSection';

describe('DateSection', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rendersTheHeadingImageWithAnAccessibleName', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00-06:00'));

    render(<DateSection />);

    expect(screen.getByRole('img', { name: dateSectionCopy.headingAlt })).toBeInTheDocument();
  });

  it('rendersTheCalendarAndCountdownSubtitles', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00-06:00'));

    render(<DateSection />);

    expect(screen.getByText(dateSectionCopy.subtitle)).toBeInTheDocument();
    expect(screen.getByText(dateSectionCopy.countdownIntro)).toBeInTheDocument();
  });
});
