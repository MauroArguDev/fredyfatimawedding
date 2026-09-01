import { Timestamp } from 'firebase-admin/firestore';
import { describe, expect, it, vi } from 'vitest';
import { firestore } from './firestore';
import { confirmGuest, findGuestByToken } from './guests';
import type { DocumentReference, Firestore } from 'firebase-admin/firestore';

vi.mock('./firestore', () => ({
  firestore: vi.fn(),
  GUESTS_COLLECTION: 'guests',
}));

const CREATED_AT = Timestamp.fromDate(new Date('2026-01-01T00:00:00Z'));

const validGuestData = {
  firstName: 'Orlando',
  lastName: null,
  titleLabel: 'Tío Orlando y Familia.',
  guestLimit: 3,
  phone: '+50370000000',
  notes: null,
  token: 'V1StGXR8_Z5jdHi6B-myT',
  confirmed: false,
  confirmedCount: 0,
  confirmedAt: null,
  firstOpenedAt: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

function mockFirestoreQuery(docs: { ref: unknown; data: () => unknown }[]): void {
  const get = vi.fn().mockResolvedValue({ docs });
  const limit = vi.fn(() => ({ get }));
  const where = vi.fn(() => ({ limit }));
  const collection = vi.fn(() => ({ where }));

  vi.mocked(firestore).mockReturnValue({ collection } as unknown as Firestore);
}

describe('findGuestByToken', () => {
  it('returnsNullWhenNoGuestMatchesTheToken', async () => {
    mockFirestoreQuery([]);

    await expect(findGuestByToken('missing-token')).resolves.toBeNull();
  });

  it('parsesFirestoreTimestampsIntoDatesForAMatchingGuest', async () => {
    mockFirestoreQuery([{ ref: { id: 'abc' }, data: () => validGuestData }]);

    const result = await findGuestByToken(validGuestData.token);

    expect(result?.data.createdAt).toEqual(CREATED_AT.toDate());
    expect(result?.data.updatedAt).toEqual(CREATED_AT.toDate());
    expect(result?.ref).toEqual({ id: 'abc' });
  });

  it('resolvesNullTimestampFieldsToNullInsteadOfThrowing', async () => {
    mockFirestoreQuery([{ ref: { id: 'abc' }, data: () => validGuestData }]);

    const result = await findGuestByToken(validGuestData.token);

    expect(result?.data.confirmedAt).toBeNull();
    expect(result?.data.firstOpenedAt).toBeNull();
  });

  it('resolvesConfirmedTimestampsWhenTheGuestAlreadyConfirmed', async () => {
    mockFirestoreQuery([
      {
        ref: { id: 'abc' },
        data: () => ({ ...validGuestData, confirmed: true, confirmedCount: 2, confirmedAt: CREATED_AT, firstOpenedAt: CREATED_AT }),
      },
    ]);

    const result = await findGuestByToken(validGuestData.token);

    expect(result?.data.confirmed).toBe(true);
    expect(result?.data.confirmedAt).toEqual(CREATED_AT.toDate());
    expect(result?.data.firstOpenedAt).toEqual(CREATED_AT.toDate());
  });

  it('throwsWhenCreatedAtIsNotAFirestoreTimestampBecauseTheDataIsCorrupt', async () => {
    mockFirestoreQuery([{ ref: { id: 'abc' }, data: () => ({ ...validGuestData, createdAt: 'not-a-timestamp' }) }]);

    await expect(findGuestByToken(validGuestData.token)).rejects.toThrow('Expected a Firestore Timestamp field');
  });
});

function mockFirestoreTransaction(confirmed: boolean): { update: ReturnType<typeof vi.fn> } {
  const update = vi.fn();
  const transactionGet = vi.fn().mockResolvedValue({
    get: (field: string) => (field === 'confirmed' ? confirmed : undefined),
  });
  const runTransaction = vi.fn(
    async (callback: (transaction: { get: typeof transactionGet; update: typeof update }) => Promise<unknown>) =>
      callback({ get: transactionGet, update }),
  );

  vi.mocked(firestore).mockReturnValue({ runTransaction } as unknown as Firestore);

  return { update };
}

describe('confirmGuest', () => {
  const ref = { id: 'abc' } as unknown as DocumentReference;
  const now = new Date('2026-09-01T00:00:00Z');

  it('writesConfirmedCountAndConfirmedAtWhenTheGuestHadNotConfirmedYet', async () => {
    const { update } = mockFirestoreTransaction(false);

    const outcome = await confirmGuest(ref, 3, now);

    expect(outcome).toBe('confirmed');
    expect(update).toHaveBeenCalledWith(ref, {
      confirmed: true,
      confirmedCount: 3,
      confirmedAt: now,
      updatedAt: now,
    });
  });

  it('rejectsConcurrentConfirmationsSoOnlyOneSucceeds', async () => {
    const { update } = mockFirestoreTransaction(true);

    const outcome = await confirmGuest(ref, 3, now);

    expect(outcome).toBe('already-confirmed');
    expect(update).not.toHaveBeenCalled();
  });
});
