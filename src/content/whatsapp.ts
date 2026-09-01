export interface RsvpConfirmationMessageInput {
  firstName: string;
  lastName: string | null;
  count: number;
}

export function buildRsvpConfirmationMessage({ firstName, lastName, count }: RsvpConfirmationMessageInput): string {
  const guestName = [firstName, lastName]
    .filter((part): part is string => part !== null && part.length > 0)
    .join(' ');

  return `Hola, soy ${guestName}. Confirmo mi asistencia a la boda con ${String(count)} personas.`;
}
