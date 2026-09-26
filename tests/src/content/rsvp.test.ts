import { describe, expect, it } from 'vitest';
import { brideConfirmationWhatsAppLink, groomConfirmationWhatsAppLink } from '@/content/rsvp';

const readMessageText = (link: string): string => new URL(link).searchParams.get('text') ?? '';

describe('confirmation WhatsApp links', () => {
  it.each([
    ['groom', groomConfirmationWhatsAppLink],
    ['bride', brideConfirmationWhatsAppLink],
  ])(
    'usesOnlyStandaloneEmojiBecauseWhatsAppBreaksSkinTonesVariationSelectorsAndJoiners (%s)',
    (_recipient, link) => {
      expect(readMessageText(link)).not.toMatch(/️|‍|[\u{1F3FB}-\u{1F3FF}]/u);
    },
  );
});
