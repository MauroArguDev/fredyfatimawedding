import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RsvpSection } from '@/components/ui/RsvpSection';
import { remindersCopy } from '@/content/reminders';

const getParagraphByPrefix = (
  paragraphs: HTMLParagraphElement[],
  prefix: string,
): HTMLParagraphElement => {
  const match = paragraphs.find((paragraph) => paragraph.textContent.startsWith(prefix));
  if (!match) {
    throw new Error(`No paragraph found starting with "${prefix}"`);
  }
  return match;
};

describe('RsvpSection', () => {
  it('rendersTheRecuerdaTitleImageWithAnAccessibleName', () => {
    render(<RsvpSection />);

    expect(screen.getByRole('img', { name: remindersCopy.titleAlt })).toBeInTheDocument();
  });

  it('rendersBothReminderParagraphsWithTheEmphasizedPhraseInStrong', () => {
    const { container } = render(<RsvpSection />);

    const paragraphs = [...container.querySelectorAll('p')];
    const adultsParagraph = getParagraphByPrefix(paragraphs, remindersCopy.adultsOnly.prefix);
    const giftParagraph = getParagraphByPrefix(paragraphs, remindersCopy.envelopeGift.prefix);

    expect(adultsParagraph.querySelector('strong')).toHaveTextContent(
      remindersCopy.adultsOnly.emphasis,
    );
    expect(giftParagraph.querySelector('strong')).toHaveTextContent(
      remindersCopy.envelopeGift.emphasis,
    );
  });

  it('rendersBothIllustrationsAsDecorativeWithDimensionsToAvoidLayoutShift', () => {
    const { container } = render(<RsvpSection />);

    const illustrations = container.querySelectorAll('img[aria-hidden="true"]');
    expect(illustrations).toHaveLength(2);
    for (const illustration of illustrations) {
      expect(illustration).toHaveAttribute('alt', '');
      expect(illustration).toHaveAttribute('width');
      expect(illustration).toHaveAttribute('height');
      expect(illustration).toHaveAttribute('loading', 'lazy');
    }
  });
});
