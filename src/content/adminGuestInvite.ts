export const adminGuestInviteCopy = {
  sendButton: 'Enviar invitación',
  copyButton: 'Copiar enlace',
  copySuccess: 'Enlace copiado.',
  copyError: 'No se pudo copiar el enlace.',
  invitedColumn: 'Invitación',
  invitedYes: 'Enviada',
  invitedNo: 'No enviada',
} as const;

const RSVP_DEADLINE_LABEL = '25 de Octubre';

function formatReservedSpotsLabel(guestLimit: number): string {
  return guestLimit === 1 ? 'lugar reservado' : 'lugares reservados';
}

function formatGreetingLine(firstName: string, lastName: string | null): string {
  return lastName !== null && lastName.length > 0 ? `${firstName} y ${lastName}!` : `${firstName}!`;
}

export function buildGuestInviteMessage(
  firstName: string,
  lastName: string | null,
  link: string,
  guestLimit: number,
): string {
  return `${formatGreetingLine(firstName, lastName)}
Estamos muy emocionados de celebrar este día tan especial! ✨☺️
Queremos compartirlo contigo y hacer de este momento un recuerdo inolvidable. 🤍

 Todos los detalles están en el siguiente enlace:
${link}
¡Tenemos ${String(guestLimit)} ${formatReservedSpotsLabel(guestLimit)} especialmente para ti! 🤍
Ayúdanos a preparar todo confirmando tu asistencia antes del ${RSVP_DEADLINE_LABEL}!

¡Nos encantará celebrar contigo! ✨`;
}
