import { afterEach, describe, expect, it } from 'vitest';
import { buildWhatsAppLink } from './whatsapp';

const ORIGINAL_BRIDE_WHATSAPP = process.env.BRIDE_WHATSAPP;

afterEach(() => {
  if (ORIGINAL_BRIDE_WHATSAPP === undefined) {
    delete process.env.BRIDE_WHATSAPP;
  } else {
    process.env.BRIDE_WHATSAPP = ORIGINAL_BRIDE_WHATSAPP;
  }
});

describe('buildWhatsAppLink', () => {
  it('buildsAWaMeLinkWithTheUrlEncodedMessage', () => {
    process.env.BRIDE_WHATSAPP = '50376982534';

    expect(buildWhatsAppLink('Hola, soy Orlando. Confirmo mi asistencia a la boda con 3 personas.')).toBe(
      'https://wa.me/50376982534?text=Hola%2C%20soy%20Orlando.%20Confirmo%20mi%20asistencia%20a%20la%20boda%20con%203%20personas.',
    );
  });

  it('throwsWhenBrideWhatsappIsMissing', () => {
    delete process.env.BRIDE_WHATSAPP;

    expect(() => buildWhatsAppLink('any message')).toThrow('Missing required environment variable');
  });
});
