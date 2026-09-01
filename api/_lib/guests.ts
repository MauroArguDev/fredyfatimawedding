import { nanoid } from 'nanoid';
import { Timestamp } from 'firebase-admin/firestore';
import { GUESTS_COLLECTION, firestore } from './firestore.js';
import {
  TOKEN_LENGTH,
  guestLimitCoversConfirmedCount,
  guestSchema,
} from '../../src/schemas/guest.js';
import type { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import type { CreateGuestInput, Guest, UpdateGuestInput } from '../../src/schemas/guest.js';

export interface GuestRecord {
  ref: DocumentReference;
  data: Guest;
}

export interface GuestListItem {
  id: string;
  data: Guest;
}

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function toDate(value: unknown): Date {
  if (!(value instanceof Timestamp)) {
    throw new Error('Expected a Firestore Timestamp field');
  }

  return value.toDate();
}

function parseGuestSnapshot(snapshot: DocumentSnapshot): Guest {
  const raw = snapshot.data() as Record<string, unknown> | undefined;

  if (raw === undefined) {
    throw new Error('Expected the Firestore document to exist');
  }

  return guestSchema.parse({
    ...raw,
    confirmedAt: toDateOrNull(raw.confirmedAt),
    firstOpenedAt: toDateOrNull(raw.firstOpenedAt),
    invitedAt: toDateOrNull(raw.invitedAt),
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  });
}

/**
 * Looks up a guest by their opaque invitation token. Returns null when no
 * guest matches, which every caller treats as a 404 (ADR-002: an altered
 * token simply does not exist).
 */
export async function findGuestByToken(token: string): Promise<GuestRecord | null> {
  const snapshot = await firestore()
    .collection(GUESTS_COLLECTION)
    .where('token', '==', token)
    .limit(1)
    .get();

  const doc = snapshot.docs[0];

  return doc === undefined ? null : { ref: doc.ref, data: parseGuestSnapshot(doc) };
}

export type ConfirmGuestOutcome = 'confirmed' | 'already-confirmed';

/**
 * Confirms a guest's RSVP inside a Firestore transaction that rereads
 * `confirmed`, so two concurrent submissions for the same token produce
 * exactly one confirmation (R2, ADR-006). Returns 'already-confirmed'
 * without writing when the guest had already confirmed by the time the
 * transaction runs.
 */
export async function confirmGuest(
  ref: DocumentReference,
  count: number,
  now: Date,
): Promise<ConfirmGuestOutcome> {
  return firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (snapshot.get('confirmed') === true) {
      return 'already-confirmed';
    }

    transaction.update(ref, {
      confirmed: true,
      confirmedCount: count,
      confirmedAt: now,
      updatedAt: now,
    });

    return 'confirmed';
  });
}

export async function getGuestById(id: string): Promise<GuestRecord | null> {
  const snapshot = await firestore().collection(GUESTS_COLLECTION).doc(id).get();

  return snapshot.exists ? { ref: snapshot.ref, data: parseGuestSnapshot(snapshot) } : null;
}

export async function listGuests(): Promise<GuestListItem[]> {
  const snapshot = await firestore().collection(GUESTS_COLLECTION).get();

  return snapshot.docs.map((doc) => ({ id: doc.id, data: parseGuestSnapshot(doc) }));
}

export async function createGuest(input: CreateGuestInput): Promise<GuestListItem> {
  const now = new Date();
  const document: Guest = {
    ...input,
    token: nanoid(TOKEN_LENGTH),
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: null,
    invitedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const ref = firestore().collection(GUESTS_COLLECTION).doc();

  await ref.set(document);

  return { id: ref.id, data: document };
}

export type UpdateGuestOutcome =
  | { ok: true; record: GuestRecord }
  | { ok: false; code: 'NOT_FOUND' }
  | { ok: false; code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT' };

/**
 * Applies a partial update to a guest. Rejects with
 * GUEST_LIMIT_BELOW_CONFIRMED_COUNT when the resulting guestLimit would be
 * lower than the resulting confirmedCount, whichever of the two the patch
 * actually changes (§6 WED-43): the invariant guestLimit >= confirmedCount
 * must hold for every write, not only for fields the caller happened to
 * touch.
 */
export async function updateGuest(
  id: string,
  patch: UpdateGuestInput,
): Promise<UpdateGuestOutcome> {
  const existing = await getGuestById(id);

  if (existing === null) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const nextGuestLimit = patch.guestLimit ?? existing.data.guestLimit;
  const nextConfirmedCount = patch.confirmedCount ?? existing.data.confirmedCount;

  if (!guestLimitCoversConfirmedCount(nextGuestLimit, nextConfirmedCount)) {
    return { ok: false, code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT' };
  }

  await existing.ref.update({ ...patch, updatedAt: new Date() });
  const updated = await existing.ref.get();

  return { ok: true, record: { ref: existing.ref, data: parseGuestSnapshot(updated) } };
}

export async function deleteGuestById(id: string): Promise<boolean> {
  const existing = await getGuestById(id);

  if (existing === null) {
    return false;
  }

  await existing.ref.delete();

  return true;
}

export async function rotateGuestToken(id: string): Promise<GuestRecord | null> {
  const existing = await getGuestById(id);

  if (existing === null) {
    return null;
  }

  await existing.ref.update({ token: nanoid(TOKEN_LENGTH), updatedAt: new Date() });
  const updated = await existing.ref.get();

  return { ref: existing.ref, data: parseGuestSnapshot(updated) };
}
