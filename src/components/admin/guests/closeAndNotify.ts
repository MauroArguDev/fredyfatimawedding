import { toast } from 'sonner';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { AdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';

export function closeWhenClosed(onClose: () => void): (open: boolean) => void {
  return (open) => {
    if (!open) {
      onClose();
    }
  };
}

export function closeAndNotify(onClose: () => void, message: string): void {
  onClose();
  toast.success(message);
}

export function notifyOnSuccess(onClose: () => void, message: string): () => void {
  return () => {
    closeAndNotify(onClose, message);
  };
}

export function notifyOnError(): (error: unknown) => void {
  return (error) => {
    if (error instanceof AdminGuestsApiError && error.code === 'UNAUTHORIZED') {
      return;
    }

    const message = resolveAdminApiErrorMessage(error);

    if (message !== null) {
      toast.error(message);
    }
  };
}
