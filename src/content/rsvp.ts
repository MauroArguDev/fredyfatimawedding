const BRIDE_WHATSAPP_NUMBER = '50376982534';
const GROOM_WHATSAPP_NUMBER = '50378260102';
const CHANGE_REQUEST_MESSAGE =
  'Hola, ya había confirmado mi asistencia y necesito hacer un cambio.';

export const brideWhatsAppLink = `https://wa.me/${BRIDE_WHATSAPP_NUMBER}?text=${encodeURIComponent(CHANGE_REQUEST_MESSAGE)}`;

const GROOM_FULL_NAME = 'Fredy Molina';
const BRIDE_FULL_NAME = 'Fatima Peña';

const buildConfirmationMessage = (recipientName: string): string =>
  `Hola ${recipientName}! Quiero confirmar mi asistencia a su boda. Sera un gusto celebrar con ustedes!`;

export const groomConfirmationWhatsAppLink = `https://wa.me/${GROOM_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildConfirmationMessage(GROOM_FULL_NAME))}`;

export const brideConfirmationWhatsAppLink = `https://wa.me/${BRIDE_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildConfirmationMessage(BRIDE_FULL_NAME))}`;

const formatPeopleLabel = (count: number): string => (count === 1 ? 'persona' : 'personas');

export const formatGuestCountOption = (count: number): string =>
  `${String(count)} ${formatPeopleLabel(count)}`;

export const formatGuestCountSummary = (count: number): string =>
  `Confirmaste ${String(count)} ${formatPeopleLabel(count)}.`;

export const rsvpDeadlineCopy = {
  confirmReminder:
    'Tu compañía es muy importante para nosotros, por favor confirma tu asistencia antes del 25 de octubre.',
  silenceMeansAbsence: '(De no recibir respuesta, asumimos que no podrás acompañarnos)',
} as const;

export const rsvpPickerCopy = {
  instruction: 'Elige la cantidad de personas que asistirán',
  placeholder: 'Selecciona',
} as const;

export const rsvpFormCopy = {
  submitLabel: 'Confirmar',
  countRequiredError: 'Selecciona cuántas personas asistirán.',
} as const;

export const rsvpConfirmModalCopy = {
  titleId: 'rsvp-confirm-modal-title',
  title: '¿Confirmas tu asistencia?',
  body: (count: number): string =>
    `Vas a confirmar ${String(count)} ${formatPeopleLabel(count)}. Esta acción no se puede deshacer.`,
  confirmLabel: 'Sí, confirmar',
  confirmingLabel: 'Confirmando…',
  cancelLabel: 'Volver',
} as const;

export const rsvpAlreadyConfirmedCopy = {
  heading: 'Ya confirmaste tu asistencia',
  message:
    'Ya confirmaste tu asistencia, en caso de querer hacer un cambio ponte en contacto con los novios por medio de Whatsapp',
  contactLinkLabel: 'Escribir por WhatsApp',
} as const;

export const rsvpClosedCopy = {
  heading: 'El plazo para confirmar ya cerró',
  message:
    'El período para confirmar asistencia ya finalizó. Si necesitas avisarnos algo, escríbenos por WhatsApp.',
} as const;

export const rsvpSuccessCopy = {
  titleId: 'rsvp-success-modal-title',
  heading: '¡Gracias por confirmar!',
  notifyGroomLabel: 'Avisar a Fredy por WhatsApp',
  notifyBrideLabel: 'Avisar a Fátima por WhatsApp',
  closeLabel: 'Cerrar',
} as const;

export const rsvpErrorMessages = {
  INVALID_PAYLOAD: rsvpFormCopy.countRequiredError,
  COUNT_OUT_OF_RANGE: 'La cantidad seleccionada supera tu límite de invitados.',
  TOKEN_NOT_FOUND: 'No pudimos encontrar tu invitación. Recarga la página e intenta de nuevo.',
  ALREADY_CONFIRMED: rsvpAlreadyConfirmedCopy.message,
  RSVP_CLOSED: rsvpClosedCopy.message,
  RATE_LIMITED: 'Demasiados intentos. Espera un momento e intenta de nuevo.',
  NETWORK_ERROR: 'No pudimos enviar tu confirmación. Intenta de nuevo.',
} as const;
