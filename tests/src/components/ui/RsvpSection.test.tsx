import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RsvpSection } from '@/components/ui/RsvpSection';
import { InvitationProvider } from '@/hooks/InvitationProvider';
import type { InvitationContextValue } from '@/hooks/invitationContext';
import { remindersCopy } from '@/content/reminders';
import { rsvpAlreadyConfirmedCopy, rsvpClosedCopy, rsvpDeadlineCopy } from '@/content/rsvp';

const TOKEN = 'V1StGXR8_Z5jdHi6B-myT';

const DEFAULT_CONTEXT: InvitationContextValue = {
  displayName: 'Invitado de Prueba',
  guestLimit: 3,
  confirmed: false,
  confirmedCount: 0,
  rsvpOpen: true,
};

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

function renderRsvpSection(contextOverrides: Partial<InvitationContextValue> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <InvitationProvider value={{ ...DEFAULT_CONTEXT, ...contextOverrides }}>
        <RsvpSection token={TOKEN} />
      </InvitationProvider>
    </QueryClientProvider>,
  );
}

describe('RsvpSection', () => {
  it('rendersTheRecuerdaTitleImageWithAnAccessibleName', () => {
    renderRsvpSection();

    expect(screen.getByRole('img', { name: remindersCopy.titleAlt })).toBeInTheDocument();
  });

  it('rendersBothReminderParagraphsWithTheEmphasizedPhraseInStrong', () => {
    const { container } = renderRsvpSection();

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

  it('rendersAllDecorativeIllustrationsWithDimensionsToAvoidLayoutShift', () => {
    const { container } = renderRsvpSection();

    const illustrations = container.querySelectorAll('img[aria-hidden="true"]');
    expect(illustrations).toHaveLength(3);
    for (const illustration of illustrations) {
      expect(illustration).toHaveAttribute('alt', '');
      expect(illustration).toHaveAttribute('width');
      expect(illustration).toHaveAttribute('height');
      expect(illustration).toHaveAttribute('loading', 'lazy');
    }
  });

  it('rendersTheDeadlineReminderTextsAfterTheForm', () => {
    renderRsvpSection();

    expect(screen.getByText(rsvpDeadlineCopy.confirmReminder)).toBeInTheDocument();
    expect(screen.getByText(rsvpDeadlineCopy.silenceMeansAbsence)).toBeInTheDocument();
  });

  it('rendersThePickerFormWhenTheGuestHasNotConfirmedAndRsvpIsOpen', () => {
    renderRsvpSection({ confirmed: false, rsvpOpen: true });

    expect(screen.getByRole('combobox', { name: /cantidad/i })).toBeInTheDocument();
  });

  it('rendersTheAlreadyConfirmedStateInsteadOfTheFormWhenConfirmedIsTrue', () => {
    renderRsvpSection({ confirmed: true, confirmedCount: 2 });

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText(rsvpAlreadyConfirmedCopy.heading)).toBeInTheDocument();
  });

  it('rendersTheClosedStateInsteadOfTheFormWhenRsvpOpenIsFalse', () => {
    renderRsvpSection({ confirmed: false, rsvpOpen: false });

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText(rsvpClosedCopy.heading)).toBeInTheDocument();
  });
});
