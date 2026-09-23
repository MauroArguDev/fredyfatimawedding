import { describe, expect, it } from 'vitest';
import {
  editGuestFormSchema,
  guestFormSchema,
  toCreateGuestInput,
  toUpdateGuestInput,
} from '@/components/admin/guests/guestFormSchema';

const validValues = {
  firstName: 'Orlando',
  lastName: '',
  titleLabel: '',
  guestLimit: 3,
  phone: '+50370000000',
};

describe('guestFormSchema', () => {
  it('acceptsValidFormValues', () => {
    expect(guestFormSchema.safeParse(validValues).success).toBe(true);
  });

  it('rejectsAnEmptyFirstName', () => {
    expect(guestFormSchema.safeParse({ ...validValues, firstName: '' }).success).toBe(false);
  });

  it('rejectsAPhoneThatIsNotE164', () => {
    expect(guestFormSchema.safeParse({ ...validValues, phone: '7000-0000' }).success).toBe(false);
  });

  it('coercesTheGuestLimitFieldFromAStringToANumber', () => {
    const result = guestFormSchema.safeParse({ ...validValues, guestLimit: '5' });

    expect(result.success && result.data.guestLimit).toBe(5);
  });
});

describe('editGuestFormSchema', () => {
  it('rejectsAGuestLimitBelowTheConfirmedCount', () => {
    const result = editGuestFormSchema.safeParse({
      ...validValues,
      guestLimit: 1,
      confirmedCount: 2,
    });

    expect(result.success).toBe(false);
  });

  it('acceptsAGuestLimitEqualToTheConfirmedCount', () => {
    const result = editGuestFormSchema.safeParse({
      ...validValues,
      guestLimit: 2,
      confirmedCount: 2,
    });

    expect(result.success).toBe(true);
  });
});

describe('toCreateGuestInput', () => {
  it('convertsEmptyStringsToNullForTheOptionalFields', () => {
    const input = toCreateGuestInput(validValues);

    expect(input).toEqual({
      firstName: 'Orlando',
      lastName: null,
      titleLabel: null,
      guestLimit: 3,
      phone: '+50370000000',
    });
  });

  it('keepsNonEmptyOptionalValuesAsStrings', () => {
    const input = toCreateGuestInput({ ...validValues, lastName: 'Martínez' });

    expect(input.lastName).toBe('Martínez');
  });
});

describe('toUpdateGuestInput', () => {
  it('addsConfirmedCountOnTopOfTheCreateFields', () => {
    const input = toUpdateGuestInput({ ...validValues, confirmedCount: 2 });

    expect(input.confirmedCount).toBe(2);
    expect(input.firstName).toBe('Orlando');
  });
});
