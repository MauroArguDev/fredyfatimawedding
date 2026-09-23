import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  closeAndNotify,
  closeWhenClosed,
  notifyOnError,
  notifyOnSuccess,
} from '@/components/admin/guests/closeAndNotify';
import { AdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: { success: toastSuccessMock, error: toastErrorMock } }));

beforeEach(() => {
  toastSuccessMock.mockClear();
  toastErrorMock.mockClear();
});

describe('closeAndNotify', () => {
  it('closesTheDialogAndShowsTheSuccessToast', () => {
    const onClose = vi.fn();

    closeAndNotify(onClose, 'Invitado actualizado.');

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith('Invitado actualizado.');
  });
});

describe('notifyOnSuccess', () => {
  it('returnsACallbackThatClosesAndNotifiesWhenInvoked', () => {
    const onClose = vi.fn();
    const callback = notifyOnSuccess(onClose, 'Invitado eliminado.');

    expect(onClose).not.toHaveBeenCalled();

    callback();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith('Invitado eliminado.');
  });
});

describe('closeWhenClosed', () => {
  it('callsOnCloseWhenRadixReportsTheDialogClosed', () => {
    const onClose = vi.fn();

    closeWhenClosed(onClose)(false);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('doesNothingWhenRadixReportsTheDialogStillOpen', () => {
    const onClose = vi.fn();

    closeWhenClosed(onClose)(true);

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('notifyOnError', () => {
  it('showsAnErrorToastForARegularApiFailure', () => {
    notifyOnError()(new AdminGuestsApiError('NOT_FOUND'));

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
  });

  it('staysSilentForUnauthorizedBecauseFetchAdminApiAlreadyToastedIt', () => {
    notifyOnError()(new AdminGuestsApiError('UNAUTHORIZED'));

    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it('showsAnErrorToastForAnUnknownThrownValue', () => {
    notifyOnError()(new Error('boom'));

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
  });
});
