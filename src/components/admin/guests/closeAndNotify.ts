import { toast } from 'sonner';

export function closeAndNotify(onClose: () => void, message: string): void {
  onClose();
  toast.success(message);
}

export function notifyOnSuccess(onClose: () => void, message: string): () => void {
  return () => {
    closeAndNotify(onClose, message);
  };
}
