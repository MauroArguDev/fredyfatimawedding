import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimelineSection } from '@/components/ui/TimelineSection';
import { timelineCopy } from '@/content/timeline';

describe('TimelineSection', () => {
  it('rendersTheTitleImageWithAnAccessibleName', () => {
    render(<TimelineSection />);

    expect(screen.getByRole('img', { name: timelineCopy.titleAlt })).toBeInTheDocument();
  });

  it('rendersTheFullItineraryImageWithAnAltThatListsEveryMilestoneAndTime', () => {
    render(<TimelineSection />);

    const image = screen.getByRole('img', { name: timelineCopy.fullImageAlt });
    expect(image).toHaveAttribute('src', '/assets/timeline/full.webp');
    expect(image.getAttribute('alt')).toContain('4:30 p.m. Ceremonia Religiosa');
    expect(image.getAttribute('alt')).toContain('9:00 p.m. Despedida y recuerdos');
  });
});
