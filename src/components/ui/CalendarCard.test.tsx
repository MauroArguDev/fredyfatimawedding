import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarCard } from '@/components/ui/CalendarCard';

describe('CalendarCard', () => {
  it('rendersTheMonthLabelDerivedFromTheGivenDate', () => {
    render(<CalendarCard date={new Date(2026, 11, 20)} />);

    expect(screen.getByText('Diciembre 2,026.')).toBeInTheDocument();
  });

  it('rendersAllSevenWeekdayLabels', () => {
    render(<CalendarCard date={new Date(2026, 11, 20)} />);

    for (const label of ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('rendersTheNoteWithTheDayAndTimeDerivedFromTheGivenDate', () => {
    render(<CalendarCard date={new Date(2026, 11, 20, 16, 30)} />);

    expect(screen.getByText('20/Dic./2026')).toBeInTheDocument();
    expect(screen.getByText('4:30 p.m.')).toBeInTheDocument();
  });

  it('movingTheDateToAnotherMonthChangesTheGridWithoutCodeChanges', () => {
    render(<CalendarCard date={new Date(2027, 0, 15)} />);

    expect(screen.getByText('Enero 2,027.')).toBeInTheDocument();
  });
});
