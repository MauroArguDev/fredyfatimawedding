export const adminGuestInviteCopy = {
  sendButton: 'Enviar invitación',
  copyButton: 'Copiar enlace',
  copySuccess: 'Enlace copiado.',
  copyError: 'No se pudo copiar el enlace.',
  invitedColumn: 'Invitación',
  invitedYes: 'Enviada',
  invitedNo: 'No enviada',
} as const;

export function buildGuestInviteMessage(firstName: string, link: string): string {
  return `Hola ${firstName}, aquí tienes tu invitación a la boda de Fredy y Fátima: ${link}`;
}
