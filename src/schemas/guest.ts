import { z } from 'zod';

export const MIN_GUEST_LIMIT = 1;
export const MAX_GUEST_LIMIT = 20;
export const MAX_NAME_LENGTH = 60;
export const MAX_TITLE_LABEL_LENGTH = 120;
export const MAX_NOTES_LENGTH = 500;
export const TOKEN_LENGTH = 21;

const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be E.164, for example +50370000000');

const guestLimitSchema = z.number().int().min(MIN_GUEST_LIMIT).max(MAX_GUEST_LIMIT);

export const createGuestSchema = z.object({
  firstName: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  lastName: z.string().trim().max(MAX_NAME_LENGTH).nullable().default(null),
  titleLabel: z.string().trim().max(MAX_TITLE_LABEL_LENGTH).nullable().default(null),
  guestLimit: guestLimitSchema,
  phone: phoneSchema,
  notes: z.string().trim().max(MAX_NOTES_LENGTH).nullable().default(null),
});

export const updateGuestSchema = createGuestSchema
  .extend({
    confirmed: z.boolean(),
    confirmedCount: z.number().int().min(0).max(MAX_GUEST_LIMIT),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const rsvpRequestSchema = z.object({
  token: z.string().length(TOKEN_LENGTH),
  count: z.number().int().min(MIN_GUEST_LIMIT).max(MAX_GUEST_LIMIT),
});

export const guestSchema = createGuestSchema.extend({
  token: z.string().length(TOKEN_LENGTH),
  confirmed: z.boolean(),
  confirmedCount: z.number().int().min(0),
  confirmedAt: z.date().nullable(),
  firstOpenedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const adminGuestSchema = guestSchema.extend({
  id: z.string(),
  confirmedAt: z.coerce.date().nullable(),
  firstOpenedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const guestStatsSchema = z.object({
  total: z.number().int().min(0),
  confirmed: z.number().int().min(0),
  pending: z.number().int().min(0),
  openedNotConfirmed: z.number().int().min(0),
  totalConfirmedPeople: z.number().int().min(0),
});

export const adminGuestListResponseSchema = z.object({
  guests: z.array(adminGuestSchema),
  stats: guestStatsSchema,
});

export type AdminGuest = z.infer<typeof adminGuestSchema>;
export type AdminGuestListResponse = z.infer<typeof adminGuestListResponseSchema>;

export const publicInvitationSchema = z.object({
  titleLabel: z.string().nullable(),
  firstName: z.string(),
  guestLimit: guestLimitSchema,
  confirmed: z.boolean(),
  confirmedCount: z.number().int().min(0),
  rsvpOpen: z.boolean(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type RsvpRequest = z.infer<typeof rsvpRequestSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type PublicInvitation = z.infer<typeof publicInvitationSchema>;

export function fitsWithinGuestLimit(count: number, guestLimit: number): boolean {
  return Number.isInteger(count) && count >= MIN_GUEST_LIMIT && count <= guestLimit;
}

export function guestLimitCoversConfirmedCount(
  guestLimit: number,
  confirmedCount: number,
): boolean {
  return confirmedCount <= guestLimit;
}

export function resolveDisplayName(
  guest: Pick<Guest, 'titleLabel' | 'firstName' | 'lastName'>,
): string {
  if (guest.titleLabel !== null && guest.titleLabel.length > 0) {
    return guest.titleLabel;
  }

  return [guest.firstName, guest.lastName]
    .filter((part) => part !== null && part.length > 0)
    .join(' ');
}

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  openedNotConfirmed: number;
  totalConfirmedPeople: number;
}

type GuestStatsInput = Pick<Guest, 'confirmed' | 'confirmedCount' | 'firstOpenedAt'>;

const EMPTY_GUEST_STATS: GuestStats = {
  total: 0,
  confirmed: 0,
  pending: 0,
  openedNotConfirmed: 0,
  totalConfirmedPeople: 0,
};

function addGuestToStats(stats: GuestStats, guest: GuestStatsInput): GuestStats {
  return {
    total: stats.total + 1,
    confirmed: stats.confirmed + (guest.confirmed ? 1 : 0),
    pending: stats.pending + (guest.confirmed ? 0 : 1),
    openedNotConfirmed:
      stats.openedNotConfirmed + (!guest.confirmed && guest.firstOpenedAt !== null ? 1 : 0),
    totalConfirmedPeople: stats.totalConfirmedPeople + (guest.confirmed ? guest.confirmedCount : 0),
  };
}

export function computeGuestStats(guests: readonly GuestStatsInput[]): GuestStats {
  return guests.reduce(addGuestToStats, EMPTY_GUEST_STATS);
}
