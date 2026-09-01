import { describe, expect, it } from 'vitest';
import { buildRsvpConfirmationMessage } from './whatsapp';

describe('buildRsvpConfirmationMessage', () => {
  it('includesTheFullNameAndCountForAGuestWithALastName', () => {
    expect(buildRsvpConfirmationMessage({ firstName: 'Orlando', lastName: 'Martínez', count: 3 })).toBe(
      'Hola, soy Orlando Martínez. Confirmo mi asistencia a la boda con 3 personas.',
    );
  });

  it('omitsTheTrailingSpaceWhenThereIsNoLastName', () => {
    expect(buildRsvpConfirmationMessage({ firstName: 'Orlando', lastName: null, count: 1 })).toBe(
      'Hola, soy Orlando. Confirmo mi asistencia a la boda con 1 personas.',
    );
  });
});
