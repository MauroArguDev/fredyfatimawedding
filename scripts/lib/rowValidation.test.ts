import { describe, expect, it } from 'vitest';
import { validateExactHeader } from './rowValidation';

const EXPECTED = ['firstName', 'lastName', 'phone'];

describe('validateExactHeader', () => {
  it('returnsNullWhenTheHeaderMatchesExactly', () => {
    expect(validateExactHeader(['firstName', 'lastName', 'phone'], EXPECTED)).toBeNull();
  });

  it('reportsAMismatchedHeaderWithBothTheExpectedAndActualValues', () => {
    expect(validateExactHeader(['firstName', 'phone'], EXPECTED)).toBe(
      'Expected header "firstName,lastName,phone", got "firstName,phone"',
    );
  });

  it('treatsAMissingHeaderRowAsAMismatch', () => {
    expect(validateExactHeader(undefined, EXPECTED)).toBe(
      'Expected header "firstName,lastName,phone", got ""',
    );
  });
});
