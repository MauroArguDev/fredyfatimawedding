const RSVP_DEADLINE_ENV_VAR = 'RSVP_DEADLINE';

function readDeadline(): Date {
  const raw = process.env[RSVP_DEADLINE_ENV_VAR];

  if (raw === undefined || raw.length === 0) {
    throw new Error(`Missing required environment variable: ${RSVP_DEADLINE_ENV_VAR}`);
  }

  const deadline = new Date(raw);

  if (Number.isNaN(deadline.getTime())) {
    throw new Error(`${RSVP_DEADLINE_ENV_VAR} is not a valid date: ${raw}`);
  }

  return deadline;
}

/**
 * Whether RSVP submissions are still accepted at the given instant.
 * RSVP_DEADLINE carries its America/El_Salvador offset (UTC-6, no daylight
 * saving) in the ISO string itself, so a plain Date comparison is correct
 * regardless of the server's own timezone.
 */
export function isRsvpOpen(now: Date): boolean {
  return now.getTime() <= readDeadline().getTime();
}
