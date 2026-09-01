import { Timestamp } from 'firebase-admin/firestore';
import { GUESTS_COLLECTION, firestore } from './firestore';
import { guestSchema } from '../../src/schemas/guest';
import type { DocumentReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { Guest } from '../../src/schemas/guest';

export interface GuestRecord {
  ref: DocumentReference;
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

function parseGuestSnapshot(snapshot: QueryDocumentSnapshot): Guest {
  const raw = snapshot.data() as Record<string, unknown>;

  return guestSchema.parse({
    ...raw,
    confirmedAt: toDateOrNull(raw.confirmedAt),
    firstOpenedAt: toDateOrNull(raw.firstOpenedAt),
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
export async function confirmGuest(ref: DocumentReference, count: number, now: Date): Promise<ConfirmGuestOutcome> {
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
