import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarCard } from '@/components/ui/CalendarCard';

describe('CalendarCard', () => {
  it('rendersTheExtractedCalendarImageWithADescriptiveAltDerivedFromTheWeddingDate', () => {
    render(<CalendarCard />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/assets/date-section/calendario-con-fecha.webp');
    expect(image.getAttribute('alt')).toContain('Diciembre 2,026.');
    expect(image.getAttribute('alt')).toContain('20/Dic./2026');
    expect(image.getAttribute('alt')).toContain('4:30 p.m.');
  });
});
