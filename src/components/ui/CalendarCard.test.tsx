import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarCard } from '@/components/ui/CalendarCard';

describe('CalendarCard', () => {
  it('rendersTheExtractedCalendarImageWithADescriptiveAltDerivedFromTheGivenDate', () => {
    render(<CalendarCard date={new Date(2026, 11, 20, 16, 30)} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/assets/date-section/calendario-con-fecha.webp');
    expect(image.getAttribute('alt')).toContain('Diciembre 2,026.');
    expect(image.getAttribute('alt')).toContain('20/Dic./2026');
    expect(image.getAttribute('alt')).toContain('4:30 p.m.');
  });

  it('movingTheDateToAnotherMonthChangesTheAltTextWithoutCodeChanges', () => {
    render(<CalendarCard date={new Date(2027, 0, 15)} />);

    expect(screen.getByRole('img').getAttribute('alt')).toContain('Enero 2,027.');
  });
});
