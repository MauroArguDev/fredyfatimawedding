import { describe, expect, it, vi } from 'vitest';
import { closeAndNotify, notifyOnSuccess } from '@/components/admin/guests/closeAndNotify';

const { toastSuccessMock } = vi.hoisted(() => ({ toastSuccessMock: vi.fn() }));

vi.mock('sonner', () => ({ toast: { success: toastSuccessMock } }));

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
