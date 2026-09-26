const NON_DIGIT_PATTERN = /\D/g;

export const buildWhatsAppDeepLink = (phone: string, message: string): string =>
  `https://api.whatsapp.com/send/?phone=${phone.replace(NON_DIGIT_PATTERN, '')}&text=${encodeURIComponent(message)}`;
