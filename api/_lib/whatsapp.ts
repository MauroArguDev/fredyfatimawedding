import { readRequiredEnv } from './env.js';

const BRIDE_WHATSAPP_ENV_VAR = 'BRIDE_WHATSAPP';

/**
 * Builds the wa.me deep link a guest uses to notify the bride after a
 * successful RSVP (ADR-003: the console is the source of truth, this link
 * is a courtesy and may go unsent or be edited).
 */
export function buildWhatsAppLink(message: string): string {
  const phone = readRequiredEnv(BRIDE_WHATSAPP_ENV_VAR);

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
