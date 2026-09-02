import { Timestamp } from 'firebase-admin/firestore';
import { describe, expect, it, vi } from 'vitest';
import { TOKEN_LENGTH } from '../../src/schemas/guest';
import { firestore } from './firestore';
import {
  confirmGuest,
  createGuest,
  deleteGuestById,
  findGuestByToken,
  getGuestById,
  importGuests,
  listGuests,
  rotateGuestToken,
  updateGuest,
} from './guests';
import type { CreateGuestInput } from '../../src/schemas/guest';
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
        data: () => ({
          ...validGuestData,
          confirmed: true,
          confirmedCount: 2,
          confirmedAt: CREATED_AT,
          firstOpenedAt: CREATED_AT,
        }),
      },
    ]);

    const result = await findGuestByToken(validGuestData.token);

    expect(result?.data.confirmed).toBe(true);
    expect(result?.data.confirmedAt).toEqual(CREATED_AT.toDate());
    expect(result?.data.firstOpenedAt).toEqual(CREATED_AT.toDate());
  });

  it('throwsWhenCreatedAtIsNotAFirestoreTimestampBecauseTheDataIsCorrupt', async () => {
    mockFirestoreQuery([
      { ref: { id: 'abc' }, data: () => ({ ...validGuestData, createdAt: 'not-a-timestamp' }) },
    ]);

    await expect(findGuestByToken(validGuestData.token)).rejects.toThrow(
      'Expected a Firestore Timestamp field',
    );
  });
});

function mockFirestoreTransaction(confirmed: boolean): { update: ReturnType<typeof vi.fn> } {
  const update = vi.fn();
  const transactionGet = vi.fn().mockResolvedValue({
    get: (field: string) => (field === 'confirmed' ? confirmed : undefined),
  });
  const runTransaction = vi.fn(
    async (
      callback: (transaction: {
        get: typeof transactionGet;
        update: typeof update;
      }) => Promise<unknown>,
    ) => callback({ get: transactionGet, update }),
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

interface FakeDocRef {
  id: string;
  get: () => Promise<{
    id: string;
    exists: boolean;
    ref: FakeDocRef;
    data: () => Record<string, unknown> | undefined;
  }>;
  set: (value: Record<string, unknown>) => Promise<void>;
  update: (patch: Record<string, unknown>) => Promise<void>;
  delete: () => Promise<void>;
}

function convertDatesToTimestamps(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      value instanceof Date ? Timestamp.fromDate(value) : value,
    ]),
  );
}

function buildFakeGuestsCollection(initialDocs: Record<string, Record<string, unknown>> = {}): {
  collection: unknown;
  store: Map<string, Record<string, unknown>>;
} {
  const store = new Map(Object.entries(initialDocs));
  let nextGeneratedId = 0;

  function docRefFor(id: string): FakeDocRef {
    return {
      id,
      get: () =>
        Promise.resolve({
          id,
          exists: store.has(id),
          ref: docRefFor(id),
          data: () => store.get(id),
        }),
      set: (value) => {
        store.set(id, convertDatesToTimestamps(value));
        return Promise.resolve();
      },
      update: (patch) => {
        store.set(id, { ...store.get(id), ...convertDatesToTimestamps(patch) });
        return Promise.resolve();
      },
      delete: () => {
        store.delete(id);
        return Promise.resolve();
      },
    };
  }

  const collection = {
    doc: (id?: string) => docRefFor(id ?? `generated-${String(nextGeneratedId++)}`),
    get: () =>
      Promise.resolve({
        docs: [...store.keys()].map((id) => ({
          id,
          ref: docRefFor(id),
          data: () => store.get(id),
        })),
      }),
  };

  return { collection, store };
}

function useFakeGuestsCollection(initialDocs: Record<string, Record<string, unknown>> = {}) {
  const fake = buildFakeGuestsCollection(initialDocs);

  vi.mocked(firestore).mockReturnValue({
    collection: () => fake.collection,
  } as unknown as Firestore);

  return fake;
}

const storedGuest = { ...validGuestData };

describe('getGuestById', () => {
  it('returnsTheGuestWhenTheDocumentExists', async () => {
    useFakeGuestsCollection({ abc: storedGuest });

    const result = await getGuestById('abc');

    expect(result?.data.firstName).toBe('Orlando');
  });

  it('returnsNullWhenTheDocumentDoesNotExist', async () => {
    useFakeGuestsCollection({});

    await expect(getGuestById('missing')).resolves.toBeNull();
  });
});

describe('listGuests', () => {
  it('returnsEveryGuestWithItsDocumentId', async () => {
    useFakeGuestsCollection({ abc: storedGuest, def: { ...storedGuest, firstName: 'Fátima' } });

    const result = await listGuests();

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.id).sort()).toEqual(['abc', 'def']);
  });

  it('returnsAnEmptyListWhenThereAreNoGuests', async () => {
    useFakeGuestsCollection({});

    await expect(listGuests()).resolves.toEqual([]);
  });
});

describe('createGuest', () => {
  const input: CreateGuestInput = {
    firstName: 'Orlando',
    lastName: null,
    titleLabel: null,
    guestLimit: 2,
    phone: '+50370000000',
    notes: null,
  };

  it('generatesATokenAndAppliesDefaultsBeforeWriting', async () => {
    const fake = useFakeGuestsCollection();

    const created = await createGuest(input);

    expect(created.data.token).toHaveLength(TOKEN_LENGTH);
    expect(created.data.confirmed).toBe(false);
    expect(created.data.confirmedCount).toBe(0);
    expect(fake.store.get(created.id)).toMatchObject({ firstName: 'Orlando', confirmed: false });
  });
});

describe('importGuests', () => {
  function mockImportFirestore(existingPhones: string[]): {
    batchSets: unknown[];
    commit: ReturnType<typeof vi.fn>;
  } {
    const batchSets: unknown[] = [];
    const commit = vi.fn().mockResolvedValue(undefined);
    const collection = {
      select: () => ({
        get: () =>
          Promise.resolve({
            docs: existingPhones.map((phone) => ({ get: () => phone })),
          }),
      }),
      doc: () => ({}),
    };

    vi.mocked(firestore).mockReturnValue({
      collection: () => collection,
      batch: () => ({
        set: (_ref: unknown, value: unknown) => {
          batchSets.push(value);
        },
        commit,
      }),
    } as unknown as Firestore);

    return { batchSets, commit };
  }

  const guestA: CreateGuestInput = {
    firstName: 'Orlando',
    lastName: null,
    titleLabel: null,
    guestLimit: 2,
    phone: '+50370000000',
    notes: null,
  };
  const guestB: CreateGuestInput = {
    firstName: 'Fátima',
    lastName: null,
    titleLabel: null,
    guestLimit: 1,
    phone: '+50370000001',
    notes: null,
  };

  it('createsEveryGuestWhenNonePhoneAlreadyExists', async () => {
    const fake = mockImportFirestore([]);

    const result = await importGuests([guestA, guestB]);

    expect(result).toEqual({ imported: 2, skipped: 0 });
    expect(fake.batchSets).toHaveLength(2);
    expect(fake.commit).toHaveBeenCalledTimes(1);
  });

  it('skipsGuestsWhosePhoneAlreadyExistsAndDoesNotOverwriteThem', async () => {
    const fake = mockImportFirestore([guestA.phone]);

    const result = await importGuests([guestA, guestB]);

    expect(result).toEqual({ imported: 1, skipped: 1 });
    expect(fake.batchSets).toEqual([expect.objectContaining({ firstName: 'Fátima' })]);
  });

  it('doesNotCommitTheBatchWhenEveryGuestIsAlreadyPresent', async () => {
    const fake = mockImportFirestore([guestA.phone]);

    await importGuests([guestA]);

    expect(fake.commit).not.toHaveBeenCalled();
  });
});

describe('updateGuest', () => {
  it('returnsNotFoundWhenTheGuestDoesNotExist', async () => {
    useFakeGuestsCollection({});

    const outcome = await updateGuest('missing', {});

    expect(outcome).toEqual({ ok: false, code: 'NOT_FOUND' });
  });

  it('rejectsLoweringGuestLimitBelowTheExistingConfirmedCount', async () => {
    useFakeGuestsCollection({ abc: { ...storedGuest, confirmed: true, confirmedCount: 3 } });

    const outcome = await updateGuest('abc', { guestLimit: 2 });

    expect(outcome).toEqual({ ok: false, code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT' });
  });

  it('rejectsARequestThatLowersBothFieldsInconsistently', async () => {
    useFakeGuestsCollection({ abc: { ...storedGuest, confirmed: true, confirmedCount: 3 } });

    const outcome = await updateGuest('abc', { guestLimit: 2, confirmedCount: 3 });

    expect(outcome).toEqual({ ok: false, code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT' });
  });

  it('allowsLoweringGuestLimitWhenConfirmedCountIsLoweredInTheSameRequest', async () => {
    useFakeGuestsCollection({ abc: { ...storedGuest, confirmed: true, confirmedCount: 3 } });

    const outcome = await updateGuest('abc', { guestLimit: 2, confirmedCount: 2 });

    expect(outcome.ok).toBe(true);
  });

  it('appliesThePatchAndUpdatesUpdatedAt', async () => {
    const fake = useFakeGuestsCollection({ abc: storedGuest });

    const outcome = await updateGuest('abc', { notes: 'called them to confirm' });

    expect(outcome.ok).toBe(true);
    expect(fake.store.get('abc')).toMatchObject({ notes: 'called them to confirm' });
  });
});

describe('deleteGuestById', () => {
  it('deletesAnExistingGuestAndReturnsTrue', async () => {
    const fake = useFakeGuestsCollection({ abc: storedGuest });

    await expect(deleteGuestById('abc')).resolves.toBe(true);
    expect(fake.store.has('abc')).toBe(false);
  });

  it('returnsFalseWhenTheGuestDoesNotExist', async () => {
    useFakeGuestsCollection({});

    await expect(deleteGuestById('missing')).resolves.toBe(false);
  });
});

describe('rotateGuestToken', () => {
  it('replacesTheTokenWithANewOneOfTheSameLength', async () => {
    useFakeGuestsCollection({ abc: storedGuest });

    const result = await rotateGuestToken('abc');

    expect(result?.data.token).toHaveLength(TOKEN_LENGTH);
    expect(result?.data.token).not.toBe(storedGuest.token);
  });

  it('returnsNullWhenTheGuestDoesNotExist', async () => {
    useFakeGuestsCollection({});

    await expect(rotateGuestToken('missing')).resolves.toBeNull();
  });
});
