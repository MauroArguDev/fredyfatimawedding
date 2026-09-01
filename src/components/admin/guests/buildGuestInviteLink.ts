export function buildInvitationUrl(origin: string, token: string): string {
  return `${origin}/i/${token}`;
}

export function buildGuestWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace('+', '');

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
