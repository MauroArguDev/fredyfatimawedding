import { afterEach, describe, expect, it } from 'vitest';
import { isRsvpOpen } from './rsvpDeadline';

const ORIGINAL_DEADLINE = process.env.RSVP_DEADLINE;

afterEach(() => {
  if (ORIGINAL_DEADLINE === undefined) {
    delete process.env.RSVP_DEADLINE;
  } else {
    process.env.RSVP_DEADLINE = ORIGINAL_DEADLINE;
  }
});

describe('isRsvpOpen', () => {
  it('isOpenBeforeTheDeadline', () => {
    process.env.RSVP_DEADLINE = '2026-10-25T23:59:59-06:00';

    expect(isRsvpOpen(new Date('2026-10-25T00:00:00-06:00'))).toBe(true);
  });

  it('isOpenExactlyAtTheDeadline', () => {
    process.env.RSVP_DEADLINE = '2026-10-25T23:59:59-06:00';

    expect(isRsvpOpen(new Date('2026-10-25T23:59:59-06:00'))).toBe(true);
  });

  it('isClosedAfterTheDeadline', () => {
    process.env.RSVP_DEADLINE = '2026-10-25T23:59:59-06:00';

    expect(isRsvpOpen(new Date('2026-10-26T00:00:01-06:00'))).toBe(false);
  });

  it('throwsWhenTheEnvVarIsMissingSoAMisconfiguredDeployFailsLoudly', () => {
    delete process.env.RSVP_DEADLINE;

    expect(() => isRsvpOpen(new Date())).toThrow('Missing required environment variable');
  });

  it('throwsWhenTheEnvVarIsNotAParseableDate', () => {
    process.env.RSVP_DEADLINE = 'not-a-date';

    expect(() => isRsvpOpen(new Date())).toThrow('is not a valid date');
  });
});
